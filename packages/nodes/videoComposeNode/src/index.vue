<template>
  <nodeSkeleton v-bind="nodeProps" v-model:bottomVisible="node.selected" :topVisible="node.selected" topWidth="max-content" :bottomWidth="600" :downloadUrl="previewUrl" :downloadName="output?.url.split(/[\\/]/).at(-1)" :style="{ width: '300px' }" @fullscreen="player?.enterFullscreen()">
    <div class="composePreview">
      <div v-if="previewUrl" class="nodrag nopan nowheel" @pointerdown.stop><videoPlayer ref="player" :src="previewUrl" label="合成视频" /></div>
      <div v-else class="empty"><icon-movie :size="34" /><span>等待合成视频</span></div>
      <el-progress v-if="processing" :percentage="progress" :strokeWidth="4" />
      <p v-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>
    </div>
    <template #bottom>
      <el-card class="composePanel nodrag nopan nowheel" shadow="never" :bodyStyle="{ padding: '14px' }" @pointerdown.stop @dblclick.stop>
        <div class="header"><strong>视频片段</strong><el-button :icon="IconUpload" :disabled="busy" @click="videoInput?.click()">添加视频</el-button></div>
        <input ref="videoInput" type="file" accept="video/*,.mkv,.mov,.avi,.m4v,.ts" multiple hidden @change="uploadVideos" />
        <p v-if="!state.clips.length" class="hint">连接视频节点或添加视频</p>
        <div v-for="(clip, index) in state.clips" :key="clip.key" class="clipRow">
          <div class="clipTitle"><span>{{ index + 1 }}. {{ clip.name }}</span><div>
            <el-button :icon="IconArrowUp" text title="上移" aria-label="上移" :disabled="busy || index === 0" @click="move(index, -1)" />
            <el-button :icon="IconArrowDown" text title="下移" aria-label="下移" :disabled="busy || index === state.clips.length - 1" @click="move(index, 1)" />
            <el-button :icon="IconTrash" text title="移除" aria-label="移除" :disabled="busy" @click="removeClip(clip)" />
          </div></div>
          <div class="trimRow"><span>开始（秒）</span><el-input-number v-model="clip.start" :min="0" :step="0.1" :precision="2" :disabled="busy" controlsPosition="right" /><span>结束（秒）</span><el-input-number v-model="clip.end" :min="0" :step="0.1" :precision="2" :disabled="busy" controlsPosition="right" placeholder="结尾" /></div>
        </div>
        <div class="section"><div class="header"><strong>背景音频</strong><div><el-button :icon="IconUpload" :disabled="busy" @click="audioInput?.click()">{{ state.audio ? '更换' : '上传音频' }}</el-button><el-button v-if="state.audio" :icon="IconTrash" text title="移除音频" aria-label="移除音频" :disabled="busy" @click="state.audio = undefined" /></div></div>
          <input ref="audioInput" type="file" accept="audio/*,.mp3,.wav,.m4a,.aac,.flac,.ogg" hidden @change="uploadAudio" />
          <template v-if="state.audio"><p class="filename">{{ state.audio.name }}</p><el-radio-group v-model="state.audioMode" :disabled="busy"><el-radio-button value="mix">混合原声</el-radio-button><el-radio-button value="replace">替换原声</el-radio-button></el-radio-group></template>
          <div class="volumeRow"><span>原声音量</span><el-slider v-model="state.originalVolume" :min="0" :max="200" :disabled="busy || (!!state.audio && state.audioMode === 'replace')" /><span>{{ state.originalVolume }}%</span></div>
          <div v-if="state.audio" class="volumeRow"><span>背景音量</span><el-slider v-model="state.backgroundVolume" :min="0" :max="200" :disabled="busy" /><span>{{ state.backgroundVolume }}%</span></div>
        </div>
        <div class="section"><div class="header"><strong>字幕</strong><div><el-button :icon="IconUpload" :disabled="busy" @click="subtitleInput?.click()">{{ state.subtitle ? '更换' : '上传字幕' }}</el-button><el-button v-if="state.subtitle" :icon="IconTrash" text title="移除字幕" aria-label="移除字幕" :disabled="busy" @click="state.subtitle = undefined" /></div></div>
          <input ref="subtitleInput" type="file" accept=".srt,.ass" hidden @change="uploadSubtitle" />
          <template v-if="state.subtitle"><p class="filename">{{ state.subtitle.name }}</p><el-radio-group v-model="state.subtitleMode" :disabled="busy"><el-radio-button value="burn">烧录字幕</el-radio-button><el-radio-button value="track">可关闭字幕轨</el-radio-button></el-radio-group></template>
        </div>
        <div class="footer"><el-button v-if="processing" :icon="IconPlayerStop" :disabled="cancelling" @click="cancel">{{ cancelling ? '正在取消' : '取消合成' }}</el-button><el-button v-else type="primary" :icon="IconMovie" :disabled="busy || !state.clips.length" @click="start">合成视频</el-button></div>
      </el-card>
    </template>
  </nodeSkeleton>
</template>

<script setup lang="ts">
import { computed, inject, onScopeDispose, reactive, ref, watch } from "vue";
import { useVueFlow } from "@vue-flow/core";
import { IconMovie, IconUpload, IconArrowUp, IconArrowDown, IconTrash, IconPlayerStop } from "@tabler/icons-vue";
import { ElButton, ElCard, ElInputNumber, ElProgress, ElRadioButton, ElRadioGroup, ElSlider } from "element-plus";
import { nodeSkeleton, useNode, useNodeInputs, uploadNodeFile, type NodeHandle, type NodeMediaValue } from "@toonflow/nodes-scaffold/runtime";
import videoPlayer from "@toonflow/node-video/videoPlayer";
import { composeVideo } from "./composeVideo";

defineOptions({ inheritAttrs: false, icon: IconMovie, handles: [
  { id: "in", type: "target", dataType: "VIDEO", label: "视频素材" },
  { id: "video", type: "source", dataType: "VIDEO", label: "视频输出" },
] satisfies NodeHandle[] });

type Item = { key: string; name: string; path: string; start: number; end: number | null; source?: string; sourceHandle?: string };
type Asset = { path: string; name: string };
type State = { clips: Item[]; audio?: Asset; subtitle?: Asset; audioMode: "mix" | "replace"; subtitleMode: "burn" | "track"; originalVolume: number; backgroundVolume: number };
const { id, node, nodeProps, outputs, nodeEvent, files, ffmpeg: loadFfmpeg } = useNode({ label: "合成视频" });
const nodeData = node.data as typeof node.data & { videoCompose?: State };
const saved = nodeData.videoCompose;
const state = reactive<State>({ clips: Array.isArray(saved?.clips) ? saved.clips : [], audio: saved?.audio, subtitle: saved?.subtitle, audioMode: saved?.audioMode === "replace" ? "replace" : "mix", subtitleMode: saved?.subtitleMode === "track" ? "track" : "burn", originalVolume: saved?.originalVolume ?? 100, backgroundVolume: saved?.backgroundVolume ?? 100 });
watch(state, () => { nodeData.videoCompose = structuredClone(JSON.parse(JSON.stringify(state))); }, { deep: true, flush: "sync", immediate: true });
const inputs = useNodeInputs();
const flow = useVueFlow();
const inputSnapshot = computed(() => JSON.stringify({
  edges: flow.getEdges.value.filter(edge => edge.target === id && edge.targetHandle === "in")
    .map(edge => [edge.source, edge.sourceHandle]),
  values: inputs.getTargetValues(id, "in").map(item => ({
    source: item.source, sourceHandle: item.sourceHandle,
    path: item.dataType === "VIDEO" && item.value && typeof item.value === "object" && "url" in item.value ? item.value.url : "",
  })),
}));
watch(inputSnapshot, snapshot => {
  const { edges, values } = JSON.parse(snapshot) as { edges: [string, string][]; values: { source: string; sourceHandle: string; path: string }[] };
  const keys = new Set(edges.map(edge => JSON.stringify(edge)));
  const retained = state.clips.filter(item => !item.source || keys.has(item.key));
  if (retained.length !== state.clips.length) state.clips = retained;
  for (const item of values) {
    const key = JSON.stringify([item.source, item.sourceHandle]);
    const existing = state.clips.find(clip => clip.key === key);
    if (existing) { if (existing.path !== item.path) existing.path = item.path; }
    else if (item.path) state.clips.push({ key, source: item.source, sourceHandle: item.sourceHandle, name: flow.findNode(item.source)?.data?.label || item.source, path: item.path, start: 0, end: null });
  }
}, { immediate: true });
const output = computed<NodeMediaValue | undefined>(() => outputs.value.video?.dataType === "VIDEO" ? outputs.value.video.value : undefined);
const previewUrl = files.useFileUrl(output, error => { errorMessage.value = error instanceof Error ? error.message : "视频读取失败"; });
const player = ref<InstanceType<typeof videoPlayer>>();
const videoInput = ref<HTMLInputElement>();
const audioInput = ref<HTMLInputElement>();
const subtitleInput = ref<HTMLInputElement>();
const processing = ref(false);
const uploading = ref(false);
const cancelling = ref(false);
const busy = computed(() => processing.value || uploading.value);
const progress = ref(0);
const errorMessage = ref("");
let controller: AbortController | undefined;
let job: Promise<void> | undefined;
let disposed = false;
const getDirectory = inject<(() => string) | undefined>("workspaceDirectory", undefined);
const getCanvas = inject<(() => { id: string } | undefined) | undefined>("canvas", undefined);
watch([() => getDirectory?.(), () => getCanvas?.()?.id], () => cancel(), { flush: "sync" });
function move(index: number, delta: number) { const [item] = state.clips.splice(index, 1); if (item) state.clips.splice(index + delta, 0, item); }
function removeClip(item: Item) {
  if (item.source) flow.removeEdges(edges => edges.filter(edge => edge.target === id && edge.targetHandle === "in" && edge.source === item.source && edge.sourceHandle === item.sourceHandle));
  state.clips = state.clips.filter(clip => clip.key !== item.key);
}
async function uploadVideos(event: Event) {
  const input = event.target as HTMLInputElement;
  const selected = Array.from(input.files ?? []); input.value = "";
  if (!selected.length || busy.value) return;
  uploading.value = true; errorMessage.value = "";
  const workspace = files.getWorkspaceFiles();
  const directory = getDirectory?.(); const canvas = getCanvas?.()?.id;
  try { for (const file of selected) { const path = await uploadNodeFile(workspace, id, file); if (!disposed && directory === getDirectory?.() && canvas === getCanvas?.()?.id) state.clips.push({ key: crypto.randomUUID(), name: file.name, path, start: 0, end: null }); } }
  catch (error) { errorMessage.value = error instanceof Error ? error.message : "视频上传失败"; }
  finally { uploading.value = false; }
}
async function uploadAsset(event: Event, kind: "audio" | "subtitle") {
  const input = event.target as HTMLInputElement; const file = input.files?.[0]; input.value = "";
  if (!file || busy.value) return;
  uploading.value = true; errorMessage.value = "";
  const workspace = files.getWorkspaceFiles();
  const directory = getDirectory?.(); const canvas = getCanvas?.()?.id;
  try {
    if (kind === "subtitle") {
      if (!/\.(srt|ass)$/i.test(file.name)) throw new Error("请选择 SRT 或 ASS 字幕文件");
      new TextDecoder("utf-8", { fatal: true }).decode(await file.arrayBuffer());
    }
    const path = await uploadNodeFile(workspace, id, file);
    if (!disposed && directory === getDirectory?.() && canvas === getCanvas?.()?.id) state[kind] = { path, name: file.name };
  } catch (error) { errorMessage.value = error instanceof Error ? error.message : "文件上传失败"; }
  finally { uploading.value = false; }
}
function uploadAudio(event: Event) { return uploadAsset(event, "audio"); }
function uploadSubtitle(event: Event) { return uploadAsset(event, "subtitle"); }
function cancel() { if (controller && !controller.signal.aborted) { cancelling.value = true; controller.abort(new DOMException("合成已取消", "AbortError")); } }
function start() { if (!busy.value) job = execute(); }
async function execute() {
  processing.value = true; cancelling.value = false; progress.value = 0; errorMessage.value = "";
  const current = controller = new AbortController();
  const workspace = files.getWorkspaceFiles();
  const path = `assets/${id}/${crypto.randomUUID()}.mp4`;
  const settings = { clips: state.clips.map(clip => ({ path: clip.path, start: clip.start, end: clip.end })), audio: state.audio?.path, subtitle: state.subtitle?.path, audioMode: state.audioMode, subtitleMode: state.subtitleMode, originalVolume: state.originalVolume / 100, backgroundVolume: state.backgroundVolume / 100, output: path };
  let committed = false;
  try {
    for (const directory of ["assets", `assets/${id}`]) await workspace.mkdir(directory).catch(error => { if (error?.response?.data?.data?.code !== "EEXIST") throw error; });
    const ffmpeg = await loadFfmpeg(current.signal);
    await composeVideo(ffmpeg, settings, current.signal, value => { progress.value = value; });
    current.signal.throwIfAborted();
    outputs.value.video = { dataType: "VIDEO", value: { url: path, mimeType: "video/mp4" } }; committed = true; progress.value = 100;
  } catch (error) { if (!current.signal.aborted) errorMessage.value = error instanceof Error ? error.message : "合成失败"; }
  finally { if (!committed) await workspace.remove(path).catch(() => {}); processing.value = false; cancelling.value = false; controller = undefined; job = undefined; }
}
async function cancelAndWait() { cancel(); await job; }
nodeEvent.on("save", async reason => { if (uploading.value) throw new Error("素材上传中，请稍后重试"); if (reason === "reload" && processing.value) throw new Error("视频合成中，请完成或取消后刷新"); await cancelAndWait(); });
nodeEvent.on("delete", async () => { if (uploading.value) throw new Error("素材上传中，请稍后删除"); await cancelAndWait(); });
onScopeDispose(() => { disposed = true; cancel(); });
</script>

<style scoped lang="scss">
.composePreview { padding: 9px; .empty { height: 170px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; color: #8b929b; background: #202329; } .error { color: #d44c4c; overflow-wrap: anywhere; } }
.composePanel { max-height: min(420px, 55vh); overflow-y: auto; .header, .clipTitle, .trimRow, .volumeRow, .footer { display: flex; align-items: center; gap: 8px; } .header, .clipTitle { justify-content: space-between; } .clipTitle span, .filename { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } .clipRow { padding: 8px 0; border-bottom: 1px solid #e5e7eb; } .trimRow { font-size: 12px; margin-top: 5px; .el-input-number { width: 130px; } } .section { margin-top: 16px; } .volumeRow { font-size: 12px; margin-top: 8px; .el-slider { flex: 1; } } .filename, .hint { font-size: 12px; color: #757b84; } .footer { justify-content: flex-end; margin-top: 16px; } }
</style>

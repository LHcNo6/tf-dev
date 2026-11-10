<template>
  <nodeSkeleton
    v-bind="nodeProps"
    v-model:bottomVisible="node.selected"
    :topVisible="node.selected"
    topWidth="max-content"
    :downloadUrl="previewUrl"
    :downloadName="outputFile?.url.split(/[\\/]/).at(-1)"
    @fullscreen="player?.enterFullscreen()"
    :bottomWidth="660"
    :style="{ width: previewUrl && videoWidth ? `${videoWidth + 18}px` : undefined }">
    <template #topActions>
      <el-button :icon="IconMusic" text :disabled="!outputFile || generating || deleting || uploading || actions?.processing" @click.stop="actions?.open('extractAudio')">提取音轨</el-button>
      <el-button :icon="IconLayersSubtract" text :disabled="!outputFile || generating || deleting || uploading || actions?.processing" @click.stop="actions?.open('separate')">分离音视频</el-button>
      <el-button :icon="IconScissors" text :disabled="!outputFile || generating || deleting || uploading || actions?.processing" @click.stop="actions?.open('trim')">截取片段</el-button>
      <el-button :icon="IconPlayerSkipForward" text :loading="extractingFrame" :disabled="!outputFile || generating || deleting || uploading || extractingFrame" @click.stop="extractFrame()">提取尾帧</el-button>
      <el-button :icon="IconMovie" text :loading="actions?.creatingAnalysis" :disabled="!outputFile || generating || deleting || uploading || actions?.processing || actions?.creatingAnalysis" @click.stop="actions?.createFrameAnalysis()">逐帧拉片</el-button>
      <mediaHistory mediaType="video" :current="outputFile" :disabled="generating || deleting || uploading || extractingFrame" @select="outputs.video = { dataType: 'VIDEO', value: $event }" />
      <el-button :icon="IconTransfer" :loading="uploading" :disabled="generating || deleting || extractingFrame" text title="替换视频" aria-label="替换视频" @click.stop="fileInput?.click()">替换视频</el-button>
    </template>
    <template #topRightActions>
      <el-dropdown trigger="click" placement="bottom-end" :disabled="!player?.ready || player?.capturing || generating || deleting || uploading" @command="player?.captureFrame($event)">
        <el-button :icon="IconPhotoScan" :loading="player?.capturing" :disabled="!player?.ready || player?.capturing || generating || deleting || uploading" text title="截取视频帧" aria-label="截取视频帧" />
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="current" :icon="IconPhotoScan">截取当前帧</el-dropdown-item>
            <el-dropdown-item command="first" :icon="IconPlayerSkipBack">截取首帧</el-dropdown-item>
            <el-dropdown-item command="last" :icon="IconPlayerSkipForward">截取尾帧</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </template>
    <div v-loading="generating || uploading" class="videoContent nopan" :aria-busy="generating || uploading">
      <input ref="fileInput" type="file" accept="video/*" hidden aria-label="选择视频" :disabled="generating || deleting || uploading || extractingFrame" @change="replaceOutput" />
      <videoPlayer
        v-if="previewUrl"
        ref="player"
        :src="previewUrl"
        label="生成视频"
        @loadedmetadata="resizeVideo" />
      <div v-else class="videoEmpty">
        <icon-camera-ai :size="48" stroke="1.25" aria-hidden="true" />
        <el-button class="nodrag nopan" :icon="IconUpload" text :loading="uploading" :disabled="generating || deleting || uploading || extractingFrame" aria-label="上传视频" @dblclick.stop @click.stop="fileInput?.click()">上传视频</el-button>
      </div>
    </div>
    <template #bottom>
      <el-card class="promptCard" shadow="never" :bodyStyle="{ padding: '14px 16px 12px' }">
        <referenceItem
          v-if="refList.length"
          v-model="refList"
          @preview="setReferencePreview"
          @remove="removeReference" />
        <div v-if="frameMode" class="referenceHint">
          {{ data.firstFrameBinding ? "已显式绑定首帧" : selectedMode === "startFrameOptional" ? "仅一张图片时作为尾帧；两张图片按顺序作为首帧、尾帧" : "图片引用按顺序作为首帧、尾帧" }}
        </div>
        <promptInput v-model="data.promptModel" v-model:text="data.prompt" :references="referenceMentions" :materials="materialMentions" :selectMaterial="selectMaterialReference" :selectAsset="selectAssetReference" expandable />
        <div class="promptFooter">
          <el-select
            v-model="data.model"
            class="modelSelect"
            filterable
            :loading="modelsLoading"
            :disabled="generating || deleting"
            placeholder="选择模型"
            aria-label="生成模型"
            noDataText="请先在设置中添加视频模型"
            placement="top-start"
            @visible-change="(visible) => visible && loadModels().catch((error) => showNodeError(error, '模型读取失败'))">
            <template #prefix><icon-sparkles :size="17" /></template>
            <el-option-group v-for="provider in modelGroups" :key="provider.id" :label="provider.label">
              <el-option
                v-for="item in provider.models"
                :key="item.modelId"
                :label="item.label"
                :value="JSON.stringify([item.providerId, item.modelId])" />
            </el-option-group>
          </el-select>
          <generationSettings
            v-model:duration="data.duration"
            v-model:resolution="data.resolution"
            v-model:ratio="data.ratio"
            v-model:mode="data.mode"
            v-model:generateAudio="data.generateAudio"
            v-model:other="data.other"
            :ratios="ratioOptions"
            :model="selectedModel"
            :disabled="generating || deleting || !selectedModel" />
          <div class="generationActions">
            <mediaPrice v-if="generationInput" :input="{ ...generationInput, mediaType: 'video' }" :supported="selectedModel?.supportsPrice === true" />
            <el-button
              class="sendButton"
              :icon="generating ? IconPlayerStop : IconArrowUp"
              :disabled="deleting || uploading || extractingFrame || (!generating && (!generationPrompt || !selectedModel))"
              :title="generating ? '停止生成' : '生成视频'"
              :aria-label="generating ? '停止生成' : '生成视频'"
              @click="generating ? generationController?.abort() : startGeneration().catch((error) => showNodeError(error, '视频生成失败'))" />
          </div>
        </div>
      </el-card>
    </template>
  </nodeSkeleton>
  <videoActions ref="actions" :file="outputFile" :src="previewUrl" :disabled="generating || deleting || uploading" />
</template>

<script setup lang="ts">
import { computed, inject, nextTick, onMounted, onScopeDispose, ref, shallowRef, watch } from "vue";
import { useVueFlow } from "@vue-flow/core";
import { ElButton, ElCard, ElSelect, ElOption, ElOptionGroup, ElLoading, ElDropdown, ElDropdownMenu, ElDropdownItem } from "element-plus";
import { IconCameraAi, IconSparkles, IconArrowUp, IconPlayerStop, IconTransfer, IconUpload, IconMusic, IconLayersSubtract, IconScissors, IconMovie, IconPhotoScan, IconPlayerSkipBack, IconPlayerSkipForward } from "@tabler/icons-vue";
import { nodeSkeleton, nodeTools, useNode, z, type NodeMediaModel, type NodeVideoRequest, type NodeHandle } from "@toonflow/nodes-scaffold/runtime";
import { groupNodeModels } from "@toonflow/node-shared/groupNodeModels";
import { showNodeError } from "@toonflow/node-shared/showNodeError";
import { useNodeGeneration } from "@toonflow/node-shared/useNodeGeneration";
import { useModelForm } from "@toonflow/node-shared/useModelForm";
import { useNodeReferences } from "@toonflow/node-shared/useNodeReferences";
import { getPromptText } from "@toonflow/node-shared/promptText";
import promptInput from "@toonflow/node-shared/promptInput";
import videoPlayer from "@toonflow/node-video/videoPlayer";
import videoActions from "@toonflow/node-video/videoActions";
import referenceItem from "@toonflow/node-shared/referenceItem";
import mediaHistory from "@toonflow/node-shared/mediaHistory";
import mediaPrice from "@toonflow/node-shared/mediaPrice";
import generationSettings from "./components/generationSettings.vue";
import { uploadNodeFile } from "@toonflow/nodes-scaffold/workspaceFiles";
import { extractLastFrame } from "./extractLastFrame";

defineOptions({
  inheritAttrs: false,
  icon: IconCameraAi,
  handles: [
    { id: "in", type: "target", dataType: ["IMAGE", "VIDEO", "AUDIO", "STRING"], label: "图片、视频、音频、文本输入" },
    { id: "video", type: "source", dataType: "VIDEO", label: "视频输出" },
  ] satisfies NodeHandle[],
});
const vLoading = ElLoading.directive;
const { id, node, nodeProps, nodeEvent, outputs, files, ai, updateNodeInternals } = useNode({
  label: "视频生成",
});
type PromptModel = NonNullable<InstanceType<typeof promptInput>["$props"]["modelValue"]>;
type FrameBinding = { source: string; sourceHandle: string; path: string };
type GenerationRecord = { attemptId: string; videoUrl: string; videoMimeType: string };
type FrameRecord = { nodeId: string; videoUrl: string; videoMimeType: string; imageUrl: string; attemptId?: string };
const data = computed(() => node.data as { prompt: string; promptModel: PromptModel; model: string; duration?: number; resolution: string; ratio: string; mode: string; generateAudio: boolean; other: Record<string, unknown>; lastFrameNodeId?: string; lastFrameRecord?: FrameRecord; lastGenerationRecord?: GenerationRecord; firstFrameBinding?: FrameBinding });
data.value.prompt ??= "";
data.value.promptModel ??= [];
data.value.model ??= "";
data.value.resolution ??= "";
data.value.mode ??= "";
data.value.generateAudio ??= true;
data.value.ratio ??= "9:16";
data.value.other ??= {};
const { refList, referenceMentions, materialMentions, selectMaterialReference, selectAssetReference, setReferencePreview, removeReference } = useNodeReferences();
const models = shallowRef<NodeMediaModel[]>([]);
const modelsLoading = ref(false);
const uploading = ref(false);
const extractingFrame = ref(false);
const frameStatus = ref<"idle" | "pending" | "running" | "succeeded" | "failed" | "cancelled">("idle");
const frameError = ref("");
const frameWaits = new Set<() => void>();
const flow = useVueFlow();
const getCanvas = inject<(() => { id: string } | undefined) | undefined>("canvas", undefined);
const getWorkspaceDirectory = inject<(() => string) | undefined>("workspaceDirectory", undefined);
const fileInput = ref<HTMLInputElement>();
let disposed = false;
const deleting = ref(false);
const player = ref<InstanceType<typeof videoPlayer>>();
const actions = ref<InstanceType<typeof videoActions>>();
const videoWidth = ref(0);
let generationController: AbortController | undefined;
let frameController: AbortController | undefined;
let frameTask: Promise<void> | undefined;
const generationState = useNodeGeneration(outputs, () => generationController?.abort(), { mediaType: "video", getModelCalls: () => node.data.modelCalls });
const { generating } = generationState;
let generation: Promise<void> | undefined;
let modelsRequest: Promise<void> | undefined;
// ACT: 供应商未声明视频比例范围，沿用界面的通用比例，具体支持范围由供应商校验。
const ratioOptions = ["16:9", "9:16", "1:1", "4:3", "3:4"];
const selectedModel = computed(() => models.value.find((item) => JSON.stringify([item.providerId, item.modelId]) === data.value.model));
useModelForm(data, selectedModel);
const selectedMode = computed(() => selectedModel.value?.mode?.find((item) => JSON.stringify(item) === data.value.mode) as NodeVideoRequest["mode"]);
const frameMode = computed(() => ["startEndRequired", "endFrameOptional", "startFrameOptional"].includes(String(selectedMode.value)));
const mediaCounts = computed(() => ({
  image: refList.value.filter((item) => item.dataType === "IMAGE").length,
  video: refList.value.filter((item) => item.dataType === "VIDEO").length,
  audio: refList.value.filter((item) => item.dataType === "AUDIO").length,
}));
const matchingModes = computed(() => getMatchingModes(selectedModel.value));

function getMatchingModes(choice?: NodeMediaModel) {
  return (choice?.mode ?? []).filter((mode) => {
    const { image, video, audio } = mediaCounts.value;
    if (data.value.firstFrameBinding) return mode === "endFrameOptional" && image === 1 && !video && !audio;
    if (Array.isArray(mode)) return image + video + audio > 0 && Object.entries(mediaCounts.value).every(([type, count]) =>
      count <= Number(mode.find((item) => item.startsWith(`${type}Reference:`))?.split(":")[1] ?? 0)
    );
    if (mode === "text") return image + video + audio === 0;
    if (video || audio) return false;
    if (mode === "singleImage") return image === 1;
    if (mode === "startEndRequired") return image === 2;
    return ["endFrameOptional", "startFrameOptional"].includes(mode) && image >= 1 && image <= 2;
  });
}

function getDurations(choice: NodeMediaModel) {
  return [...new Set((choice.durationResolutionMap ?? []).flatMap((item) => item.duration))].sort((a, b) => a - b);
}

function getResolutions(choice: NodeMediaModel, duration?: number) {
  // ACT: 当前视频分辨率使用 p 单位；出现其他单位时再统一换算。
  return [...new Set((choice.durationResolutionMap ?? []).filter((item) => item.duration.includes(duration!)).flatMap((item) => item.resolution))]
    .sort((left, right) => (Number.parseFloat(left) || Infinity) - (Number.parseFloat(right) || Infinity));
}
// ACT: 引用改变时只替换不适用的模式；普通媒体优先作为参考，避免自动变成首尾帧。
watch([selectedModel, matchingModes, () => data.value.mode], ([choice, matches]) => {
  if (!choice || matches.some((item) => JSON.stringify(item) === data.value.mode)) return;
  const modes = choice.mode ?? [];
  const mode = matches.find(Array.isArray) ?? matches.find((item) => item === "singleImage")
    ?? matches.find((item) => item === "endFrameOptional") ?? matches[0]
    ?? modes.find((item) => JSON.stringify(item) === data.value.mode) ?? modes.find(Array.isArray) ?? modes[0];
  data.value.mode = mode === undefined ? "" : JSON.stringify(mode);
}, { flush: "sync" });
// ACT: 参数在节点内归一化，未选中、未挂载底部设置时也可由 Agent 直接生成。
watch([selectedModel, () => data.value.duration], ([choice]) => {
  if (!choice) return;
  const durations = getDurations(choice);
  if (!durations.includes(data.value.duration!)) data.value.duration = durations[0];
  const resolutions = getResolutions(choice, data.value.duration);
  if (!resolutions.includes(data.value.resolution)) data.value.resolution = resolutions[0] ?? "";
  if (!ratioOptions.includes(data.value.ratio)) data.value.ratio = "9:16";
  if (choice.audio !== "optional") data.value.generateAudio = choice.audio === true;
}, { flush: "sync" });
const modelGroups = computed(() => groupNodeModels(models.value));
function getGenerationPrompt(prompt: string, references = refList.value) {
  return [
    prompt.trim(),
    ...references.flatMap((item, index) => (item.dataType === "STRING" && item.value?.trim() ? [`参考 ${index + 1}：\n${item.value.trim()}`] : [])),
  ]
    .filter(Boolean)
    .join("\n\n");
}
const generationPrompt = computed(() => getGenerationPrompt(data.value.prompt));
const generationInput = computed(() => getGenerationInput(data.value.prompt));

function getGenerationInput(prompt: string): Omit<NodeVideoRequest, "directory"> | undefined {
  const choice = selectedModel.value;
  if (!choice) return;
  const references = refList.value;
  const images: NonNullable<NodeVideoRequest["images"]> = [];
  const videos: NonNullable<NodeVideoRequest["videos"]> = [];
  const audios: NonNullable<NodeVideoRequest["audios"]> = [];
  const referenceOrder: NonNullable<NodeVideoRequest["referenceOrder"]> = references.map(item => {
    if (item.dataType === "IMAGE" && item.value) {
      const index = images.push({ path: item.value.url, mimeType: item.value.mimeType }) - 1;
      return { type: "image", index };
    }
    if (item.dataType === "VIDEO" && item.value) {
      const index = videos.push({ path: item.value.url, mimeType: item.value.mimeType }) - 1;
      return { type: "video", index };
    }
    if (item.dataType === "AUDIO" && item.value) {
      const index = audios.push({ path: item.value.url, mimeType: item.value.mimeType }) - 1;
      return { type: "audio", index };
    }
    return { type: "text" };
  });
  const firstFrame = frameMode.value && (selectedMode.value !== "startFrameOptional" || images.length > 1) ? images[0] : undefined;
  const lastFrame = frameMode.value && !data.value.firstFrameBinding ? images[selectedMode.value === "startFrameOptional" && images.length === 1 ? 0 : 1] : undefined;
  return {
    providerId: choice.providerId,
    modelId: choice.modelId,
    prompt: getGenerationPrompt(prompt, references),
    mode: selectedMode.value,
    duration: data.value.duration,
    resolution: data.value.resolution || undefined,
    ratio: data.value.ratio,
    generateAudio: choice.audio === "optional" ? data.value.generateAudio : choice.audio,
    other: Object.keys(data.value.other).length ? { ...data.value.other } : undefined,
    outputDirectory: `assets/${id}`,
    images: frameMode.value ? undefined : images,
    firstFrame,
    lastFrame,
    videos,
    audios,
    referenceOrder: referenceOrder.map(reference => frameMode.value && reference.type === "image"
      ? { type: reference.index === 0 && firstFrame ? "firstFrame" : "lastFrame" } : reference),
  };
}
const outputFile = computed(() => outputs.value.video?.dataType === "VIDEO" ? outputs.value.video.value : undefined);
const previewUrl = files.useFileUrl(
  outputFile,
  (error) => showNodeError(error, "视频读取失败")
);

onMounted(() => {
  window.addEventListener("toonflow:plugin-installed", refreshProviderModels);
  window.addEventListener("toonflow:provider-config-changed", refreshProviderModels);
  void loadModels().catch(error => { if (!disposed) showNodeError(error, "模型读取失败"); });
});
onScopeDispose(() => {
  disposed = true;
  window.removeEventListener("toonflow:plugin-installed", refreshProviderModels);
  window.removeEventListener("toonflow:provider-config-changed", refreshProviderModels);
  generationController?.abort();
  frameController?.abort();
  for (const stopWait of frameWaits) stopWait();
});
watch(() => getCanvas?.()?.id, () => frameController?.abort(), { flush: "sync" });

async function refreshProviderModels(event: Event) {
  if (event.type === "toonflow:plugin-installed" && (event as CustomEvent<{ type?: string }>).detail?.type !== "provider") return;
  try {
    await generation;
    if (!disposed && !deleting.value) await loadModels();
  } catch (error) {
    if (!disposed) showNodeError(error, "模型读取失败");
  }
}

async function replaceOutput(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";
  if (!file || generating.value || deleting.value || uploading.value || extractingFrame.value || disposed) return;
  if (!file.type.startsWith("video/")) return void showNodeError("请选择视频文件", "视频替换失败");
  if (!file.size || file.size > 100 * 1024 * 1024) return void showNodeError("视频不能为空且不能超过 100 MB", "视频替换失败");
  uploading.value = true;
  try {
    const workspace = files.getWorkspaceFiles();
    const url = await files.uploadFile(file);
    if (disposed) {
      await workspace.remove(url);
      return;
    }
    // ACT: 保留历史输出文件，避免破坏撤销记录和复制节点的引用。
    outputs.value.video = { dataType: "VIDEO", value: { url, mimeType: file.type } };
  } catch (error) {
    showNodeError(error, "视频替换失败");
  } finally {
    uploading.value = false;
  }
}

function extractFrame() {
  if (frameTask || !outputFile.value || disposed || deleting.value) return frameTask;
  const source = { ...outputFile.value };
  const controller = frameController = new AbortController();
  extractingFrame.value = true;
  data.value.lastFrameRecord = undefined;
  frameStatus.value = "running";
  frameError.value = "";
  frameTask = (async () => {
    await Promise.resolve();
    let path = "";
    let committed = false;
    let workspace: ReturnType<typeof files.getWorkspaceFiles> | undefined;
    try {
      const canvasId = getCanvas?.()?.id;
      const directory = getWorkspaceDirectory?.();
      workspace = files.getWorkspaceFiles();
      function verify() {
        controller.signal.throwIfAborted();
        if (disposed || flow.findNode(id) !== node || getCanvas?.()?.id !== canvasId || getWorkspaceDirectory?.() !== directory
          || outputFile.value?.url !== source.url || outputFile.value?.mimeType !== source.mimeType) throw new Error("视频或画布已变化，请重新提取尾帧");
        if (!flow.nodeTypes?.value?.["remote-imageNode"]) throw new Error("请先启用图片节点插件");
      }
      verify();
      const content = await workspace.read(source.url);
      verify();
      const frame = await extractLastFrame(content, source.mimeType, controller.signal);
      verify();
      const existing = data.value.lastFrameNodeId ? flow.findNode(data.value.lastFrameNodeId) : undefined;
      const target = existing?.type === "remote-imageNode" && existing.data.lastFrameOwnerId === id ? existing : undefined;
      const previousOutput = target?.data.outputs?.image;
      const targetId = target?.id ?? crypto.randomUUID();
      path = await uploadNodeFile(workspace, targetId, new File([frame.blob], "frame.png", { type: "image/png" }));
      verify();
      if (target && (flow.findNode(targetId) !== target || target.data.outputs?.image !== previousOutput)) throw new Error("尾帧图片节点已变化，请重新提取");
      const image = { dataType: "IMAGE" as const, value: { url: path, mimeType: "image/png" } };
      if (target) {
        target.data.outputs ??= {};
        target.data.outputs.image = image;
      } else {
        const x = node.computedPosition.x + (node.dimensions.width || 320) + 40;
        let y = node.computedPosition.y;
        const width = 240 * frame.width / frame.height + 18;
        for (const other of [...flow.getNodes.value].sort((a, b) => a.computedPosition.y - b.computedPosition.y)) {
          const position = other.computedPosition;
          if (position.x < x + width && position.x + (other.dimensions.width || 320) > x && position.y < y + 300 && position.y + (other.dimensions.height || 300) > y) y = position.y + (other.dimensions.height || 300) + 24;
        }
        flow.addNodes({ id: targetId, type: "remote-imageNode", position: { x, y }, data: { label: `${node.data.label || "视频"} · 尾帧`, lastFrameOwnerId: id, outputs: { image } } });
        data.value.lastFrameNodeId = targetId;
      }
      const generated = data.value.lastGenerationRecord;
      data.value.lastFrameRecord = { nodeId: targetId, videoUrl: source.url, videoMimeType: source.mimeType, imageUrl: path, ...(generated?.videoUrl === source.url && generated.videoMimeType === source.mimeType ? { attemptId: generated.attemptId } : {}) };
      committed = true;
      frameStatus.value = "succeeded";
    } catch (error) {
      frameStatus.value = controller.signal.aborted ? "cancelled" : "failed";
      frameError.value = controller.signal.aborted ? "尾帧提取已取消" : error instanceof Error ? error.message : "尾帧提取失败";
      if (!controller.signal.aborted && !disposed) showNodeError(error, "尾帧提取失败，请点击“提取尾帧”重试");
    } finally {
      if (path && !committed && workspace) await workspace.remove(path).catch(error => { if (!disposed) showNodeError(error, "临时尾帧清理失败"); });
      extractingFrame.value = false;
      frameController = undefined;
      frameTask = undefined;
    }
  })();
  return frameTask;
}

function loadModels() {
  if (modelsRequest) return modelsRequest;
  modelsLoading.value = true;
  modelsRequest = ai.getMediaModels().then((items) => {
    if (disposed || generating.value || deleting.value) return;
    models.value = items.filter((item) => item.type === "video");
    // ACT: 只给空配置选默认模型，保留暂时不可用的旧选择及其参数。
    if (!data.value.model) {
      const first = models.value[0];
      data.value.model = first ? JSON.stringify([first.providerId, first.modelId]) : "";
    }
  }).finally(() => {
    modelsLoading.value = false;
    modelsRequest = undefined;
  });
  return modelsRequest;
}

async function startGeneration() {
  const choice = selectedModel.value;
  if (generating.value) throw new Error("视频正在生成，请等待完成");
  if (uploading.value) throw new Error("视频正在替换，请等待完成");
  if (extractingFrame.value) throw new Error("正在提取尾帧，请等待完成");
  if (deleting.value) throw new Error("节点正在删除");
  // ACT: 提交时按稳定 ID 解析，避免依赖编辑器挂载及异步重排同步。
  const references = referenceMentions.value;
  const prompt = data.value.promptModel.length ? getPromptText(data.value.promptModel, referenceId => {
    const value = references.find(reference => reference.id === referenceId)?.value;
    if (value === undefined) throw new Error("提示词引用的素材已失效，请重新选择引用");
    return value;
  }) : data.value.prompt;
  const input = getGenerationInput(prompt);
  if (!choice || !input) throw new Error("请先选择视频模型");
  if (!input.prompt) throw new Error("请输入生成提示词");
  if (data.value.firstFrameBinding) validateFirstFrame(data.value.firstFrameBinding);
  if (refList.value.some(item => item.value === undefined)) throw new Error("引用节点暂无内容，请先补充引用内容");
  for (const match of input.prompt.matchAll(/\{\{ref (\d+)\}\}/g)) {
    const reference = refList.value[Number(match[1]) - 1];
    if (reference?.dataType === "STRING" && !reference.value?.trim()) throw new Error(`参考 ${match[1]} 的文本为空，请补充内容或移除提示词中的引用`);
  }
  if (choice.mode?.length && !matchingModes.value.length) throw new Error("当前模型没有适合这些参考素材的生成模式，请更换模型或调整引用");
  const workspace = files.getWorkspaceFiles();
  const controller = new AbortController();
  const attemptId = crypto.randomUUID();
  generationController = controller;
  data.value.lastFrameRecord = undefined;
  data.value.lastGenerationRecord = undefined;
  frameStatus.value = "pending";
  frameError.value = "";
  // ACT: 工具立即返回，任务由节点持有，停止或卸载时取消。
  generation = generationState.run(call => workspace
    .list()
    .then(({ directory }) => {
      controller.signal.throwIfAborted();
      return ai.generateVideo({ ...input, directory }, controller.signal, call);
    })
    .then(([result]) => {
      controller.signal.throwIfAborted();
      if (!result) throw new Error("供应商未返回视频");
      outputs.value.video = { dataType: "VIDEO", value: { url: result.path, mimeType: result.mimeType } };
      data.value.lastGenerationRecord = { attemptId, videoUrl: result.path, videoMimeType: result.mimeType };
    }), attemptId)
    .then(() => extractFrame())
    .catch((error) => { frameStatus.value = "failed"; frameError.value = "视频生成失败，未提取尾帧"; showNodeError(error, "视频生成失败"); })
    .finally(() => {
      generationController = undefined;
    });
  return { status: "generating", ...generationState.getAttempt() };
}

nodeEvent.on("save", (reason) => {
  if (reason === "reload" && (generating.value || uploading.value || deleting.value || extractingFrame.value)) throw new Error("视频处理中，请完成后再刷新节点");
});
nodeEvent.on("delete", async () => {
  if (uploading.value) throw new Error("视频正在替换，请稍后删除节点");
  deleting.value = true;
  generationController?.abort();
  frameController?.abort();
  try {
    await generation;
    await frameTask;
    await files.removeNodeFiles();
  } finally {
    deleting.value = false;
  }
});

async function resizeVideo(event: Event) {
  const video = event.currentTarget as HTMLVideoElement;
  if (!video.videoWidth || !video.videoHeight) return;
  videoWidth.value = Math.max(180, (240 * video.videoWidth) / video.videoHeight);
  await nextTick();
  updateNodeInternals();
}

function validateFirstFrame(binding: FrameBinding, choice = selectedModel.value, checkMode = true) {
  if (!choice?.mode?.includes("endFrameOptional")) throw new Error("当前模型未声明支持仅首帧模式，请选择支持首帧的模型");
  if (checkMode && selectedMode.value !== "endFrameOptional") throw new Error("首帧绑定需要首帧模式，请重新设置");
  const media = refList.value.filter(item => item.dataType === "IMAGE" || item.dataType === "VIDEO" || item.dataType === "AUDIO");
  const image = media[0];
  if (media.length !== 1 || image?.dataType !== "IMAGE" || image.source !== binding.source || image.sourceHandle !== binding.sourceHandle || image.value?.url !== binding.path) throw new Error("首帧来源或文件已变化，或存在不兼容的其他媒体参考；请重新核对");
  const sourceNode = flow.findNode(binding.source);
  const sourceOutput = sourceNode?.data.outputs?.[binding.sourceHandle];
  if (!sourceNode || !flow.getEdges.value.some(edge => edge.source === binding.source && edge.sourceHandle === binding.sourceHandle && edge.target === id && edge.targetHandle === "in") || sourceOutput?.dataType !== "IMAGE" || sourceOutput.value?.url !== binding.path) throw new Error("首帧连接或来源已变化，请重新核对");
  const ownerId = sourceNode?.data.lastFrameOwnerId;
  if (typeof ownerId === "string") {
    const owner = flow.findNode(ownerId);
    const record = owner?.data.lastFrameRecord as FrameRecord | undefined;
    const video = owner?.data.outputs?.video;
    if (!record || record.nodeId !== binding.source || record.imageUrl !== binding.path || video?.dataType !== "VIDEO" || video.value?.url !== record.videoUrl || video.value?.mimeType !== record.videoMimeType) throw new Error("尾帧与来源视频不匹配，请等待提取完成或重新提取");
  }
}

function getLastFrameStatus() {
  const record = data.value.lastFrameRecord;
  const imageNode = record ? flow.findNode(record.nodeId) : undefined;
  const image = imageNode?.data.outputs?.image;
  const valid = !!record && data.value.lastFrameNodeId === record.nodeId && imageNode?.data.lastFrameOwnerId === id
    && image?.dataType === "IMAGE" && image.value?.url === record.imageUrl
    && outputFile.value?.url === record.videoUrl && outputFile.value?.mimeType === record.videoMimeType;
  const status = frameStatus.value === "pending" || frameStatus.value === "running" || frameStatus.value === "failed" || frameStatus.value === "cancelled"
    ? frameStatus.value : valid ? "succeeded" : "idle";
  const generated = data.value.lastGenerationRecord;
  const attemptId = valid && record.attemptId && generated?.attemptId === record.attemptId && generated.videoUrl === record.videoUrl && generated.videoMimeType === record.videoMimeType ? record.attemptId : undefined;
  return { status, ...(frameError.value ? { error: frameError.value } : {}), video: outputFile.value, ...(valid ? { nodeId: record.nodeId, sourceHandle: "image", image: image.value, videoUrl: record.videoUrl, attemptId } : {}) };
}

function getConfig(includeModels = false) {
  let firstFrameError = "";
  if (data.value.firstFrameBinding) {
    try { validateFirstFrame(data.value.firstFrameBinding); }
    catch (error) { firstFrameError = error instanceof Error ? error.message : "首帧绑定无效"; }
  }
  return {
    config: {
      providerId: selectedModel.value?.providerId ?? "",
      modelId: selectedModel.value?.modelId ?? "",
      duration: data.value.duration,
      resolution: data.value.resolution,
      ratio: data.value.ratio,
      mode: selectedMode.value,
      generateAudio: data.value.generateAudio,
      other: data.value.other,
      firstFrameBinding: data.value.firstFrameBinding ?? null,
      firstFrame: data.value.firstFrameBinding ? generationInput.value?.firstFrame : undefined,
      firstFrameError: firstFrameError || undefined,
    },
    selectedModel: selectedModel.value ?? null,
    ...(includeModels ? { models: models.value } : {}),
    ratios: ratioOptions,
    matchingModes: matchingModes.value,
  };
}

nodeTools.register({
  name: "getLastFrameStatus",
  description: "查询尾帧提取状态及有效图片来源；succeeded 表示关联节点、图片和当前视频匹配，旧尾帧不作为有效结果",
  parameters: z.strictObject({}),
  execute: getLastFrameStatus,
});
nodeTools.register({
  name: "waitLastFrame",
  description: "等待当前视频的尾帧提取，最多 30 秒；pending 或 running 可继续等待，取消等待不取消提取",
  parameters: z.strictObject({}),
  async execute(_args, { signal }) {
    signal?.throwIfAborted();
    if (frameStatus.value !== "pending" && frameStatus.value !== "running") return getLastFrameStatus();
    return await new Promise<ReturnType<typeof getLastFrameStatus>>((resolve, reject) => {
      const finish = (failure?: unknown) => { clearTimeout(timer); stop(); signal?.removeEventListener("abort", onAbort); frameWaits.delete(onDispose); if (failure) reject(failure); else resolve(getLastFrameStatus()); };
      const onAbort = () => finish(signal?.reason ?? new Error("等待已取消"));
      const onDispose = () => finish(new Error("节点已卸载，无法等待尾帧"));
      const stop = watch(frameStatus, value => { if (value !== "pending" && value !== "running") finish(); });
      const timer = setTimeout(() => finish(), 30000);
      frameWaits.add(onDispose);
      signal?.addEventListener("abort", onAbort, { once: true });
      if (signal?.aborted) onAbort();
    });
  },
});
nodeTools.register({
  name: "extractLastFrame",
  description: "对当前视频重新提取尾帧，不启动视频生成；通过 waitLastFrame 查询结果",
  parameters: z.strictObject({}),
  execute() {
    if (generating.value || uploading.value || deleting.value || extractingFrame.value || !outputFile.value) throw new Error("当前无法提取尾帧，请先确认视频和节点状态");
    void extractFrame();
    return getLastFrameStatus();
  },
});
nodeTools.register({
  name: "setFirstFrameBinding",
  description: "将已连接的单张图片显式绑定为首帧并选择首帧模式；需提供当前图片路径，传 null 清除绑定；不生成视频",
  parameters: z.strictObject({ binding: z.object({ source: z.string().min(1), sourceHandle: z.string().min(1), path: z.string().min(1) }).strict().nullable() }),
  async execute({ binding }, { signal }) {
    if (generating.value || deleting.value || uploading.value || extractingFrame.value) throw new Error("节点正在处理，请稍后设置首帧");
    signal?.throwIfAborted();
    if (!binding) { data.value.firstFrameBinding = undefined; return getConfig(); }
    await loadModels();
    signal?.throwIfAborted();
    if (generating.value || deleting.value || uploading.value || extractingFrame.value) throw new Error("节点正在处理，请稍后设置首帧");
    validateFirstFrame(binding, selectedModel.value, false);
    data.value.firstFrameBinding = binding;
    data.value.mode = JSON.stringify("endFrameOptional");
    return getConfig();
  },
});

nodeTools.register({
  name: "getConfig",
  description: "读取此视频生成节点的当前配置、所选模型能力、通用比例及适合当前引用的模式；includeModels 为 true 时返回完整可选模型目录，不含密钥；时长与分辨率须符合 durationResolutionMap",
  parameters: z.strictObject({ includeModels: z.boolean().optional() }),
  async execute({ includeModels }, { signal }) {
    signal?.throwIfAborted();
    await loadModels();
    signal?.throwIfAborted();
    return getConfig(includeModels);
  },
});

nodeTools.register({
  name: "setConfig",
  description: "修改此视频生成节点的模型、时长、分辨率、比例、模式或声音；选择模型时先用 getConfig 的 includeModels 查询，providerId 与 modelId 必须同时提供；mode 使用返回的原始字符串或数组，须匹配当前引用；返回当前配置和所选模型能力，不修改提示词、不启动生成",
  parameters: z.strictObject({
    providerId: z.string().min(1).optional(),
    modelId: z.string().min(1).optional(),
    duration: z.number().positive().optional(),
    resolution: z.string().min(1).optional(),
    ratio: z.enum(ratioOptions).optional(),
    mode: z.union([z.string().min(1), z.array(z.string().min(1)).min(1)]).optional(),
    generateAudio: z.boolean().optional(),
  }).refine((args) => (args.providerId === undefined) === (args.modelId === undefined), "providerId 与 modelId 必须同时提供"),
  async execute(args, { signal }) {
    signal?.throwIfAborted();
    if (generating.value || deleting.value) throw new Error("节点正在生成或删除，请稍后修改配置");
    await loadModels();
    signal?.throwIfAborted();
    if (generating.value || deleting.value) throw new Error("节点正在生成或删除，请稍后修改配置");
    const choice = args.modelId === undefined ? selectedModel.value
      : models.value.find((item) => item.providerId === args.providerId && item.modelId === args.modelId);
    if (!choice) throw new Error("请选择 getConfig({includeModels:true}) 返回的有效视频模型");
    const durations = getDurations(choice);
    if (args.duration !== undefined && !durations.includes(args.duration)) throw new Error(`当前模型不支持时长 ${args.duration}，可选：${durations.join("、")}`);
    const duration = args.duration ?? (durations.includes(data.value.duration!) ? data.value.duration : durations[0]);
    const resolutions = getResolutions(choice, duration);
    if (args.resolution !== undefined && !resolutions.includes(args.resolution)) throw new Error(`当前时长不支持分辨率 ${args.resolution}，可选：${resolutions.join("、")}`);
    const resolution = args.resolution ?? (resolutions.includes(data.value.resolution) ? data.value.resolution : resolutions[0] ?? "");
    if (args.mode !== undefined && !getMatchingModes(choice).some((item) => JSON.stringify(item) === JSON.stringify(args.mode))) throw new Error("所选模式不受当前模型支持或不适用于当前引用，请根据模型能力及已连接素材选择");
    if (args.generateAudio !== undefined && choice.audio !== "optional" && args.generateAudio !== (choice.audio === true)) throw new Error("当前模型不支持切换声音，请查看 getConfig 返回的 audio 能力");
    data.value.model = JSON.stringify([choice.providerId, choice.modelId]);
    data.value.duration = duration;
    data.value.resolution = resolution;
    if (args.ratio !== undefined) data.value.ratio = args.ratio;
    if (args.mode !== undefined) data.value.mode = JSON.stringify(args.mode);
    if (args.generateAudio !== undefined) data.value.generateAudio = args.generateAudio;
    return getConfig();
  },
});

nodeTools.register({
  name: "setPrompt",
  description: "修改此节点的视频生成提示词，支持 {{ref 1}} 等参考标记；只修改提示词，不启动生成",
  parameters: z.strictObject({ prompt: z.string() }),
  execute({ prompt: value }) {
    if (deleting.value) throw new Error("节点正在删除，请稍后修改");
    data.value.prompt = value;
    data.value.promptModel = value.split("\n").map((text) => [{ type: "Write", text }]);
    return { prompt: value };
  },
});

nodeTools.register({
  name: "generateVideo",
  description: "启动此节点的后台视频生成，使用当前提示词、模型、模式、时长、分辨率、比例和参考素材；立即返回已开始，用 getGenerationStatus 查询完成结果，cancelGeneration 停止生成",
  parameters: z.strictObject({}),
  execute(_args, { signal }) {
    signal?.throwIfAborted();
    return startGeneration();
  },
});
</script>

<style scoped lang="scss">
.videoContent {
  .nodeSkeleton.resized & {
    height: 100%;
    min-height: 0;
    grid-template: minmax(0, 1fr) / minmax(0, 1fr);
    --nodeMediaHeight: 100%;

    .videoEmpty { min-height: 0; height: 100%; }
  }

  position: relative;
  display: grid;
  place-items: center;
  min-height: 144px;
  overflow: hidden;
  border-radius: var(--el-border-radius-base);

  .videoEmpty {
    display: grid;
    place-items: center;
    min-height: 144px;
    color: var(--el-text-color-placeholder);
  }

  :deep(.el-loading-mask) {
    pointer-events: none;
  }

}

.promptCard {
  .referenceHint {
    margin: 8px 0;
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }

  .promptFooter {
    flex-wrap: wrap;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 12px;

    .modelSelect {
      width: 190px;
      min-width: 0;

      &:deep(.el-select__wrapper) {
        gap: 6px;
        padding: 0;
        box-shadow: none;
        background: transparent;
      }
    }

    .generationActions {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-left: auto;

      .sendButton {
        width: 32px;
        height: 32px;
        margin-left: 0;
        padding: 0;
        --el-button-bg-color: var(--el-text-color-primary);
        --el-button-border-color: transparent;
        --el-button-text-color: var(--el-bg-color);
        --el-button-hover-bg-color: var(--el-text-color-regular);
        --el-button-hover-border-color: transparent;
        --el-button-hover-text-color: var(--el-bg-color);
      }
    }
  }
}
</style>

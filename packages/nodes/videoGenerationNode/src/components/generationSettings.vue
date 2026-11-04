<template>
  <el-popover v-model:visible="settingsVisible" trigger="click" placement="top-start" width="min(420px, calc(100vw - 24px))" :disabled="disabled" :showArrow="false" :popperStyle="{ padding: '14px' }" :popperOptions="{ modifiers: [{ name: 'preventOverflow', options: { altAxis: true, tether: false, padding: 12, rootBoundary: 'viewport' } }] }">
    <template #reference>
      <el-button class="settingsButton" text size="small" :disabled="disabled" :aria-expanded="settingsVisible" aria-label="视频生成设置" :title="`${summary}；${secondary}`">
        <span class="ratioShape" :style="ratioStyle(effectiveRatio)" aria-hidden="true" />
        <span class="summary"><strong>{{ summary }}</strong><span>{{ secondary }}</span></span>
        <component :is="settingsVisible ? IconChevronDown : IconChevronUp" :size="14" aria-hidden="true" />
      </el-button>
    </template>
    <div class="generationSettings nodrag nopan nowheel" @click.stop @pointerdown.stop @mousedown.stop @dblclick.stop @keydown.stop="onKeydown" @wheel.stop>
      <div class="currentSettings" role="status" aria-live="polite">
        <span>当前设置</span><strong>{{ summary }}</strong>
        <span>{{ ratioLocked ? '首尾帧或延长模式使用自适应画幅；选择后即时生效' : autoDuration ? '自动匹配输入视频时长；选择后即时生效' : '选择后即时生效' }}</span>
        <button type="button" class="closeButton" aria-label="收起视频参数" @click="settingsVisible = false">收起</button>
      </div>
      <div v-if="modes.length" class="sectionLabel">生成模式</div>
      <el-select v-if="modes.length" v-model="mode" :disabled="disabled" :teleported="false" aria-label="视频生成模式">
        <el-option v-for="item in modes" :key="item.value" :value="item.value" :label="item.label" />
      </el-select>
      <div v-if="durations.length || resolutions.length" class="outputOptions">
        <div v-if="durations.length" class="outputField">
          <div class="sectionLabel">时长</div>
          <el-select v-model="duration" :disabled="disabled || autoDuration" :teleported="false" aria-label="视频时长">
            <el-option v-for="item in durations" :key="item" :value="item" :label="`${item}秒`" />
          </el-select>
        </div>
        <div v-if="resolutions.length" class="outputField">
          <div class="sectionLabel">分辨率</div>
          <el-select v-model="resolution" :disabled="disabled" :teleported="false" aria-label="视频分辨率">
            <el-option v-for="item in resolutions" :key="item" :value="item" :label="item" />
          </el-select>
        </div>
      </div>
      <div class="sectionLabel">画面比例</div>
      <div class="ratioOptions" role="group" aria-label="视频比例">
        <el-button v-for="item in availableRatios" :key="item" class="ratioButton" :disabled="disabled || (ratioLocked && item !== 'adaptive')" :aria-label="`比例 ${item}`" :aria-pressed="effectiveRatio === item" @click="selectRatio(item)">
          <span class="ratioContent">
            <span class="ratioShape" :style="ratioStyle(item)" aria-hidden="true" />
            <span>{{ item }}</span>
          </span>
        </el-button>
      </div>
      <div v-if="model?.audio === 'optional'" class="audioOption">
        <span class="sectionLabel">生成音频</span>
        <el-switch v-model="generateAudio" :disabled="disabled" aria-label="生成音频" />
      </div>
      <details class="advancedSettings"><summary>更多设置（画幅覆盖、种子与参考素材）</summary>
        <modelForm v-model="other" :rules="model?.rules" :disabled="disabled" :teleported="false" />
      </details>
    </div>
  </el-popover>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { ElButton, ElPopover, ElSelect, ElOption, ElSwitch } from "element-plus";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-vue";
import type { NodeMediaModel } from "@toonflow/nodes-scaffold/runtime";
import modelForm from "@toonflow/node-shared/modelForm";

const props = defineProps<{ model?: NodeMediaModel; disabled?: boolean; ratios: string[] }>();
const settingsVisible = ref(false);
const duration = defineModel<number | undefined>("duration", { required: true });
const resolution = defineModel<string>("resolution", { required: true });
const ratio = defineModel<string>("ratio", { required: true });
const mode = defineModel<string>("mode", { required: true });
const generateAudio = defineModel<boolean>("generateAudio", { required: true });
const other = defineModel<Record<string, unknown>>("other", { required: true });
const isSeedance = computed(() => props.model?.providerId === "antaixin" && props.model?.modelId === "seedance-2.5-video");
const isUnifiedVideo = computed(() => props.model?.providerId === "antaixin" && ["wan-3.0", "minimax-h3"].includes(props.model?.modelId ?? ""));
const selectedMode = computed(() => { try { return JSON.parse(mode.value); } catch { return mode.value; } });
const isExtend = computed(() => isSeedance.value && (other.value?.omni_reference_task_type === "extend" || other.value?.video_extend === true));
const ratioLocked = computed(() => isSeedance.value && (isExtend.value || ["startEndRequired", "endFrameOptional", "startFrameOptional"].includes(selectedMode.value)));
const effectiveRatio = computed(() => ratioLocked.value ? "adaptive" : (isSeedance.value || isUnifiedVideo.value) && typeof other.value?.ratio === "string" && other.value.ratio ? other.value.ratio : ratio.value);
const availableRatios = computed(() => {
  const options = props.model?.rules?.find(item => item.field === "ratio")?.options;
  return [...new Set([...props.ratios, ...((isSeedance.value || isUnifiedVideo.value) && Array.isArray(options) ? options.map(item => String(item.value)).filter(Boolean) : [])])];
});
const autoDuration = computed(() => isSeedance.value && other.value?.autoDuration === true);
const summary = computed(() => [effectiveRatio.value === "adaptive" ? "自适应" : effectiveRatio.value, resolution.value, autoDuration.value ? "自动时长" : duration.value ? `${duration.value}秒` : ""].filter(Boolean).join(" · "));
const secondary = computed(() => [isExtend.value ? "视频延长" : Array.isArray(selectedMode.value) ? "混合参考" : modeLabels[selectedMode.value] ?? "选择模式", props.model?.audio === "optional" ? generateAudio.value ? "生成音频" : "无音轨" : props.model?.audio === true ? "生成音频" : ""].filter(Boolean).join(" · "));
const modeLabels: Record<string, string> = {
  text: "文生视频", singleImage: "单图参考", startEndRequired: "首尾帧必填", endFrameOptional: "尾帧可选", startFrameOptional: "首帧可选",
};
const modes = computed(() => (props.model?.mode ?? []).map(item => ({
  value: JSON.stringify(item),
  label: Array.isArray(item) ? "混合参考" : modeLabels[item] ?? item,
})));
const mappings = computed(() => props.model?.durationResolutionMap ?? []);
const durations = computed(() => [...new Set(mappings.value.flatMap(item => item.duration))].sort((a, b) => a - b));
const resolutions = computed(() => resolutionsFor(duration.value));

function resolutionsFor(value: number | undefined) {
  return [...new Set(mappings.value.filter(item => value !== undefined && item.duration.includes(value)).flatMap(item => item.resolution))];
}

function selectRatio(value: string) {
  if (ratioLocked.value && value !== "adaptive") return;
  if (props.ratios.includes(value)) ratio.value = value;
  if (isSeedance.value || isUnifiedVideo.value) other.value = { ...other.value, ratio: props.ratios.includes(value) ? "" : value };
}

function onKeydown(event: KeyboardEvent) { if (event.key === "Escape") settingsVisible.value = false; }

function ratioStyle(value: string) {
  const [width = 1, height = 1] = value === "adaptive" ? [1, 1] : value.split(":").map(Number);
  return { width: `${16 * Math.min(width / height, 1)}px`, height: `${16 * Math.min(height / width, 1)}px` };
}
</script>

<style scoped lang="scss">
.ratioShape {
  display: inline-block;
  flex-shrink: 0;
  border: 1px solid currentColor;
  border-radius: 2px;
  box-sizing: border-box;
}

.settingsButton {
  flex-shrink: 1; min-width: 0; height: auto; min-height: 32px; padding: 6px 8px; white-space: normal;
  :deep(> span) { gap: 6px; }
  .summary { display: flex; flex-direction: column; align-items: flex-start; gap: 3px; text-align: left; line-height: 1.4;
    span { color: var(--el-text-color-secondary); font-size: 11px; }
  }
}

.generationSettings {
  text-align: left;
  max-height: min(680px, calc(100dvh - 64px)); overflow-y: auto; overscroll-behavior: contain; scrollbar-gutter: stable;
  .currentSettings { position: sticky; top: 0; z-index: 3; display: flex; flex-direction: column; gap: 5px; margin-bottom: 16px; padding: 10px 58px 10px 12px; border-radius: 8px; background: var(--el-color-primary-light-9); color: var(--el-text-color-regular); font-size: 12px; line-height: 1.5;
    strong { color: var(--el-color-primary); font-size: 14px; }
    .closeButton { position: absolute; top: 8px; right: 8px; border: 0; background: transparent; color: var(--el-color-primary); font: inherit; cursor: pointer; padding: 4px 6px; }
  }
  .advancedSettings { margin-top: 16px; border-top: 1px solid var(--el-border-color-lighter); padding-top: 12px;
    > summary { cursor: pointer; font-size: 12px; font-weight: 500; padding: 4px 0 12px; }
  }

  .sectionLabel {
    margin-bottom: 8px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
    font-weight: 500;
  }

  > .el-select { margin-bottom: 14px; }

  .outputOptions {
    display: flex;
    gap: 12px;
    margin-bottom: 14px;
    .outputField { flex: 1; min-width: 0; }
  }

  .ratioOptions {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;

    .ratioButton {
      height: 60px;
      margin: 0;
      padding: 8px 4px;
      color: var(--el-text-color-secondary);
      --el-button-bg-color: var(--el-fill-color-light);
      --el-button-hover-bg-color: var(--el-fill-color);
      --el-button-hover-text-color: var(--el-text-color-primary);
      --el-button-hover-border-color: var(--el-border-color-darker);

      &[aria-pressed="true"] {
        color: var(--el-color-primary);
        border-color: var(--el-color-primary);
        background: var(--el-color-primary-light-9);
        box-shadow: inset 0 0 0 1px var(--el-color-primary);
      }

      .ratioContent {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        font-size: 12px;
      }
    }
  }

  .audioOption {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 14px;
    .sectionLabel { margin: 0; }
  }
}
</style>

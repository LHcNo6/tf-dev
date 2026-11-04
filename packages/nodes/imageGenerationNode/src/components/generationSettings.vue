<template>
  <el-popover v-model:visible="settingsVisible" trigger="click" placement="top-start" width="min(420px, calc(100vw - 24px))" :disabled="disabled" :showArrow="false" :popperStyle="{ padding: '14px' }" :popperOptions="{ modifiers: [{ name: 'preventOverflow', options: { altAxis: true, tether: false, padding: 12, rootBoundary: 'viewport' } }] }">
    <template #reference>
      <el-button class="settingsButton" text size="small" :disabled="disabled" :aria-expanded="settingsVisible" aria-label="图片生成设置" :title="summary">
        <span class="ratioShape" :style="ratioStyle(effectiveRatio)" aria-hidden="true" />
        <span>{{ summary }}</span>
        <component :is="settingsVisible ? IconChevronDown : IconChevronUp" :size="14" aria-hidden="true" />
      </el-button>
    </template>
    <div class="generationSettings nodrag nopan nowheel" @click.stop @pointerdown.stop @mousedown.stop @dblclick.stop @keydown.stop="onKeydown" @wheel.stop>
      <div class="currentSettings" role="status" aria-live="polite">
        <span>当前设置</span><strong>{{ summary }}</strong>
        <span>{{ isFlare ? '仅 1024x1024 明确为方形，其他尺寸以模型返回为准' : isSeedream ? '比例为构图要求，实际尺寸以模型返回为准' : '选择后即时生效' }}</span>
        <button type="button" class="closeButton" aria-label="收起图片参数" @click="settingsVisible = false">收起</button>
      </div>
      <div class="sectionLabel">分辨率</div>
      <el-radio-group v-model="size" class="sizeOptions" :disabled="disabled" aria-label="图片分辨率">
        <el-radio-button v-for="item in sizes" :key="item" :value="item">{{ item }}</el-radio-button>
      </el-radio-group>
      <div class="sectionLabel">比例</div>
      <div class="ratioOptions" role="group" aria-label="图片比例">
        <el-button
          v-for="item in ratios"
          :key="item"
          class="ratioButton"
          :disabled="disabled"
          :aria-label="`比例 ${item}`"
          :aria-pressed="effectiveRatio === item"
          @click="selectRatio(item)">
          <span class="ratioContent">
            <span class="ratioShape" :style="ratioStyle(item)" aria-hidden="true" />
            <span>{{ item }}</span>
          </span>
        </el-button>
      </div>
      <modelForm v-model="other" :rules="model?.rules" :disabled="disabled" :teleported="false" />
    </div>
  </el-popover>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { ElButton, ElPopover, ElRadioGroup, ElRadioButton } from "element-plus";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-vue";
import type { NodeMediaModel } from "@toonflow/nodes-scaffold/runtime";
import modelForm from "@toonflow/node-shared/modelForm";

const props = defineProps<{ sizes: string[]; ratios: string[]; model?: NodeMediaModel; disabled?: boolean }>();
const settingsVisible = ref(false);
const size = defineModel<string>("size", { required: true });
const ratio = defineModel<string>("ratio", { required: true });
const other = defineModel<Record<string, unknown>>("other", { required: true });
const count = computed(() => { const value = Number(other.value?.n ?? 1); return Number.isInteger(value) && value > 0 ? value : 1; });
const effectiveRatio = computed(() => {
  const override = other.value?.aspectRatio;
  return props.model?.providerId === "antaixin" && ((props.model?.modelId === "wan2.7-image-pro" && override === "auto") || (props.model?.modelId === "kling-image-o1" && override === "Original")) ? override : ratio.value;
});
const summary = computed(() => [effectiveRatio.value, size.value, `${count.value}张`].filter(Boolean).join(" · "));
const isSeedream = computed(() => props.model?.providerId === "antaixin" && props.model?.modelId === "seedream-5.0-pro");
const isFlare = computed(() => props.model?.providerId === "antaixin" && ["gpt-image-2.5-flare", "gpt-image-2.5-sunburst"].includes(props.model?.modelId ?? ""));

function onKeydown(event: KeyboardEvent) { if (event.key === "Escape") settingsVisible.value = false; }

function selectRatio(value: string) {
  ratio.value = value;
  if (effectiveRatio.value !== value) other.value = { ...other.value, aspectRatio: "" };
}

function ratioStyle(value: string) {
  const [width = 1, height = 1] = value === "auto" || value === "Original" ? [1, 1] : value.split(":").map(Number);
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
}

.generationSettings {
  text-align: left;
  max-height: min(680px, calc(100dvh - 64px)); overflow-y: auto; overscroll-behavior: contain; scrollbar-gutter: stable;
  .currentSettings { position: sticky; top: 0; z-index: 3; display: flex; flex-direction: column; gap: 5px; margin-bottom: 16px; padding: 10px 58px 10px 12px; border-radius: 8px; background: var(--el-color-primary-light-9); color: var(--el-text-color-regular); font-size: 12px; line-height: 1.5;
    strong { color: var(--el-color-primary); font-size: 14px; }
    .closeButton { position: absolute; top: 8px; right: 8px; border: 0; background: transparent; color: var(--el-color-primary); font: inherit; cursor: pointer; padding: 4px 6px; }
  }
  .sectionLabel {
    margin-bottom: 8px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
    font-weight: 500;
  }

  .sizeOptions {
    display: flex;
    gap: 8px;
    margin-bottom: 14px;
    .el-radio-button {
      flex: 1;
      --el-radio-button-checked-bg-color: var(--el-color-primary-light-9);
      --el-radio-button-checked-text-color: var(--el-color-primary);
      --el-radio-button-checked-border-color: var(--el-color-primary);

      :deep(.el-radio-button__inner) {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid var(--el-border-color);
        border-radius: var(--el-border-radius-base);
        box-shadow: none;

        &:hover { color: var(--el-text-color-primary); }
      }

      &.is-active :deep(.el-radio-button__inner) {
        border-color: var(--el-color-primary);
      }
    }
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
}
</style>

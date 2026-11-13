<template>
  <details class="toolActivity" :data-status="running ? 'running' : failed ? 'error' : interrupted ? 'interrupted' : 'success'" @toggle="expanded = ($event.target as HTMLDetailsElement).open">
    <summary class="activitySummary">
      <icon-chevron-right class="activityChevron" :size="14" aria-hidden="true" />
      <icon-loader-2 v-if="running" class="activityIcon activitySpinner" :size="16" aria-hidden="true" />
      <icon-tool v-else class="activityIcon" :size="16" aria-hidden="true" />
      <span class="activityLabel">{{ t`工具活动 · ${parts.length}` }}</span>
      <span class="activityStatus" :title="statusText">{{ statusText }}</span>
      <span v-if="failed" class="activityError">{{ t`${failed} 次失败` }}</span>
      <span v-if="interrupted" class="activityInterrupted">{{ t`${interrupted} 次中断` }}</span>
    </summary>
    <div v-if="expanded" class="activityDetails">
      <toolMessage v-for="part in parts" :key="part.id" v-model:collapsed="part.collapsed" :tool="part.tool" :directory="directory" @copy="emit('copy', $event)" />
    </div>
  </details>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { IconChevronRight, IconLoader2, IconTool } from "@tabler/icons-vue";
import { t } from "@toonflow/i18n/vue";
import toolMessage from "./toolMessage.vue";
import type { AgentMessagePart } from "./types";

const props = defineProps<{ parts: Extract<AgentMessagePart, { type: "tool" }>[]; directory?: string }>();
const emit = defineEmits<{ copy: [content: string] }>();
const expanded = ref(false);
const running = computed(() => props.parts.findLast(part => part.tool.status === "running"));
const failed = computed(() => props.parts.filter(part => part.tool.status === "error").length);
const interrupted = computed(() => props.parts.filter(part => part.tool.status === "interrupted").length);
const statusText = computed(() => running.value ? t`正在调用 ${running.value.tool.name}` : t`调用已结束`);
</script>

<style scoped lang="scss">
.toolActivity {
  min-width: 0;
  margin: 8px 0;
  color: var(--el-text-color-regular);
  font-size: 13px;

  .activitySummary {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    min-height: 36px;
    box-sizing: border-box;
    padding: 7px 10px;
    border: 1px solid var(--el-border-color-light);
    border-radius: calc(var(--ui-radius) * 1.25);
    background: var(--el-fill-color-light);
    cursor: pointer;
    list-style: none;
    line-height: 20px;

    &::-webkit-details-marker { display: none; }
    &:hover { background: var(--el-fill-color); border-color: var(--el-border-color); }
    &:focus-visible { outline: 2px solid var(--el-color-primary); outline-offset: 2px; }
    svg { flex-shrink: 0; }

    .activityIcon { color: var(--el-color-primary); }
    .activityLabel { flex-shrink: 0; color: var(--el-text-color-primary); font-weight: 600; }
    .activityStatus { flex: 1; min-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; }
    .activityError, .activityInterrupted {
      padding: 0 6px;
      border: 1px solid color-mix(in srgb, var(--el-color-danger) 40%, var(--el-border-color-light));
      border-radius: var(--ui-radius);
      color: var(--el-text-color-primary);
      background: color-mix(in srgb, var(--el-color-danger) 12%, var(--el-bg-color));
      font-size: 12px;
      font-weight: 500;
    }
    .activityInterrupted {
      border-color: color-mix(in srgb, var(--el-color-warning) 40%, var(--el-border-color-light));
      background: color-mix(in srgb, var(--el-color-warning) 12%, var(--el-bg-color));
    }
    .activitySpinner { animation: activitySpin 1.2s linear infinite; }
  }

  &[open] > .activitySummary .activityChevron { transform: rotate(90deg); }
  &[data-status="running"] > .activitySummary { border-color: var(--el-color-primary); }

  .activityDetails {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 0;
    margin: 10px 0 12px 16px;
    padding-left: 12px;
    border-left: 2px solid var(--el-border-color);
  }
}

@keyframes activitySpin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .toolActivity .activitySummary .activitySpinner { animation: none; } }
</style>

<template>
  <div v-click-outside:[editor]="closeMenu" class="skillMenu" @keydown.capture="handleKeydown">
    <el-button class="skillButton" text circle :disabled="disabled" :aria-expanded="visible" :aria-controls="listId" aria-label="选择指令与技能" title="选择指令与技能" @click="visible ? closeMenu() : buttonVisible = true"><icon-book :size="16" /></el-button>
    <el-card v-if="visible" class="skillPopup" shadow="always" :bodyStyle="{ padding: '6px' }">
      <el-scrollbar maxHeight="260px">
        <div :id="listId" role="listbox" aria-label="指令与技能" :aria-busy="loading">
          <div v-if="loading || !filteredSkills.length" class="skillStatus" role="status">{{ loading ? "正在加载指令…" : loadError || (skills.length ? "没有匹配的指令" : "暂无可用指令") }}</div>
          <button v-for="(skill, index) in filteredSkills" v-else :id="`${listId}-${index}`" :key="skill.command" class="skillItem" :class="{ active: index === activeIndex }" type="button" role="option" :aria-selected="index === activeIndex" @mouseenter="activeIndex = index" @mousedown.prevent @click="selectSkill(skill)">
            <span class="skillName" :title="skill.command"><icon-book :size="15" />{{ skill.displayName || skill.name }}<code>{{ skill.command }}</code></span>
            <span class="skillDescription">{{ skill.description }}</span>
          </button>
          <div v-if="loadError && filteredSkills.length" class="skillStatus" role="status">{{ loadError }}</div>
        </div>
      </el-scrollbar>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from "vue";
import axios from "axios";
import { IconBook } from "@tabler/icons-vue";
import { ClickOutside as vClickOutside } from "element-plus";
import { locale } from "@toonflow/i18n/vue";
import { loadImageCommands, useImageCommands } from "@/lib/imageCommands";

const props = withDefaults(defineProps<{ directory?: string; active: boolean; disabled: boolean; query?: string; editor?: HTMLElement; includeSkills?: boolean }>(), { includeSkills: true });
const emit = defineEmits<{ select: [name: string]; selectCommand: [id: string]; dismiss: [] }>();
type MenuCommand = { name: string; displayName?: string; description: string; command: string; kind: "skill" | "image" };
const listId = useId();
const buttonVisible = ref(false);
const visible = computed(() => props.active && !props.disabled && (buttonVisible.value || props.query !== undefined));
const skills = ref<MenuCommand[]>([]);
const { imageCommands } = useImageCommands();
const loading = ref(false);
const loadError = ref("");
const activeIndex = ref(0);
const filteredSkills = computed(() => {
  const query = (props.query ?? "").toLowerCase();
  return skills.value.filter(skill => `${skill.command} ${skill.displayName ?? ""} ${skill.description}`.toLowerCase().includes(query));
});

function closeMenu() {
  buttonVisible.value = false;
  emit("dismiss");
}

function selectSkill(skill: MenuCommand) {
  if (skill.kind === "image") emit("selectCommand", skill.name);
  else emit("select", skill.name);
  closeMenu();
}

function handleKeydown(event: KeyboardEvent) {
  if (!visible.value || event.isComposing || event.keyCode === 229) return;
  if (event.key === "Tab" && (event.shiftKey || loading.value || !filteredSkills.value.length)) return closeMenu();
  if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
  if (!["ArrowUp", "ArrowDown", "Enter", "Tab", "Escape"].includes(event.key)) return;
  event.preventDefault();
  event.stopPropagation();
  if (event.key === "Escape") return closeMenu();
  if (loading.value || !filteredSkills.value.length) return;
  if (event.key === "ArrowUp" || event.key === "ArrowDown") {
    activeIndex.value = (activeIndex.value + (event.key === "ArrowDown" ? 1 : -1) + filteredSkills.value.length) % filteredSkills.value.length;
  } else selectSkill(filteredSkills.value[activeIndex.value]!);
}

watch(filteredSkills, () => { activeIndex.value = 0; });
watch([visible, activeIndex, filteredSkills, loading, loadError], async () => {
  await nextTick();
  const editor = props.editor?.querySelector('[role="textbox"], textarea');
  editor?.setAttribute("aria-haspopup", "listbox");
  editor?.setAttribute("aria-expanded", String(visible.value));
  editor?.setAttribute("aria-controls", listId);
  if (visible.value && !loading.value && filteredSkills.value.length) {
    const id = `${listId}-${activeIndex.value}`;
    editor?.setAttribute("aria-activedescendant", id);
    document.getElementById(id)?.scrollIntoView({ block: "nearest" });
  } else editor?.removeAttribute("aria-activedescendant");
});

watch([visible, locale, () => props.directory, () => props.includeSkills], async ([open], _previous, onCleanup) => {
  if (!open) return closeMenu();
  const controller = new AbortController();
  onCleanup(() => controller.abort());
  loading.value = true;
  loadError.value = "";
  skills.value = [];
  const results = await Promise.allSettled([
    loadImageCommands(),
    props.includeSkills && props.directory ? axios.get("/api/agent/skills", {
      params: { directory: props.directory }, signal: controller.signal,
      headers: { "x-toonflow-workspace": "1" },
    }) : Promise.resolve(undefined),
  ]);
  if (controller.signal.aborted) return;
  const [imagesResult, skillsResult] = results;
  const entries: MenuCommand[] = [];
  if (imagesResult.status === "fulfilled") entries.push(...imageCommands.value.map(item => ({ name: item.id, displayName: item.name, description: `图片指令 · ${item.description}`, command: `/${item.id}`, kind: "image" as const })));
  else loadError.value = "图片指令加载失败，请重新打开重试";
  if (skillsResult.status === "fulfilled" && skillsResult.value) {
    const { data } = skillsResult.value;
    if (data.code === 200 && Array.isArray(data.data)) entries.push(...data.data.map((skill: { name: string; displayName?: string; description: string }) => ({ ...skill, command: `/skill:${skill.name}`, kind: "skill" as const })));
    else loadError.value = "技能加载失败，请重新打开重试";
  } else if (skillsResult.status === "rejected") {
    loadError.value = "技能加载失败，请重新打开重试";
  }
  skills.value = entries;
  loading.value = false;
});

defineExpose({ handleKeydown });
</script>

<style lang="scss" scoped>
.skillMenu {
  flex-shrink: 0;

  .skillButton {
    width: 24px;
    height: 24px;
    padding: 0;
  }

  .skillPopup {
    position: absolute;
    z-index: 20;
    right: 0;
    bottom: calc(100% + 8px);
    left: 0;

    .skillStatus {
      padding: 12px;
      color: var(--el-text-color-secondary);
    }

    .skillItem {
      display: flex;
      flex-direction: column;
      gap: 4px;
      width: 100%;
      padding: 8px;
      border: none;
      border-radius: var(--el-border-radius-base);
      background: transparent;
      color: var(--el-text-color-primary);
      font: inherit;
      text-align: left;
      overflow-wrap: anywhere;
      cursor: pointer;

      &.active, &:focus-visible {
        background: var(--el-fill-color-light);
      }

      .skillName {
        display: flex;
        align-items: center;
        gap: 6px;
        code { margin-inline-start: auto; color: var(--el-text-color-secondary); font-size: 11px; overflow-wrap: anywhere; }
      }

      .skillDescription {
        color: var(--el-text-color-secondary);
        font-size: 12px;
      }
    }
  }
}
</style>

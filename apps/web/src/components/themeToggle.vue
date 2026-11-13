<template>
  <button type="button" :aria-label="label" :title="label" :aria-pressed="dark" @click="toggleTheme">
    <component :is="dark ? IconSun : IconMoon" :size="18" aria-hidden="true" />
    <span v-if="!compact" class="sidebarText">{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed, onScopeDispose, ref } from "vue";
import { IconMoon, IconSun } from "@tabler/icons-vue";
import { t } from "@toonflow/i18n/vue";
import { uiSettings, updateUiSettings } from "@/stores/settings";

defineProps<{ compact?: boolean }>();
const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
const systemDark = ref(systemTheme.matches);
function updateSystemTheme(event: MediaQueryListEvent) { systemDark.value = event.matches; }
systemTheme.addEventListener("change", updateSystemTheme);
onScopeDispose(() => systemTheme.removeEventListener("change", updateSystemTheme));
const dark = computed(() => uiSettings.value.theme === "system" ? systemDark.value : uiSettings.value.theme === "dark");
const label = computed(() => t`深色`);
function toggleTheme() { updateUiSettings({ theme: dark.value ? "light" : "dark" }); }
</script>

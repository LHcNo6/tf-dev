<template>
  <section class="imageCommands" aria-labelledby="imageCommandsTitle">
    <header class="libraryHeader">
      <div class="libraryTitle">
        <h1 id="imageCommandsTitle">指令库<span class="libraryCount">{{ imageCommands.length }}</span></h1>
        <p>挑一种效果，把灵感带进下一张图。</p>
      </div>
      <el-input v-model="search" class="librarySearch" :prefixIcon="IconSearch" placeholder="搜索效果、用途或 /命令" aria-label="搜索图片指令" clearable />
    </header>

    <div class="collectionFilters" role="group" aria-label="指令范围">
      <button v-for="item in collections" :key="item.name" type="button" :class="{ active: collection === item.name }" :aria-pressed="collection === item.name" @click="collection = item.name; category = ''">
        {{ item.name }}<span>{{ item.count }}</span>
      </button>
    </div>

    <div class="libraryLayout">
      <aside class="categorySidebar" aria-label="图片指令分类">
        <span class="categoryHeading">浏览分类</span>
        <button type="button" :class="{ active: !category }" :aria-pressed="!category" @click="category = ''"><icon-layout-grid :size="17" aria-hidden="true" /><span>全部指令</span><small>{{ collectionCommands.length }}</small></button>
        <button v-for="item in categories" :key="item.name" type="button" :class="{ active: category === item.name }" :aria-pressed="category === item.name" @click="category = item.name">
          <component :is="categoryIcon(item.name)" :size="17" aria-hidden="true" /><span>{{ item.name }}</span><small>{{ item.count }}</small>
        </button>
      </aside>

      <div class="libraryContent" :aria-busy="imageCommandsLoading">
        <div class="resultHeading"><h2>{{ category || (collection === '全部' ? '全部指令' : `${collection}指令`) }}</h2><span aria-live="polite">{{ filteredCommands.length }} 条指令</span></div>
        <div v-if="imageCommandsLoading" class="libraryStatus" role="status">正在加载指令库…</div>
        <div v-else-if="imageCommandsError" class="libraryStatus" role="alert"><p>{{ imageCommandsError }}</p><el-button @click="reload">重新加载</el-button></div>
        <div v-else-if="!filteredCommands.length" class="libraryStatus" role="status"><icon-search :size="24" aria-hidden="true" /><p>没有找到匹配的指令</p><el-button text @click="search = ''; category = ''; collection = '全部'">清除筛选</el-button></div>
        <div v-else class="commandGrid">
          <button v-for="command in filteredCommands" :key="command.id" class="commandCard" type="button" :aria-label="`查看${command.name}指令`" @click="selected = command">
            <span class="commandVisual">
              <img v-if="previewImage(command.id)" :src="previewImage(command.id)" alt="" loading="lazy" decoding="async" width="640" height="640" />
              <component :is="categoryIcon(command.category)" v-else :size="38" :strokeWidth="1.3" aria-hidden="true" />
              <span class="commandCollection">{{ command.collection }}</span>
            </span>
            <span class="commandInfo">
              <span class="commandName">{{ command.name }}</span>
              <span class="commandDescription">{{ command.description }}</span>
              <span class="cardBottom"><code>/{{ command.id }}</code><icon-arrow-up-right :size="17" aria-hidden="true" /></span>
            </span>
          </button>
        </div>
      </div>
    </div>

    <el-dialog :modelValue="!!selected" :title="selected?.name" width="min(760px, calc(100vw - 32px))" class="commandDetail" alignCenter appendToBody @update:modelValue="!$event && (selected = undefined)">
      <template v-if="selected">
        <img v-if="previewImage(selected.id)" class="detailPreview" :src="previewImage(selected.id)" :alt="`${selected.name}效果预览`" decoding="async" width="640" height="640" />
        <div class="detailIntro"><span>{{ selected.category }}</span><code>/{{ selected.id }}</code></div>
        <p class="detailDescription">{{ selected.description }}</p>
        <dl class="detailRequirements">
          <div><dt>需要的参考</dt><dd>{{ selected.input }}</dd></div>
          <div><dt>应当保留</dt><dd>{{ selected.preserve }}</dd></div>
          <div><dt>建议画幅</dt><dd>{{ selected.ratio }}<span> · 可按创作需要调整</span></dd></div>
        </dl>
        <div class="promptHeading"><h3>完整提示词</h3><el-button text :icon="IconCopy" @click="copy(selected.prompt)">复制提示词</el-button></div>
        <pre class="detailPrompt">{{ selected.prompt }}</pre>
      </template>
      <template #footer>
        <div v-if="selected" class="detailFooter"><span>指令将填入草稿，由你确认发送。</span><div><el-button @click="copy(`/${selected.id} `)">复制命令</el-button><el-button type="primary" :icon="IconArrowUpRight" @click="useCommand(selected.id)">填入草稿</el-button></div></div>
      </template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from "vue";
import { ElMessage } from "element-plus";
import { IconArrowUpRight, IconCamera, IconCopy, IconLayoutGrid, IconMoodSmile, IconPalette, IconPaw, IconSearch, IconShoppingBag, IconTent } from "@tabler/icons-vue";
import type { ImageCommand } from "@toonflow/server/imageCommands";
import { useImageCommands } from "@/lib/imageCommands";
import { writeClipboardText } from "@/lib/clipboard";

const emit = defineEmits<{ select: [id: string] }>();
const { imageCommands, imageCommandsLoading, imageCommandsError, loadImageCommands } = useImageCommands();
const search = ref("");
const collection = ref("全部");
const category = ref("");
const selected = shallowRef<ImageCommand>();
const previewImages = import.meta.glob<string>("../../assets/imageCommands/*.webp", { eager: true, query: "?url", import: "default" });
function previewImage(id: string) { return previewImages[`../../assets/imageCommands/${id}.webp`]; }
const collections = computed(() => ["全部", "通用", "宠物"].map(name => ({ name, count: imageCommands.value.filter(item => name === "全部" || item.collection === name).length })));
const collectionCommands = computed(() => imageCommands.value.filter(item => collection.value === "全部" || item.collection === collection.value));
const categories = computed(() => [...new Set(collectionCommands.value.map(item => item.category))].map(name => ({ name, count: collectionCommands.value.filter(item => item.category === name).length })));
const filteredCommands = computed(() => {
  const query = search.value.trim().toLowerCase().replace(/^\//, "");
  return collectionCommands.value.filter(item => (!category.value || item.category === category.value)
    && `${item.id} ${item.name} ${item.category} ${item.description}`.toLowerCase().includes(query));
});

function categoryIcon(name: string) {
  return ({ 基础摄影: IconCamera, 通用风格: IconPalette, 宠物形象: IconPaw, 宠物材质与表情: IconMoodSmile, 宠物生活: IconTent, 宠物内容与带货: IconShoppingBag })[name] ?? IconPaw;
}

async function copy(text: string) {
  try { await writeClipboardText(text); ElMessage.success("已复制"); }
  catch (error) { ElMessage.error(error instanceof Error ? error.message : "复制失败，请重试"); }
}

function useCommand(id: string) {
  selected.value = undefined;
  emit("select", id);
}

async function reload() { await loadImageCommands().catch(() => {}); }
onMounted(reload);
</script>

<style scoped lang="scss">
.imageCommands {
  width: min(1280px, 100%);
  margin: 0 auto;
  padding: 28px 40px 64px;
  color: var(--el-text-color-primary);

  .libraryHeader {
    display: flex; align-items: center; justify-content: space-between; gap: 28px; margin-bottom: 24px;
    .libraryTitle {
      h1 { display: flex; align-items: center; gap: 12px; margin: 8px 0 9px; font-size: 32px; font-weight: 650; letter-spacing: -0.04em; line-height: 1.25; }
      .libraryCount { padding: 3px 9px; border: 1px solid var(--el-border-color); border-radius: 8px; color: var(--el-text-color-secondary); font: 12px/1.4 ui-monospace, monospace; letter-spacing: 0; }
      p { margin: 0; color: var(--el-text-color-secondary); font-size: 14px; line-height: 1.6; }
    }
    .librarySearch { max-width: 330px; :deep(.el-input__wrapper) { min-height: 42px; border-radius: 12px; background: var(--el-bg-color); } }
  }
  .collectionFilters {
    display: flex; align-items: center; gap: 8px; padding-bottom: 18px; border-bottom: 1px solid var(--el-border-color-lighter);
    button { display: flex; align-items: center; gap: 9px; padding: 9px 15px; border: 1px solid transparent; border-radius: 9px; background: transparent; color: var(--el-text-color-regular); font: inherit; font-size: 13px; cursor: pointer; transition: background-color 0.16s ease; span { color: var(--el-text-color-secondary); font: 11px ui-monospace, monospace; } &.active { border-color: var(--el-border-color); background: var(--el-bg-color); color: var(--el-text-color-primary); } &:hover { background: var(--el-fill-color); } }
  }
  .libraryLayout {
    display: grid; grid-template-columns: 176px minmax(0, 1fr); gap: 30px; padding-top: 24px;
    .categorySidebar {
      display: flex; flex-direction: column; gap: 5px; align-self: start; position: sticky; top: 24px;
      .categoryHeading { margin: 0 10px 12px; color: var(--el-text-color-secondary); font-size: 11px; letter-spacing: 0.08em; }
      button { display: flex; align-items: center; gap: 9px; width: 100%; padding: 11px 10px; border: 0; border-radius: 9px; background: transparent; color: var(--el-text-color-regular); font: inherit; font-size: 12px; text-align: start; cursor: pointer; transition: background-color 0.16s ease; svg { flex-shrink: 0; } small { margin-inline-start: auto; color: var(--el-text-color-secondary); font: 11px ui-monospace, monospace; } &.active { color: var(--el-color-primary); background: color-mix(in srgb, var(--el-color-primary) 10%, transparent); } &:hover { background: var(--el-fill-color); } }
    }
    .libraryContent {
      min-width: 0;
      .resultHeading { display: flex; align-items: center; justify-content: space-between; margin: 0 0 18px; gap: 16px; h2 { margin: 0; font-size: 15px; font-weight: 600; } > span { color: var(--el-text-color-secondary); font-size: 12px; } }
      .libraryStatus { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 260px; gap: 12px; color: var(--el-text-color-secondary); font-size: 14px; p { margin: 0; } }
      .commandGrid {
        display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px;
        .commandCard {
          display: flex; flex-direction: column; min-width: 0; padding: 0; overflow: hidden; border: 1px solid var(--el-border-color-lighter); border-radius: 15px; background: var(--el-bg-color); color: var(--el-text-color-primary); font-family: inherit; text-align: start; cursor: pointer; transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
          .commandVisual {
            position: relative; display: grid; place-items: center; width: 100%; aspect-ratio: 1; overflow: hidden; background: var(--el-fill-color-light); color: var(--el-text-color-secondary);
            img { display: block; width: 100%; height: 100%; object-fit: contain; }
            .commandCollection { position: absolute; top: 12px; right: 12px; padding: 4px 9px; border-radius: 6px; background: rgb(25 30 38 / 65%); color: #fff; font-size: 11px; line-height: 1.5; backdrop-filter: blur(8px); }
          }
          .commandInfo { display: flex; flex: 1; flex-direction: column; align-self: stretch; padding: 18px 20px; }
          .commandName { font-size: 17px; font-weight: 600; line-height: 1.5; }
          .commandDescription { margin: 8px 0 16px; color: var(--el-text-color-secondary); font-size: 12px; line-height: 1.8; }
          .cardBottom { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: auto; padding-top: 14px; border-top: 1px solid var(--el-border-color-extra-light); code { min-width: 0; overflow-wrap: anywhere; color: var(--el-text-color-regular); font: 11px/1.5 ui-monospace, monospace; } svg { flex-shrink: 0; color: var(--el-text-color-secondary); transition: transform 0.18s ease; } }
          &:hover { transform: translateY(-2px); border-color: var(--el-color-primary); box-shadow: var(--el-box-shadow-lighter); .cardBottom svg { transform: translate(2px, -2px); } }
          &:active { transform: translateY(0); }
        }
      }
    }
  }
  button:focus-visible { outline: 2px solid var(--el-color-primary); outline-offset: 3px; }

  @media (max-width: 1220px) { padding-inline: 28px; .libraryLayout { grid-template-columns: 155px minmax(0, 1fr); gap: 20px; .libraryContent .commandGrid { grid-template-columns: repeat(2, minmax(0, 1fr)); } } }
  @media (max-width: 760px) { padding: 24px 20px 40px; .libraryHeader { align-items: stretch; flex-direction: column; gap: 18px; margin-bottom: 20px; .librarySearch { max-width: none; } } .libraryLayout { display: block; padding-top: 18px; .categorySidebar { position: static; flex-direction: row; overflow-x: auto; gap: 6px; margin-bottom: 24px; padding-bottom: 4px; .categoryHeading { display: none; } button { flex: 0 0 auto; width: auto; white-space: nowrap; } } } }
  @media (max-width: 520px) { padding-inline: 16px; .libraryLayout .libraryContent .commandGrid { grid-template-columns: minmax(0, 1fr); } }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition: none !important; transform: none !important; } }
}
:global(.el-dialog.commandDetail) {
  display: flex;
  flex-direction: column;
  max-height: calc(100dvh - 32px);
}
:global(.commandDetail .el-dialog__body) { min-height: 0; overflow-y: auto; }
:global(.commandDetail .el-dialog__header), :global(.commandDetail .el-dialog__footer) { flex-shrink: 0; }
.commandDetail {
  .detailPreview { display: block; width: min(100%, 420px); height: auto; max-height: 52dvh; aspect-ratio: 1; margin: 0 auto 24px; border: 1px solid var(--el-border-color-lighter); border-radius: 12px; object-fit: contain; background: var(--el-fill-color-light); }
  .detailIntro { display: flex; align-items: center; justify-content: space-between; gap: 16px; color: var(--el-text-color-secondary); font-size: 12px; code { color: var(--el-color-primary); font-size: 12px; } }
  .detailDescription { margin: 18px 0; color: var(--el-text-color-primary); font-size: 15px; line-height: 1.8; }
  .detailRequirements { display: grid; gap: 15px; margin: 0 0 24px; padding: 18px; border: 1px solid var(--el-border-color-lighter); border-radius: 12px; div { display: grid; grid-template-columns: 86px minmax(0, 1fr); gap: 12px; font-size: 13px; line-height: 1.8; dt { color: var(--el-text-color-secondary); } dd { margin: 0; color: var(--el-text-color-regular); span { color: var(--el-text-color-secondary); } } } }
  .promptHeading { display: flex; align-items: center; justify-content: space-between; h3 { margin: 0; font-size: 14px; font-weight: 600; } }
  .detailPrompt { max-height: min(35vh, 320px); overflow: auto; margin: 10px 0 0; padding: 18px; border-radius: 12px; background: var(--el-fill-color-light); color: var(--el-text-color-regular); font-family: inherit; font-size: 13px; line-height: 1.9; white-space: pre-wrap; overflow-wrap: anywhere; }
  .detailFooter { display: flex; align-items: center; justify-content: space-between; gap: 16px; > span { color: var(--el-text-color-secondary); font-size: 12px; text-align: start; } > div { display: flex; flex-shrink: 0; } }
  @media (max-width: 560px) { .detailFooter { align-items: stretch; flex-direction: column; > div { justify-content: flex-end; } } .detailRequirements div { grid-template-columns: 72px minmax(0, 1fr); } }
}
</style>

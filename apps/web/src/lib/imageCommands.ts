import axios from "axios";
import { ref, shallowRef } from "vue";
import type { ImageCommand } from "@toonflow/server/imageCommands";

const imageCommands = shallowRef<ImageCommand[]>([]);
const imageCommandsLoading = ref(false);
const imageCommandsError = ref("");
let pending: Promise<void> | undefined;

export function loadImageCommands() {
  if (imageCommands.value.length) return Promise.resolve();
  if (pending) return pending;
  imageCommandsLoading.value = true;
  imageCommandsError.value = "";
  pending = axios.get("/api/imageCommands").then(({ data }) => {
    if (data.code !== 200 || !Array.isArray(data.data) || !data.data.every((item: ImageCommand) => item
      && [item.id, item.name, item.description, item.category, item.collection, item.input, item.preserve, item.ratio, item.prompt, item.source].every(value => typeof value === "string"))) {
      throw new Error(data.message || "指令库内容格式错误");
    }
    imageCommands.value = data.data;
  }).catch(error => {
    imageCommandsError.value = error instanceof Error ? error.message : "指令库加载失败";
    throw error;
  }).finally(() => {
    imageCommandsLoading.value = false;
    pending = undefined;
  });
  return pending;
}

export function useImageCommands() {
  return { imageCommands, imageCommandsLoading, imageCommandsError, loadImageCommands };
}

import { computed, onScopeDispose, ref, watch, type Ref } from "vue";
import { nodeTools, z } from "@toonflow/nodes-scaffold/nodeTools";
import type { NodeOutputs } from "@toonflow/nodes-scaffold/values";

export function useNodeGeneration(outputs: Readonly<Ref<NodeOutputs>>, cancel: () => void) {
  const status = ref<"idle" | "running" | "succeeded" | "failed">("idle");
  const error = ref("");
  const generating = computed(() => status.value === "running");
  const getStatus = () => ({ status: status.value, outputs: outputs.value, ...(error.value ? { error: error.value } : {}) });
  const pendingWaits = new Set<() => void>();
  onScopeDispose(() => { for (const cancelWait of pendingWaits) cancelWait(); });

  nodeTools.register({
    name: "getGenerationStatus",
    description: "查询本次打开节点后的生成状态（idle/running/succeeded/failed）、当前输出和最近一次生成错误。当前输出可能来自之前的生成；idle 不表示没有历史输出，只有 succeeded 表示本次生成成功",
    parameters: z.strictObject({}),
    execute: getStatus,
  });
  nodeTools.register({
    name: "waitGeneration",
    description: "等待当前节点生成结束，最多等待 30 秒；超时返回 running，可继续等待。仅等待本次打开节点后的状态，节点卸载或调用取消时停止等待，不取消生成",
    parameters: z.strictObject({}),
    async execute(_args, { signal }) {
      signal?.throwIfAborted();
      if (!generating.value) return getStatus();
      return await new Promise<ReturnType<typeof getStatus>>((resolve, reject) => {
        const finish = (failure?: unknown) => {
          clearTimeout(timer);
          stop();
          signal?.removeEventListener("abort", onAbort);
          pendingWaits.delete(onDispose);
          if (failure) reject(failure);
          else resolve(getStatus());
        };
        const onAbort = () => finish(signal?.reason ?? new Error("等待已取消"));
        const onDispose = () => finish(new Error("节点已卸载，无法继续等待生成"));
        const stop = watch(status, (value) => { if (value !== "running") finish(); });
        const timer = setTimeout(() => finish(), 30000);
        pendingWaits.add(onDispose);
        signal?.addEventListener("abort", onAbort, { once: true });
        if (signal?.aborted) onAbort();
      });
    },
  });
  nodeTools.register({
    name: "cancelGeneration",
    description: "请求停止当前后台生成；cancellationRequested 表示已发出停止请求，随后用 getGenerationStatus 查询终止状态。不会删除已有输出，不能保证供应商撤销任务或费用",
    parameters: z.strictObject({}),
    execute() {
      const cancellationRequested = generating.value;
      if (cancellationRequested) cancel();
      return { ...getStatus(), cancellationRequested };
    },
  });

  async function run<T>(task: () => Promise<T>): Promise<T> {
    if (generating.value) throw new Error("节点正在生成，请等待完成");
    status.value = "running";
    error.value = "";
    try {
      const result = await task();
      status.value = "succeeded";
      return result;
    } catch (failure) {
      status.value = "failed";
      const message = (failure as { response?: { data?: { message?: string } } })?.response?.data?.message;
      error.value = failure instanceof Error && failure.name === "AbortError" ? "生成已取消"
        : message || (failure instanceof Error ? failure.message : "生成失败");
      throw failure;
    }
  }

  return { generating, run };
}

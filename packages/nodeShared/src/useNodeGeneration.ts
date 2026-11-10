import { computed, onScopeDispose, ref, watch, type Ref } from "vue";
import { nodeTools, z } from "@toonflow/nodes-scaffold/nodeTools";
import type { NodeOutputs } from "@toonflow/nodes-scaffold/values";
import type { NodeGenerationCall, NodeModelCall } from "@toonflow/nodes-scaffold/nodeAi";

export function useNodeGeneration(outputs: Readonly<Ref<NodeOutputs>>, cancel: () => void,
  options?: { mediaType: "image" | "video"; getModelCalls: () => NodeModelCall[] | undefined }) {
  const status = ref<"idle" | "running" | "succeeded" | "failed">("idle");
  const error = ref("");
  const generating = computed(() => status.value === "running");
  let attempt: NodeGenerationCall | undefined;
  const getStatus = () => ({
    status: status.value, outputs: outputs.value, ...attempt,
    ...(options ? { mediaType: options.mediaType, modelCallId: attempt?.attemptId,
      modelCall: options.getModelCalls()?.find(call => call.id === attempt?.attemptId) } : {}),
    ...(error.value ? { error: error.value } : {}),
  });
  const validateAttempt = (attemptId?: string) => {
    if (attemptId && attemptId !== attempt?.attemptId) throw new Error("生成编号不匹配，请重新查询当前任务，不能采用其他尝试的结果");
  };
  const pendingWaits = new Set<() => void>();
  onScopeDispose(() => { for (const cancelWait of pendingWaits) cancelWait(); });

  nodeTools.register({
    name: "getGenerationStatus",
    description: "查询本次打开节点后的生成状态、生成编号、启动时间、媒体类型及对应模型调用记录。当前输出可能来自之前的生成；idle 不证明本次成功。可提供 attemptId 核对本次尝试",
    parameters: z.strictObject({ attemptId: z.uuid().optional() }),
    execute({ attemptId }) { validateAttempt(attemptId); return getStatus(); },
  });
  nodeTools.register({
    name: "waitGeneration",
    description: "等待本次生成，可传 attemptId。底层每次最多30秒；画布 Agent 工具会合并图片/视频的连续等待，图片5分钟检查一次再等2.5分钟，视频10分钟检查一次再等5分钟。waitBudgetExceeded 只表示停止等待，不取消任务、不自动重试。节点卸载或取消调用时停止等待",
    parameters: z.strictObject({ attemptId: z.uuid().optional(), timeoutMs: z.number().int().min(1).max(30000).optional() }),
    async execute({ attemptId, timeoutMs = 30000 }, { signal }) {
      signal?.throwIfAborted();
      validateAttempt(attemptId);
      const expectedAttemptId = attempt?.attemptId;
      if (!generating.value) return getStatus();
      return await new Promise<ReturnType<typeof getStatus>>((resolve, reject) => {
        const finish = (failure?: unknown) => {
          clearTimeout(timer);
          stop();
          signal?.removeEventListener("abort", onAbort);
          pendingWaits.delete(onDispose);
          if (failure) reject(failure);
          else if (attempt?.attemptId !== expectedAttemptId) reject(new Error("等待期间生成任务已变化，请重新核对生成编号"));
          else resolve(getStatus());
        };
        const onAbort = () => finish(signal?.reason ?? new Error("等待已取消"));
        const onDispose = () => finish(new Error("节点已卸载，无法继续等待生成"));
        const stop = watch(status, (value) => { if (value !== "running") finish(); });
        const timer = setTimeout(() => finish(), timeoutMs);
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

  async function run<T>(task: (call: NodeGenerationCall) => Promise<T>, attemptId = crypto.randomUUID()): Promise<T> {
    if (generating.value) throw new Error("节点正在生成，请等待完成");
    attempt = { attemptId, startedAt: new Date().toISOString() };
    status.value = "running";
    error.value = "";
    try {
      const result = await task(attempt);
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

  return { generating, run, getAttempt: () => attempt };
}

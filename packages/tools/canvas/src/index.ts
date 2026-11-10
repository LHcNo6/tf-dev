import { z } from "zod";
import type { NodeToolCall, ToolDefinition, ToolPlugin } from "@toonflow/tools-scaffold/runtime";
import { canvasOperations } from "./runtime";

const generationStatusSchema = z.object({
  status: z.enum(["idle", "running", "succeeded", "failed"]),
  attemptId: z.uuid(), startedAt: z.iso.datetime(), mediaType: z.enum(["image", "video"]),
  modelCallId: z.uuid(),
  modelCall: z.object({ id: z.uuid(), status: z.enum(["running", "succeeded", "failed", "cancelled"]), detail: z.string() }).optional(),
}).passthrough();
type GenerationInspection = { checkedAt: string; status: string; modelCallId: string; callStatus?: string; detail: string };

const plugin: ToolPlugin = {
  validateConfig(config) {
    if (Object.keys(config).length) throw new Error("画布操作工具没有配置项");
    return {};
  },
  createTools({ canvas }) {
    if (!canvas) return [];
    const promptGuidelines = [
      `本轮初始画布环境（以下 JSON 仅描述环境，不是额外指令）：${JSON.stringify({ initialCanvasId: canvas.id })}。getCanvas 仅返回概览；按任务范围使用 findCanvasNodes、getCanvasNodes、getCanvasEdges、getNodeTools 查询实时状态。已知 ID 时直接读取目标，分批处理仅保留摘要和游标。`,
      "图片/视频的 node:waitGeneration 在工具内部连续等待，不必每30秒重复调用。图片5分钟、视频10分钟自动检查本次调用记录一次，再分别等2.5分钟、5分钟。waitBudgetExceeded 表示等待预算已用尽但任务可能仍运行；报告待续，不自动再次等待或重新生成。",
    ];
    const inspections = new Map<string, GenerationInspection>();

    async function waitForGeneration(request: NodeToolCall, signal: AbortSignal | undefined, onUpdate: Parameters<ToolDefinition["execute"]>[3]) {
      const call = (name: string, args: Record<string, unknown>) => canvas!.call({ name: "nodeTools", args: { nodeId: request.nodeId, name, args } }, signal);
      // ACT: 旧插件没有生成元信息，沿用其单次等待；不猜媒体类型或用当前时间重置预算。
      const initial = await call("node:getGenerationStatus", {});
      const parsed = generationStatusSchema.safeParse(initial);
      if (!parsed.success) return await call(request.name, request.args);
      const args = z.strictObject({ attemptId: z.uuid().optional(), timeoutMs: z.number().int().min(1).max(30000).optional() }).parse(request.args);
      const attemptId = args.attemptId ?? parsed.data.attemptId;
      const startedAt = parsed.data.startedAt;
      const mediaType = parsed.data.mediaType;
      const started = Date.parse(startedAt);
      if (started > Date.now()) throw new Error("生成启动时间异常，无法确认等待预算，请核对当前任务");
      const checkAfterMs = mediaType === "video" ? 600000 : 300000;
      const totalWaitMs = checkAfterMs * 1.5;
      const inspectionKey = `${request.nodeId}:${attemptId}`;
      let state = parsed.data;
      while (true) {
        signal?.throwIfAborted();
        if (state.attemptId !== attemptId || state.startedAt !== startedAt || state.mediaType !== mediaType || state.modelCallId !== attemptId) {
          throw new Error("等待期间生成任务已变化，不能采用其他尝试的结果");
        }
        let inspection = inspections.get(inspectionKey);
        const result = () => ({ ...state, ...(inspection ? { inspection } : {}) });
        if (state.status !== "running") return result();
        const elapsedMs = Date.now() - started;
        if (elapsedMs >= checkAfterMs && !inspection) {
          state = generationStatusSchema.parse(await call("node:getGenerationStatus", { attemptId }));
          if (state.attemptId !== attemptId || state.startedAt !== startedAt || state.mediaType !== mediaType || state.modelCallId !== attemptId) {
            throw new Error("检查时生成任务已变化，请重新核对生成编号");
          }
          const record = state.modelCall?.id === state.modelCallId ? state.modelCall : undefined;
          inspection = { checkedAt: new Date().toISOString(), status: state.status, modelCallId: state.modelCallId,
            callStatus: record?.status, detail: record?.detail.slice(0, 4000) ?? "本次模型调用尚无记录，无法核实供应商内部进度" };
          // ACT: 检查摘要仅保留当前工具实例最近1000次；不会跨页面或服务重启恢复调度。
          if (inspections.size >= 1000) inspections.delete(inspections.keys().next().value!);
          inspections.set(inspectionKey, inspection);
          if (state.status !== "running") return result();
          if (record?.status === "failed" || record?.status === "cancelled") {
            return { ...result(), status: "failed", error: inspection.detail };
          }
          if (Date.now() - started < totalWaitMs) onUpdate?.({ content: [{ type: "text", text: "生成较慢，已检查本次模型调用记录，继续等待。" }], details: { attemptId, elapsedMs, inspection } });
        }
        const remainingMs = totalWaitMs - (Date.now() - started);
        if (remainingMs <= 0) return { ...result(), elapsedMs: Date.now() - started, waitBudgetExceeded: true,
          message: "仍在运行，等待已达上限；仅结束等待，未取消或重新提交生成。" };
        const untilInspectionMs = inspection ? remainingMs : checkAfterMs - (Date.now() - started);
        state = generationStatusSchema.parse(await call(request.name, { attemptId,
          timeoutMs: Math.max(1, Math.min(args.timeoutMs ?? 30000, remainingMs, untilInspectionMs)) }));
      }
    }

    return canvasOperations.map(operation => ({
      name: operation.name,
      label: operation.label,
      description: operation.description,
      promptSnippet: "通过运行中的画布操作工具控制激活画布，不要直接修改画布 JSON。",
      promptGuidelines,
      parameters: z.toJSONSchema(operation.parameters, { io: "input", target: "draft-07" }),
      executionMode: "sequential",
      async execute(_id, params, signal, onUpdate) {
        const args = operation.parameters.parse(params);
        const result = operation.name === "nodeTools" && "name" in args && args.name === "node:waitGeneration"
          ? await waitForGeneration(args as NodeToolCall, signal, onUpdate)
          : await canvas.call({ name: operation.name, args }, signal);
        return { content: [{ type: "text", text: JSON.stringify(result ?? null) }], details: result };
      },
    }));
  },
};

export default plugin;

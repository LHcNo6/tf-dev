import type { GeneratedMedia, MediaGenerationRequest } from "@toonflow/tools-scaffold/runtime";
import { error, errorFromCause, success, type ApiResponse } from "@/lib/responseFormat";
import { generateMedia } from "@/utils/media/generation";
import * as calls from "@/utils/media/calls";

type MediaTask = {
  cwd: string;
  controller: AbortController;
  touchedAt: number;
  settledAt?: number;
  result?: ApiResponse<GeneratedMedia[]>;
  scope?: calls.CallScope;
  call?: calls.MediaCall;
  saveError?: string;
  saving?: boolean;
};

// ACT: 单进程临时任务，结果结束后保留 5 分钟；重启和结果过期后不恢复。
const tasks = new Map<string, MediaTask>();

function stop(task: MediaTask, message: string) {
  if (task.result) return;
  task.result = error<GeneratedMedia[]>(message, null, 499);
  task.controller.abort(new Error(message));
}

function cleanup() {
  const now = Date.now();
  for (const [taskId, task] of tasks) {
    if (task.settledAt !== undefined) {
      if (!task.saveError && task.settledAt + 300000 <= now) tasks.delete(taskId);
    } else if (task.touchedAt + 120000 <= now) stop(task, "生成任务因页面长时间未连接而停止");
  }
}

const cleanupTimer = setInterval(cleanup, 30000);
cleanupTimer.unref();

export async function start(cwd: string, taskId: string, mediaType: "image" | "video" | "audio", request: MediaGenerationRequest, scope?: calls.CallScope) {
  cleanup();
  if (tasks.has(taskId)) throw Object.assign(new Error("生成任务已存在，请勿重复提交"), { status: 409 });
  // ACT: 最多 1000 个任务；取消后仍等待生成 Promise 收尾，避免忽略取消的供应商绕过上限。
  if (tasks.size >= 1000) throw Object.assign(new Error("生成任务过多，请稍后重试"), { status: 429 });
  const task: MediaTask = { cwd, controller: new AbortController(), touchedAt: Date.now(), scope };
  tasks.set(taskId, task);
  const startedAt = Date.now();
  if (scope && mediaType !== "audio") {
    task.call = { id: scope.callId, type: mediaType, providerId: request.providerId, modelId: request.modelId, startedAt: scope.startedAt, durationMs: 0, status: "preparing", detail: "正在准备提交" };
    try {
      await calls.save(cwd, scope, task.call, true);
      task.call = { ...task.call, status: "running", detail: "模型调用进行中" };
      await calls.save(cwd, scope, task.call);
    } catch (error) {
      tasks.delete(taskId);
      throw new Error("模型调用记录保存失败，未提交生成请求", { cause: error });
    }
  }
  let stage = "prepare";
  let errorCode = "";
  console.info("[媒体任务] 开始", { taskId, mediaType, providerId: request.providerId, modelId: request.modelId });
  void generateMedia(cwd, mediaType, request, task.controller.signal, value => { stage = value; }).then(
    files => { task.result ??= success(files); },
    cause => {
      let current: unknown = cause;
      for (let depth = 0; depth < 5 && current && typeof current === "object"; depth++) {
        const detail = current as { code?: unknown; cause?: unknown };
        if (typeof detail.code === "string" && /^[A-Z][A-Z0-9_]{1,63}$/.test(detail.code)) errorCode = detail.code;
        current = detail.cause;
      }
      const failure = errorFromCause(cause);
      task.result ??= { ...failure, message: `${failure.message}\n执行阶段：${stage}${errorCode ? `\n错误码：${errorCode}` : ""}`, data: null };
    },
  ).finally(async () => {
    task.saving = true;
    task.settledAt = Date.now();
    if (task.scope && task.call && task.result) {
      const result = task.result;
      task.call = { ...task.call, endedAt: new Date(task.settledAt).toISOString(), durationMs: Math.max(0, task.settledAt - Date.parse(task.call.startedAt)),
        status: result.code === 200 ? "succeeded" : result.code === 499 ? "cancelled" : "failed",
        detail: result.code === 200 ? `生成完成，返回 ${result.data?.length ?? 0} 个结果。` : result.message.slice(0, 16000),
        ...(result.code === 200 && result.data ? { results: result.data.map(({ path, mimeType }) => ({ path, mimeType })) } : {}) };
      await persist(task);
    }
    task.saving = false;
    console.info("[媒体任务] 结束", { taskId, mediaType, stage, code: task.result?.code, errorCode: errorCode || undefined, durationMs: task.settledAt - startedAt });
  });
}

async function persist(task: MediaTask) {
  if (!task.scope || !task.call) return;
  try {
    await calls.save(task.cwd, task.scope, task.call);
    task.saveError = undefined;
    await calls.prune(task.cwd, task.scope).catch(error => console.warn("清理模型调用记录失败", error));
  } catch (error) {
    task.saveError = "最终状态保存失败，请在模型调用记录中重试保存";
    console.error(task.saveError, error);
  }
}

export async function listCalls(cwd: string, scope: Pick<calls.CallScope, "canvasId" | "nodeId">) {
  const records = await calls.list(cwd, scope);
  return records.map(call => {
    const task = tasks.get(call.id);
    if (task?.cwd === cwd && task.scope?.canvasId === scope.canvasId && task.scope.nodeId === scope.nodeId) {
      return task.saveError && task.call ? { ...task.call, saveError: task.saveError } : call;
    }
    return call.status === "running" || call.status === "preparing" ? { ...call, status: "unknown", detail: "本地任务已不可确认，远端状态未知；请查看供应商记录，勿直接重复提交。" } : call;
  });
}

export async function retryCall(cwd: string, scope: Pick<calls.CallScope, "canvasId" | "nodeId">, callId: string) {
  const task = tasks.get(callId);
  if (!task || task.cwd !== cwd || task.scope?.canvasId !== scope.canvasId || task.scope.nodeId !== scope.nodeId || !task.saveError) throw Object.assign(new Error("没有可重试保存的最终状态"), { status: 404 });
  await persist(task);
  if (task.saveError) throw new Error(task.saveError);
}

export function status(cwd: string, taskIds: string[]) {
  cleanup();
  return taskIds.map(taskId => {
    const task = tasks.get(taskId);
    if (!task || task.cwd !== cwd) return { taskId, result: error<GeneratedMedia[]>("生成任务不存在或已过期", null, 404) };
    task.touchedAt = Date.now();
    return { taskId, ...(task.result && task.settledAt !== undefined && !task.saving ? { result: task.saveError ? { ...task.result, message: `${task.result.message}\n${task.saveError}` } : task.result, saveError: task.saveError } : {}) };
  });
}

export function cancel(cwd: string, taskIds: string[]) {
  for (const taskId of taskIds) {
    const task = tasks.get(taskId);
    if (task?.cwd === cwd) stop(task, "生成已取消");
  }
}

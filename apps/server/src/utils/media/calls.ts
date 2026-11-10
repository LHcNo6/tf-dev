import { mkdir, readFile, readdir, unlink } from "@toonflow/file";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { resolveWorkspacePath, writeWorkspaceFile } from "@/utils/workspace/files";

export type CallScope = { canvasId: string; nodeId: string; callId: string; startedAt: string };
export type MediaCall = { id: string; type: "image" | "video"; providerId: string; modelId: string; startedAt: string; durationMs: number; status: "preparing" | "running" | "succeeded" | "failed" | "cancelled" | "unknown"; detail: string; endedAt?: string; results?: { path: string; mimeType: string }[] };

async function directory(cwd: string, scope: Pick<CallScope, "canvasId" | "nodeId">, create = false) {
  const hash = createHash("sha256").update(JSON.stringify([scope.canvasId, scope.nodeId])).digest("hex");
  const path = (await resolveWorkspacePath(cwd, `.toonflow/modelCalls/${hash}`, true)).path;
  if (create) {
    await mkdir(path, { recursive: true });
    await resolveWorkspacePath(cwd, `.toonflow/modelCalls/${hash}`);
  }
  return path;
}

export async function save(cwd: string, scope: CallScope, call: MediaCall, exclusive = false) {
  const dir = await directory(cwd, scope, true);
  const path = (await resolveWorkspacePath(cwd, `.toonflow/modelCalls/${dir.split(/[\\/]/).at(-1)}/${scope.callId}.json`, true)).path;
  await writeWorkspaceFile(path, JSON.stringify(call), exclusive);
}

export async function list(cwd: string, scope: Pick<CallScope, "canvasId" | "nodeId">) {
  const dir = await directory(cwd, scope);
  const names = await readdir(dir).catch((error: NodeJS.ErrnoException) => { if (error.code === "ENOENT") return []; throw error; });
  const records = await Promise.all(names.filter(name => /^[0-9a-f-]{36}\.json$/i.test(name)).map(async name => {
    const path = (await resolveWorkspacePath(cwd, `.toonflow/modelCalls/${dir.split(/[\\/]/).at(-1)}/${name}`)).path;
    return JSON.parse(await readFile(path, "utf8")) as MediaCall;
  }));
  return records.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

export async function prune(cwd: string, scope: CallScope) {
  const records = await list(cwd, scope);
  const dir = await directory(cwd, scope);
  const finished = records.filter(call => ["succeeded", "failed", "cancelled"].includes(call.status));
  for (const call of finished.slice(100)) {
    if (!/^[0-9a-f-]{36}$/i.test(call.id)) continue;
    await unlink(join(dir, `${call.id}.json`));
  }
}

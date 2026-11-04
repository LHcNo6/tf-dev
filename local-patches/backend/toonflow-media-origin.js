// Local Toonflow 2.0.8 patch: preserve generated-media origins for video references.
// Keep local asset paths as the canvas contract. Metadata contains signed URLs,
// so sidecars are private files and URL values are never logged.
import { createHash, randomUUID } from "node:crypto";
import { constants } from "node:fs";
import { open, rename, unlink } from "node:fs/promises";
import { basename, dirname, join } from "node:path";

const MAX_MEDIA_BYTES = 100 * 1024 * 1024;
const MAX_METADATA_BYTES = 64 * 1024;
const PROBE_TIMEOUT_MS = 8000;

export function originMetadataPath(assetPath) {
  return join(dirname(assetPath), `.${basename(assetPath)}.toonflow-origin.json`);
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function validHttpUrl(value) {
  if (typeof value !== "string" || value.length > 16384) return false;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password;
  } catch { return false; }
}

export async function rememberGeneratedImageOrigin(assetPath, asset, bytes, mimeType, signal) {
  signal?.throwIfAborted();
  if (!["image", "video", "audio"].includes(asset?.mediaType) || asset.type !== "url" || !validHttpUrl(asset.url)
      || !mimeType.startsWith(`${asset.mediaType}/`) || !bytes.length || bytes.length > MAX_MEDIA_BYTES) return false;
  const target = originMetadataPath(assetPath);
  const temp = `${target}.${randomUUID()}.tmp`;
  let file;
  try {
    const record = {
      version: 1,
      sourceUrl: asset.url,
      sha256: sha256(bytes),
      byteLength: bytes.length,
      mimeType,
      savedAt: new Date().toISOString(),
    };
    file = await open(temp, "wx", 0o600);
    await file.writeFile(JSON.stringify(record), "utf8");
    await file.close();
    file = undefined;
    signal?.throwIfAborted();
    await rename(temp, target);
    return true;
  } catch (error) {
    signal?.throwIfAborted();
    // Saving a successful paid image must not fail because auxiliary metadata failed.
    console.warn("[Toonflow 原始URL] 来源记录未保存，将沿用本地参考图流程。", error?.code || "metadata-write-failed");
    return false;
  } finally {
    await file?.close().catch(() => {});
    await unlink(temp).catch(() => {});
  }
}

async function readMetadata(assetPath) {
  let file;
  try {
    file = await open(originMetadataPath(assetPath), constants.O_RDONLY | constants.O_NOFOLLOW);
    const info = await file.stat();
    if (!info.isFile() || info.size > MAX_METADATA_BYTES) return;
    return JSON.parse(await file.readFile("utf8"));
  } catch { return; }
  finally { await file?.close().catch(() => {}); }
}

export async function resolveOriginalImageUrl(assetPath, bytes, mimeType, signal, fetcher = fetch) {
  signal?.throwIfAborted();
  const record = await readMetadata(assetPath);
  signal?.throwIfAborted();
  if (record?.version !== 1 || !validHttpUrl(record.sourceUrl)
      || record.mimeType !== mimeType || record.byteLength !== bytes.length
      || record.sha256 !== sha256(bytes)) return;
  // A generated/signed URL may expire or later serve different bytes. Verify the
  // original without cookies or provider credentials before passing it downstream.
  const timeout = AbortSignal.timeout(PROBE_TIMEOUT_MS);
  const probeSignal = signal ? AbortSignal.any([signal, timeout]) : timeout;
  let reader;
  try {
    const response = await fetcher(record.sourceUrl, { method: "GET", redirect: "follow", signal: probeSignal });
    if (!response.ok || !response.body
        || Number(response.headers.get("content-length")) > MAX_MEDIA_BYTES) {
      await response.body?.cancel().catch(() => {});
      return;
    }
    reader = response.body.getReader();
    const digest = createHash("sha256");
    let length = 0;
    while (true) {
      probeSignal.throwIfAborted();
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > record.byteLength || length > MAX_MEDIA_BYTES) return;
      digest.update(value);
    }
    signal?.throwIfAborted();
    if (length === record.byteLength && digest.digest("hex") === record.sha256) return record.sourceUrl;
  } catch {
    // User cancellation propagates; expiry, timeout and network failures use the
    // unchanged local Base64 path, letting the provider upload a fresh copy.
    signal?.throwIfAborted();
    return;
  } finally {
    await reader?.cancel().catch(() => {});
  }
}

export async function removeGeneratedImageOrigin(assetPath) {
  await unlink(originMetadataPath(assetPath)).catch(error => {
    if (error?.code !== "ENOENT") {
      console.warn("[Toonflow 原始URL] 来源记录未清理。", error?.code || "metadata-remove-failed");
    }
  });
}

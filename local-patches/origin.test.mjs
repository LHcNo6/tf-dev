import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { originMetadataPath, rememberGeneratedImageOrigin, removeGeneratedImageOrigin, resolveOriginalImageUrl } from "../apps/server/src/utils/media/origin.js";

test("generated media URL is reused only when local and remote content match", async () => {
  const directory = await mkdtemp(join(tmpdir(), "toonflow-origin-test-"));
  try {
    const path = join(directory, "image.png");
    const bytes = Buffer.from("media bytes");
    const url = "https://example.invalid/image.png";
    assert.equal(await rememberGeneratedImageOrigin(path, { mediaType: "image", type: "url", url }, bytes, "image/png"), true);
    const metadata = JSON.parse(await readFile(originMetadataPath(path), "utf8"));
    assert.equal(metadata.sourceUrl, url);
    const same = async () => new Response(bytes);
    const different = async () => new Response("different");
    assert.equal(await resolveOriginalImageUrl(path, bytes, "image/png", undefined, same), url);
    assert.equal(await resolveOriginalImageUrl(path, bytes, "image/png", undefined, different), undefined);
    assert.equal(await resolveOriginalImageUrl(path, Buffer.from("changed"), "image/png", undefined, same), undefined);
    await removeGeneratedImageOrigin(path);
    assert.equal(await resolveOriginalImageUrl(path, bytes, "image/png", undefined, same), undefined);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

import { test, expect } from "bun:test";
import { readFile, writeFile, mkdir, mkdtemp, rm, stat, readdir, symlink } from "node:fs/promises";
import { join, resolve, relative, dirname, basename } from "node:path";
import { tmpdir } from "node:os";

// Runs the actual installed/candidate generation -> persistence -> video-input chain.
// All provider and download boundaries are local fixtures; no paid API requests.
const bundlePath = process.env.TOONFLOW_TEST_BUNDLE || "/Applications/toonflow.app/Contents/Resources/app/bun/index.js";
const source = await readFile(bundlePath, "utf8");
let originModule: any = {};
if (source.includes('from "./toonflow-media-origin.js"')) {
  originModule = await import(join(dirname(bundlePath), "toonflow-media-origin.js"));
}

function extract(start: string, end: string) {
  const a = source.indexOf(start);
  const b = source.indexOf(end, a + start.length);
  if (a < 0 || b < 0) throw new Error(`Missing installed function: ${start}`);
  return source.slice(a, b);
}

const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j3ioAAAAASUVORK5CYII=", "base64");
const originUrl = "https://media.example.invalid/original.png?signature=offline";
let imageSequence = 0;

async function harness(options: { responseType?: string; fetchMode?: string; imageCount?: number } = {}) {
  const root = await mkdtemp(join(tmpdir(), "toonflow-origin-regression-"));
  let submitted: any;
  let imageRequest: any;
  let fetchCount = 0;
  let fetchMode = options.fetchMode || "ok";
  let failSecond = false;
  const signal = new AbortController();
  const fail = (s: string) => { throw new Error(s); };
  const pathResolver = async (base: string, path: string) => {
    const full = resolve(base, path);
    if (relative(base, full).startsWith("..")) throw new Error("outside workspace");
    return { path: full };
  };
  const fetchFixture = async (_url: any, options: any = {}) => {
    fetchCount++;
    options.signal?.throwIfAborted();
    if (fetchMode === "abort") { signal.abort(); options.signal?.throwIfAborted(); }
    if (fetchMode === "network") throw new TypeError("offline simulated network error");
    if (fetchMode === "expired") return new Response("expired", { status: 403 });
    if (fetchMode === "changed") return new Response(Buffer.from("changed remote content"), { headers: { "content-type": "image/png" } });
    return new Response(png, { headers: { "content-type": "image/png", "content-length": String(png.length) } });
  };
  const helpers: any = {
    __toonflowOriginRemember: originModule.rememberGeneratedImageOrigin,
    __toonflowOriginResolve: originModule.resolveOriginalImageUrl
      ? (...args: any[]) => originModule.resolveOriginalImageUrl(...args, fetchFixture)
      : undefined,
    __toonflowOriginRemove: originModule.removeGeneratedImageOrigin,
  };
  const converterBindings: any = {
    h1: pathResolver, r4: stat, hg: readFile,
    Cu0: (_bytes: any, mime: string) => mime,
    zo: 100 * 1024 * 1024, JT: fail,
    hA: (parts: any, ...values: any[]) => String.raw({ raw: parts }, ...values), ...helpers,
  };
  function bind(code: string, bindings: any) {
    return new Function(...Object.keys(bindings), `return (${code});`)(...Object.values(bindings));
  }
  const Ku0 = bind(extract("async function Ku0(", "async function P84("), converterBindings);
  const jXg = bind(extract("async function jXg(", "async function xXg("), { JT: fail });
  const provider = {
    rules: [], config: {},
    async generateImage(request: any) {
      imageRequest = request;
      return Array.from({ length: options.imageCount || 1 }, () => ({ mediaType: "image", type: options.responseType || "url", url: originUrl, data: png.toString("base64"), mimeType: "image/png" }));
    },
    async generateVideo(request: any) { submitted = request; return [{ mediaType: "video", type: "binary", data: Buffer.from("video"), mimeType: "video/mp4" }]; },
  };
  let downloadCount = 0;
  const Tf = bind(extract("async function Tf(", "var zo="), {
    C1: async (p: string) => p,
    h1: pathResolver,
    xXg: async () => provider,
    JT: fail,
    hA: converterBindings.hA,
    Rg: (v: any) => v,
    jXg, Ku0,
    QLA: () => () => {},
    L84: async (asset: any) => {
      downloadCount++;
      if (failSecond && downloadCount > 1) throw new Error("second result failed");
      return { bytes: asset.mediaType === "image" ? png : Buffer.from("video"), mimeType: asset.mimeType || "image/png" };
    },
    z4: () => () => {}, m1: mkdir,
    X84: (dir: string, file: string) => join(dir, file),
    crypto: { randomUUID: () => String(++imageSequence) },
    yXg: { "image/png": "png", "video/mp4": "mp4" },
    y2: (path: string, bytes: any) => writeFile(path, bytes, { flag: "wx" }),
    z84: relative,
    XB: (path: string) => rm(path), ...helpers,
  });
  return {
    root, signal,
    generate: (image?: any) => Tf(root, "image", { prompt: "offline", providerId: "fixture", modelId: "image", outputDirectory: "assets/generated", ...(image ? { images: [image] } : {}) }, signal.signal),
    video: (reference: any, field = "images") => Tf(root, "video", { prompt: "offline", providerId: "fixture", modelId: "video", [field]: field === "images" ? [reference] : reference, outputDirectory: "assets/video" }, signal.signal),
    get request() { return submitted; },
    get imageRequest() { return imageRequest; },
    get fetchCount() { return fetchCount; },
    setMode: (mode: string) => { fetchMode = mode; },
    failSecond: () => { failSecond = true; },
    close: () => rm(root, { recursive: true, force: true }),
  };
}

test("generated URL survives local persistence and reaches video provider unchanged", async () => {
  const h = await harness();
  try {
    const [image] = await h.generate();
    expect(image.path.startsWith("assets/")).toBe(true);
    await h.video(image);
    expect(h.request.images[0].type).toBe("url");
    expect(h.request.images[0].url).toBe(originUrl);
    expect(h.fetchCount).toBe(1);
  } finally { await h.close(); }
});

function metadataPath(root: string, image: any) {
  const full = join(root, image.path);
  return join(dirname(full), `.${basename(full)}.toonflow-origin.json`);
}

test("origin metadata persists next to the image with private permissions", async () => {
  const h = await harness();
  try {
    const [image] = await h.generate();
    const path = metadataPath(h.root, image);
    const record = JSON.parse(await readFile(path, "utf8"));
    expect(record.sourceUrl).toBe(originUrl);
    expect(record.sha256).toHaveLength(64);
    expect((await stat(path)).mode & 0o777).toBe(0o600);
    // A fresh ES module instance has no shared in-memory state.
    const fresh = await import(join(dirname(bundlePath), "toonflow-media-origin.js") + "?fresh-test=1");
    const url = await fresh.resolveOriginalImageUrl(join(h.root, image.path), png, "image/png", undefined,
      async () => new Response(png));
    expect(url).toBe(originUrl);
  } finally { await h.close(); }
});

test("image-editing inputs retain the pre-existing Base64 protocol", async () => {
  const h = await harness();
  try {
    const [image] = await h.generate();
    await h.generate(image);
    expect(h.imageRequest.images[0].type).toBe("base64");
    expect(h.fetchCount).toBe(0);
  } finally { await h.close(); }
});

test("malformed origin metadata falls back without submitting an untrusted URL", async () => {
  const h = await harness();
  try {
    const [image] = await h.generate();
    await writeFile(metadataPath(h.root, image), "{broken json");
    await h.video(image);
    expect(h.request.images[0].type).toBe("base64");
    expect(h.fetchCount).toBe(0);
  } finally { await h.close(); }
});

test("source metadata symlinks are ignored", async () => {
  const h = await harness();
  try {
    const [image] = await h.generate();
    const path = metadataPath(h.root, image);
    const target = join(h.root, "external-metadata.json");
    await writeFile(target, await readFile(path));
    await rm(path);
    await symlink(target, path);
    await h.video(image);
    expect(h.request.images[0].type).toBe("base64");
    expect(h.fetchCount).toBe(0);
  } finally { await h.close(); }
});

test("failed multi-image generation removes both saved assets and origin metadata", async () => {
  const h = await harness({ imageCount: 2 });
  try {
    h.failSecond();
    await expect(h.generate()).rejects.toThrow("second result failed");
    expect(await readdir(join(h.root, "assets/generated"))).toEqual([]);
  } finally { await h.close(); }
});

test("first and last frame use the same origin resolver", async () => {
  const h = await harness();
  try {
    const [image] = await h.generate();
    await h.video(image, "firstFrame");
    expect(h.request.firstFrame.type).toBe("url");
    await h.video(image, "lastFrame");
    expect(h.request.lastFrame.url).toBe(originUrl);
  } finally { await h.close(); }
});

for (const mode of ["expired", "network", "changed"]) {
  test(`${mode} origin falls back to intact local Base64`, async () => {
    const h = await harness({ fetchMode: mode });
    try {
      const [image] = await h.generate();
      await h.video(image);
      expect(h.request.images[0].type).toBe("base64");
      expect(Buffer.from(h.request.images[0].data, "base64")).toEqual(png);
    } finally { await h.close(); }
  });
}

test("modified local file cannot reuse the old image URL", async () => {
  const h = await harness();
  try {
    const [image] = await h.generate();
    const edited = Buffer.concat([png, Buffer.from("edited")]);
    await writeFile(join(h.root, image.path), edited);
    await h.video(image);
    expect(h.request.images[0].type).toBe("base64");
    expect(Buffer.from(h.request.images[0].data, "base64")).toEqual(edited);
    expect(h.fetchCount).toBe(0);
  } finally { await h.close(); }
});

test("images without a source URL retain the existing Base64 workflow", async () => {
  const h = await harness({ responseType: "base64" });
  try {
    const [image] = await h.generate();
    await h.video(image);
    expect(h.request.images[0].type).toBe("base64");
    expect(h.fetchCount).toBe(0);
  } finally { await h.close(); }
});

test("user cancellation propagates rather than falling back and submitting", async () => {
  const h = await harness({ fetchMode: "abort" });
  try {
    const [image] = await h.generate();
    await expect(h.video(image)).rejects.toThrow();
    expect(h.request).toBeUndefined();
  } finally { await h.close(); }
});

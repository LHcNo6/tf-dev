import { test, expect } from "bun:test";
const file = process.env.TOONFLOW_TEST_PROVIDER || "/Applications/data/providers/antaixin.ts";
const { default: provider } = await import(file);

const cfHtml = `<!DOCTYPE html><html><head><title>antaixin.ai | 524: A timeout occurred</title></head>
<body><h1>A timeout occurred Error code 524</h1><div>2026-10-29 10:44:30 UTC</div>
<div>Browser Working</div><div>Cloudflare Working</div><div>antaixin.ai Host Error</div></body></html>`;

test("524 submission preserves uncertainty and presents a concise diagnostic without HTML", async () => {
  const calls: any[] = [];
  const context = {
    config: { apiKey: "offline-fixture-key" },
    signal: new AbortController().signal,
    tool: { fetch: async (url: string, init: any) => {
      calls.push({ url, method: init.method });
      return new Response(cfHtml, { status: 524, headers: { "Content-Type": "text/html", "CF-Ray": "offline-ray-fixture-LAX" } });
    } },
  };
  let error: any;
  try { await provider.generateVideo.call(context, {
    model: "seedance-2.5-video", prompt: "offline", duration: 24,
    resolution: "480p", ratio: "9:16", images: [{ type: "url", url: "https://media.example.invalid/probe.png" }],
  }); } catch (caught) { error = caught; }
  console.log("Submission error:", error?.message?.slice(0, 900));
  expect(calls).toHaveLength(1);
  expect(error?.message).toContain("524");
  expect(error?.message).toContain("远端任务状态未知");
  expect(error?.message).toContain("offline-ray-fixture-LAX");
  expect(error?.message).not.toContain("<!DOCTYPE");
  expect(error?.message.length).toBeLessThan(1000);
});

async function runVideo(responses: any[], request: any = {}) {
  const calls: any[] = [];
  const controller = new AbortController();
  const originalTimer = globalThis.setTimeout;
  globalThis.setTimeout = ((fn: any, delay: number, ...args: any[]) => originalTimer(fn, delay === 5000 ? 0 : delay, ...args)) as any;
  try {
    const context = {
      config: { apiKey: "offline-fixture-key" }, signal: controller.signal,
      tool: { fetch: async (url: string, init: any) => {
        calls.push({ url, method: init.method, body: init.body });
        const next = responses.shift();
        if (next === "abort") { controller.abort(); throw controller.signal.reason; }
        if (next instanceof Error) throw next;
        if (!(next instanceof Response)) throw new Error("Unexpected extra HTTP request");
        return next;
      } },
    };
    let result: any;
    let error: any;
    try { result = await provider.generateVideo.call(context, { model: "seedance-2.5-video", prompt: "offline", ...request }); }
    catch (caught) { error = caught; }
    return { result, error, calls };
  } finally { globalThis.setTimeout = originalTimer; }
}

test("ordinary JSON validation errors remain readable", async () => {
  const r = await runVideo([Response.json({ error: { message: "duration invalid" } }, { status: 400 })]);
  expect(r.error.message).toContain("duration invalid");
  expect(r.calls).toHaveLength(1);
});

test("HTML errors never spill a document into the node", async () => {
  const r = await runVideo([new Response(cfHtml, { status: 403, headers: { "content-type": "text/html" } })]);
  expect(r.error.message).toContain("HTML 错误页");
  expect(r.error.message).not.toContain("<!DOCTYPE");
});

test("submission network loss reports unknown state and never retries POST", async () => {
  const r = await runVideo([new TypeError("fetch failed")]);
  expect(r.error.message).toContain("远端任务状态未知");
  expect(r.calls).toHaveLength(1);
});

for (const response of [Response.json({}), new Response("not JSON")]) {
  test("unusable submission responses preserve uncertainty without a second POST", async () => {
    const r = await runVideo([response]);
    expect(r.error.message).toContain("远端任务状态未知");
    expect(r.calls).toHaveLength(1);
  });
}

test("524 diagnostics reveal Base64 reference counts and request size without content", async () => {
  const bytes=Buffer.alloc(1200000); Buffer.from("89504e470d0a1a0a","hex").copy(bytes);
  const data = bytes.toString("base64");
  const r = await runVideo([new Response(cfHtml, { status: 524 })], {
    other:{imageTransport:"inline"},
    images: [{ type: "base64", mimeType: "image/png", data }, { type: "url", url: "https://example.invalid/image.png?secret=hidden" }],
  });
  expect(r.error.message).toContain("Base64 1 个");
  expect(r.error.message).toContain("HTTP(S)链接 1 个");
  expect(r.error.message).toContain("1.5 MiB");
  expect(r.error.message).not.toContain("secret=hidden");
  expect(r.error.message).not.toContain("offline-fixture-key");
});

test("success keeps URL references unchanged and polls the returned task", async () => {
  const imageUrl = "https://example.invalid/original.png";
  const r = await runVideo([
    Response.json({ id: "task-fixture" }),
    Response.json({ status: "running" }),
    Response.json({ status: "succeeded", content: { video_url: "https://example.invalid/result.mp4" } }),
  ], { images: [{ type: "url", url: imageUrl }] });
  expect(r.error).toBeUndefined();
  expect(r.result[0].url).toBe("https://example.invalid/result.mp4");
  expect(JSON.parse(r.calls[0].body).content[1].image_url.url).toBe(imageUrl);
  expect(r.calls.filter((c: any) => c.method === "POST")).toHaveLength(1);
  expect(r.calls[1].url).toEndWith("/task-fixture");
});

test("transient polling errors retry GET only for the known task", async () => {
  const r = await runVideo([
    Response.json({ id: "task-fixture" }), new Response(cfHtml, { status: 524 }),
    Response.json({ status: "succeeded", content: { video_url: "https://example.invalid/result.mp4" } }),
  ]);
  expect(r.error).toBeUndefined();
  expect(r.calls.map((c: any) => c.method)).toEqual(["POST", "GET", "GET"]);
});

for (const status of ["expired", "cancelled", "failed"]) {
  test(`${status} terminates polling and preserves the known task ID`, async () => {
    const r = await runVideo([Response.json({ id: "task-fixture" }), Response.json({ status, error: { message: "fixture reason" } })]);
    expect(r.error.message).toContain(status);
    expect(r.error.message).toContain("task-fixture");
    expect(r.calls).toHaveLength(2);
  });
}

test("user cancellation stops polling without another submission", async () => {
  const r = await runVideo([Response.json({ id: "task-fixture" }), "abort"]);
  expect(r.error?.name).toBe("AbortError");
  expect(r.calls.filter((c: any) => c.method === "POST")).toHaveLength(1);
});

export async function extractLastFrame(content: ArrayBuffer, mimeType: string, signal: AbortSignal) {
  signal.throwIfAborted();
  const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
  const video = document.createElement("video");
  video.muted = true;
  video.preload = "auto";
  try {
    await new Promise<void>((resolve, reject) => {
      const timer = window.setTimeout(() => finish(new Error("视频尾帧读取超时")), 15000);
      function finish(error?: unknown) {
        clearTimeout(timer);
        video.onloadeddata = null;
        video.onseeked = null;
        video.onerror = null;
        signal.removeEventListener("abort", abort);
        error ? reject(error) : resolve();
      }
      function abort() { finish(signal.reason ?? new Error("尾帧提取已取消")); }
      video.onloadeddata = () => {
        if (!Number.isFinite(video.duration) || video.duration <= 0) return finish(new Error("无法读取视频时长"));
        video.currentTime = Math.max(0, video.duration - 0.001);
        if (video.currentTime === 0) finish();
      };
      video.onseeked = () => finish();
      video.onerror = () => finish(new Error("无法解码视频尾帧"));
      signal.addEventListener("abort", abort, { once: true });
      video.src = url;
      video.load();
      if (signal.aborted) abort();
    });
    signal.throwIfAborted();
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context || !canvas.width || !canvas.height) throw new Error("视频尾帧尺寸无效");
    context.drawImage(video, 0, 0);
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error("尾帧图片编码失败")), "image/png"));
    signal.throwIfAborted();
    return { blob, width: canvas.width, height: canvas.height };
  } finally {
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(url);
  }
}

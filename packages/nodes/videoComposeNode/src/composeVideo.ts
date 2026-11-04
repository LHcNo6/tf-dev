import type { BrowserFfmpegCommand, BrowserFfmpegFactory, FfprobeData } from "@toonflow/ffmpeg/browser";

export type Clip = { path: string; start: number; end: number | null };
export type ComposeOptions = { clips: Clip[]; audio?: string; audioMode: "mix" | "replace"; originalVolume: number; backgroundVolume: number; subtitle?: string; subtitleMode: "burn" | "track"; output: string };

function probe(ffmpeg: BrowserFfmpegFactory, path: string): Promise<FfprobeData> {
  return new Promise((resolve, reject) => ffmpeg(path).ffprobe((error, data) => error ? reject(error) : resolve(data)));
}

function query(ffmpeg: BrowserFfmpegFactory, method: "availableEncoders" | "availableFilters"): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => ffmpeg[method]((error, result) => error ? reject(error) : resolve(result)));
}

function run(command: BrowserFfmpegCommand, signal: AbortSignal, progress: (value: number) => void, duration: number) {
  const cancel = () => command.kill();
  return new Promise<void>((resolve, reject) => {
    signal.addEventListener("abort", cancel, { once: true });
    command.on("start", () => { if (signal.aborted) command.kill(); });
    command.on("progress", value => {
      const parts = value.timemark?.split(":").map(Number);
      if (parts?.length === 3 && parts.every(Number.isFinite)) progress(Math.min(99, Math.round((parts[0]! * 3600 + parts[1]! * 60 + parts[2]!) / duration * 100)));
    });
    command.on("error", error => reject(signal.aborted ? signal.reason : error));
    command.on("end", () => signal.aborted ? reject(signal.reason) : resolve());
    if (signal.aborted) reject(signal.reason); else command.run();
  }).finally(() => signal.removeEventListener("abort", cancel));
}

export async function composeVideo(ffmpeg: BrowserFfmpegFactory, options: ComposeOptions, signal: AbortSignal, progress: (value: number) => void) {
  if (!options.clips.length) throw new Error("请添加至少一个视频");
  const encoders = await query(ffmpeg, "availableEncoders");
  if (!encoders.libx264 || !encoders.aac) throw new Error("当前 FFmpeg 缺少 libx264 或 AAC 编码器，请在插件市场配置支持的 FFmpeg");
  if (options.subtitle && options.subtitleMode === "burn") {
    const filters = await query(ffmpeg, "availableFilters");
    if (!filters.subtitles) throw new Error("当前 FFmpeg 不支持字幕烧录，请更换 FFmpeg 或选择可关闭字幕轨");
  }
  const info = [];
  for (const clip of options.clips) {
    signal.throwIfAborted();
    const media = await probe(ffmpeg, clip.path);
    const video = media.streams.find(item => item.codec_type === "video" && !item.disposition?.attached_pic);
    const duration = Number(media.format.duration ?? video?.duration);
    const end = clip.end ?? duration;
    if (!video?.width || !video.height || !Number.isFinite(duration) || duration <= 0) throw new Error("无法读取视频画面或时长");
    if (!Number.isFinite(clip.start) || !Number.isFinite(end) || clip.start < 0 || end <= clip.start || end > duration + 0.01) throw new Error("裁剪范围须满足 0 ≤ 开始时间 < 结束时间 ≤ 视频时长");
    info.push({ video, duration: Math.min(end, duration) - clip.start, audio: media.streams.some(item => item.codec_type === "audio") });
  }
  signal.throwIfAborted();
  const width = Math.ceil(info[0]!.video.width! / 2) * 2;
  const height = Math.ceil(info[0]!.video.height! / 2) * 2;
  const total = info.reduce((sum, item) => sum + item.duration, 0);
  const command = ffmpeg();
  for (const clip of options.clips) command.input(clip.path);
  const audioIndex = options.clips.length;
  if (options.audio) command.input(options.audio);
  const subtitleIndex = audioIndex + (options.audio ? 1 : 0);
  if (options.subtitle && options.subtitleMode === "track") command.input(options.subtitle);
  const filters: string[] = [];
  info.forEach((item, index) => {
    const start = options.clips[index]!.start;
    filters.push(`[${index}:${item.video.index}]trim=start=${start}:duration=${item.duration},setpts=PTS-STARTPTS,scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:black,setsar=1,fps=30,format=yuv420p[v${index}]`);
    filters.push(item.audio
      ? `[${index}:a:0]atrim=start=${start}:duration=${item.duration},asetpts=PTS-STARTPTS,aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,apad=whole_dur=${item.duration},atrim=duration=${item.duration}[a${index}]`
      : `anullsrc=r=48000:cl=stereo,atrim=duration=${item.duration},asetpts=PTS-STARTPTS[a${index}]`);
  });
  filters.push(`${info.map((_, i) => `[v${i}][a${i}]`).join("")}concat=n=${info.length}:v=1:a=1[vcat][acat]`);
  let videoOutput = "vcat";
  if (options.subtitle && options.subtitleMode === "burn") {
    if (!/^[a-zA-Z0-9_./-]+$/.test(options.subtitle)) throw new Error("字幕路径包含不支持的字符，请重新上传字幕");
    filters.push(`[vcat]subtitles=filename='${options.subtitle}'[vout]`);
    videoOutput = "vout";
  }
  if (options.audio) {
    filters.push(`[${audioIndex}:a:0]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,volume=${options.backgroundVolume},apad=whole_dur=${total},atrim=duration=${total},asetpts=PTS-STARTPTS[bg]`);
    if (options.audioMode === "mix") filters.push(`[acat]volume=${options.originalVolume}[orig];[orig][bg]amix=inputs=2:duration=first:normalize=0[aout]`);
    else filters.push("[acat]anullsink;[bg]anull[aout]");
  } else filters.push(`[acat]volume=${options.originalVolume}[aout]`);
  command.complexFilter(filters).output(options.output).videoCodec("libx264").audioCodec("aac").format("mp4")
    .outputOptions("-map", `[${videoOutput}]`, "-map", "[aout]", "-t", String(total), "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-preset", "fast", "-crf", "18");
  if (options.subtitle && options.subtitleMode === "track") command.outputOptions("-map", `${subtitleIndex}:s:0`, "-c:s", "mov_text");
  await run(command, signal, progress, total);
  signal.throwIfAborted();
  const result = await probe(ffmpeg, options.output);
  if (!result.streams.some(item => item.codec_type === "video") || !(Number(result.format.duration) > 0)) throw new Error("合成的视频无效");
}

type Context = {
  config: { apiKey?: string };
  signal?: AbortSignal;
  tool: {
    fetch: typeof fetch;
    media?: { inspectImage(input: MediaInput): Promise<{width:number;height:number;format:string}>; resizeImage(input:MediaInput, options:any):Promise<MediaInput> };
  };
};

type MediaAsset =
  | { mediaType: "image" | "video" | "audio"; type: "url"; url: string; mimeType?: string; name?: string }
  | { mediaType: "image" | "video" | "audio"; type: "base64"; data: string; mimeType: string; name?: string }
  | { mediaType: "image" | "video" | "audio"; type: "binary"; data: Uint8Array; mimeType: string; name?: string };

type MediaInput =
  | { type: "url"; url: string; mimeType?: string; name?: string }
  | { type: "base64"; data: string; mimeType: string; name?: string }
  | { type: "binary"; data: Uint8Array; mimeType: string; name?: string };

type ImageRequest = {
  model: string;
  prompt: string;
  images?: MediaInput[];
  mask?: MediaInput;
  n?: number;
  ratio?: string;
  size?: string;
  quality?: string;
  outputFormat?: string;
  other?: Record<string, unknown>;
};

type VideoRequest = {
  model: string;
  prompt: string;
  referenceOrder?: ({ type:"image"|"video"|"audio"; index:number } | {type:"firstFrame"|"lastFrame"|"text"})[];
  mode?: string | string[];
  images?: MediaInput[];
  videos?: MediaInput[];
  audios?: MediaInput[];
  firstFrame?: MediaInput;
  lastFrame?: MediaInput;
  duration?: number;
  ratio?: string;
  resolution?: string;
  generateAudio?: boolean;
  watermark?: boolean;
  other?: Record<string, unknown>;
};

// 直接提取 URL，不再进行图床转存
function getMediaUrl(input: MediaInput): string {
  if (input.type === "url") return input.url;
  if (input.type === "base64") return input.data.startsWith("data:") ? input.data : `data:${input.mimeType};base64,${input.data}`;
  if (input.type === "binary") {
    return `data:${input.mimeType};base64,${Buffer.from(input.data).toString("base64")}`;
  }
  throw new Error("不支持的媒体格式");
}

function safeErrorText(value: unknown): string {
  let text = typeof value === "string" ? value : "";
  if (/<(?:!doctype|html|head|body)\b/i.test(text)) return "上游返回 HTML 错误页";
  for (let i=0;i<3;i++) {
    try { const value=JSON.parse(text); const next=value?.error?.message ?? value?.message ?? value?.error; if(typeof next!=="string") break; text=next; } catch { break; }
  }
  return text.replace(/\s+/g, " ").trim().slice(0, 700);
}

async function parseError(response: Response): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) return `HTTP ${response.status}`;
  const decoder = new TextDecoder();
  const timer = setTimeout(() => { void reader.cancel().catch(() => {}); }, 3000);
  let text = "";
  let bytes = 0;
  try {
    while (bytes < 16384) {
      const { done, value } = await reader.read();
      if (done) break;
      text += decoder.decode(value.subarray(0, 16384 - bytes), { stream: true });
      bytes += value.byteLength;
    }
    text += decoder.decode();
    if (/text\/html/i.test(response.headers.get("content-type") || "")) return "上游返回 HTML 错误页";
    try {
      const json = JSON.parse(text);
      const error = json?.error;
      const message = typeof error === "string" ? error
        : typeof error?.message === "string" ? error.message
        : typeof json?.message === "string" ? json.message
        : typeof error?.code === "string" ? error.code : "";
      return safeErrorText(message) || `HTTP ${response.status}`;
    } catch { return safeErrorText(text) || `HTTP ${response.status}`; }
  } catch { return `HTTP ${response.status}`; }
  finally { clearTimeout(timer); await reader.cancel().catch(() => {}); }
}

function videoPayloadSummary(content: any[], payload: string): string {
  const urls = content.flatMap(item => {
    const value = item.image_url?.url ?? item.video_url?.url ?? item.audio_url?.url;
    return typeof value === "string" ? [value] : [];
  });
  const publicUrls = urls.filter(url => /^https?:\/\//i.test(url)).length;
  const inline = urls.filter(url => /^data:/i.test(url)).length;
  return `素材：HTTP(S)链接 ${publicUrls} 个，Base64 ${inline} 个；请求体约 ${(Buffer.byteLength(payload, "utf8") / 1048576).toFixed(1)} MiB`;
}

async function videoSubmitError(response: Response, summary: string): Promise<Error> {
  const ray = (response.headers.get("cf-ray") || "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 100);
  const trace = ray ? `；CF-Ray: ${ray}` : "";
  if (response.status >= 500 || response.status === 408) {
    await response.body?.cancel().catch(() => {});
    const reason = response.status === 524 ? "Cloudflare 与安泰信源站交互超时"
      : "上游服务异常或超时";
    return new Error(`视频任务提交异常，HTTP ${response.status}：${reason}${trace}。尚未取得任务 ID，远端任务状态未知；请先查看安泰信任务/调用记录，勿直接重复提交。${summary}。延长本机等待时间无法解除网关超时。`);
  }
  const message=await parseError(response);
  if(response.status===400 && /Reference image upload failed; task was not submitted/i.test(message)) {
    return new Error(`视频任务提交失败，HTTP 400：安泰信参考图导入失败；服务端明确表示任务未提交。${summary}${trace}。请核查素材链接或平台素材服务，勿反复点击生成。上游原因：${message}`);
  }
  return new Error(`视频任务提交失败，HTTP ${response.status}：${message}${trace}`);
}

async function waitForVideoPoll(milliseconds: number, signal: AbortSignal): Promise<void> {
  signal.throwIfAborted();
  await new Promise<void>((resolve, reject) => {
    const abort = () => { clearTimeout(timer); signal.removeEventListener("abort", abort); reject(signal.reason); };
    const timer = setTimeout(() => { signal.removeEventListener("abort", abort); resolve(); }, milliseconds);
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) abort();
  });
}

const IMAGE_RATIOS=["1:1","4:3","3:4","16:9","9:16","3:2","2:3","21:9"];
const VIDEO_RATIOS=["adaptive","16:9","9:16","1:1","4:3","3:4","21:9"];
function integer(value:unknown,min:number,max:number,label:string):asserts value is number {
  if(!Number.isSafeInteger(value) || Number(value)<min || Number(value)>max) throw new Error(`${label}必须为 ${min}–${max} 的整数`);
}
function booleanValue(value:unknown,label:string):boolean {
  if(typeof value!=="boolean") throw new Error(`${label}必须为布尔值`);
  return value;
}
function publicUrl(value:unknown,label:string):string {
  if(typeof value!=="string" || value.length>16384) throw new Error(`${label}需要有效公网 HTTP(S) URL`);
  let url:URL;
  try {url=new URL(value);} catch {throw new Error(`${label}需要有效公网 HTTP(S) URL`);}
  if(!["https:","http:"].includes(url.protocol) || url.username || url.password || url.hostname==="localhost" || /^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1\]?$)/.test(url.hostname)) throw new Error(`${label}需要无需登录的公网 HTTP(S) URL，不能使用本机地址`);
  return value;
}
function inputBytes(input:MediaInput):Buffer {
  if(input.type==="binary") return Buffer.from(input.data);
  if(input.type!=="base64") throw new Error("当前素材不是本地图片");
  const raw=input.data.replace(/^data:[^;,]+;base64,/,"").replace(/\s/g,"");
  if(!raw || raw.length>4*Math.ceil(20*1048576/3) || !/^[a-zA-Z0-9+/]*={0,2}$/.test(raw) || raw.length%4===1) throw new Error("图片 Base64 内容无效或超过20MB");
  return Buffer.from(raw,"base64");
}
async function checkImage(context:Context,input:MediaInput,label:string):Promise<void> {
  if(input.type==="url") {publicUrl(input.url,label);return;}
  const bytes=inputBytes(input);
  const mime=input.mimeType?.toLowerCase().split(';')[0];
  const detected=bytes[0]===0x89 && bytes.subarray(1,4).toString()==="PNG" ? "image/png"
    : bytes[0]===0xff && bytes[1]===0xd8 && bytes[2]===0xff ? "image/jpeg"
    : bytes.subarray(0,4).toString()==="RIFF" && bytes.subarray(8,12).toString()==="WEBP" ? "image/webp" : "";
  if(!detected || detected!==mime) throw new Error(`${label}只支持内容与 MIME 一致的 PNG / JPEG / WebP`);
  if(!bytes.length || bytes.length>20*1048576) throw new Error(`${label}不能为空且不能超过20MB`);
  if(context.tool.media?.inspectImage) {
    const meta=await context.tool.media.inspectImage({type:"binary",data:bytes,mimeType:mime});
    if(Math.min(meta.width,meta.height)<32 || Math.max(meta.width,meta.height)>8000) throw new Error(`${label}最长边须≤8000像素、最短边须≥32像素`);
  }
}
async function uploadImage(context:Context,input:MediaInput,apiKey:string,label:string,compress=true):Promise<string> {
  let bytes=inputBytes(input);
  if(compress && bytes.length>1048576 && context.tool.media?.resizeImage) {
    const meta=await context.tool.media.inspectImage(input);
    const scale=Math.min(1,2048/Math.max(meta.width,meta.height));
    const resized=await context.tool.media.resizeImage(input,{width:Math.max(32,Math.round(meta.width*scale)),height:Math.max(32,Math.round(meta.height*scale)),format:"webp",quality:90});
    const smaller=inputBytes(resized);
    if(smaller.length<bytes.length) {input=resized;bytes=smaller;}
  }
  if(bytes.length>10*1048576) throw new Error(`${label}超过安泰信网页上传接口的10MB上限，请压缩或选择Base64传递方式；视频任务尚未提交`);
  const mime=input.mimeType!;
  const ext=mime==="image/png"?"png":mime==="image/webp"?"webp":"jpg";
  const boundary=`toonflow-${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
  const body=Buffer.concat([Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="reference.${ext}"\r\nContent-Type: ${mime}\r\n\r\n`),bytes,Buffer.from(`\r\n--${boundary}--\r\n`)]);
  const signal=AbortSignal.any([AbortSignal.timeout(60000),...(context.signal?[context.signal]:[])]);
  let response:Response;
  try {response=await context.tool.fetch("https://antaixin.ai/api/upload/image",{method:"POST",headers:{Authorization:`Bearer ${apiKey}`,"Content-Type":`multipart/form-data; boundary=${boundary}`},body,signal});}
  catch {context.signal?.throwIfAborted();throw new Error(`${label}上传安泰信素材接口时连接中断；视频任务尚未提交`);}
  if(!response.ok) throw new Error(`${label}上传失败，HTTP ${response.status}：${await parseError(response)}；视频任务尚未提交`);
  let result:any;
  try {result=await response.json();}catch {throw new Error(`${label}上传响应无效；视频任务尚未提交`);}
  if(result?.success===false) throw new Error(`${label}上传未成功；视频任务尚未提交`);
  const path=result?.data?.path ?? result?.path;
  const url=path ? new URL(path,"https://antaixin.ai").href : result?.data?.url ?? result?.url;
  try {return publicUrl(url,label);} catch {throw new Error(`${label}上传未返回可用的公网 URL；视频任务尚未提交`);}
}
function urlList(value:unknown,label:string):string[] {
  if(value===undefined || value==="") return [];
  const values=typeof value==="string" ? value.split(/\r?\n/).map(s=>s.trim()).filter(Boolean) : Array.isArray(value)?value:[];
  if(!Array.isArray(value) && typeof value!=="string") throw new Error(`${label} URL 必须逐行填写`);
  return values.map((v,i)=>publicUrl(v,`${label} ${i+1}`));
}
function publicReferences(inputs:MediaInput[]|undefined,override:unknown,label:string):MediaInput[] {
  const urls=urlList(override,label);
  if(!inputs?.length) return urls.map(url=>({type:"url",url}));
  if(urls.length && urls.length!==inputs.length) throw new Error(`${label} URL 数量须与连线数量相同，并保持顺序`);
  return inputs.map((input,index)=>{
    if(urls[index]) return {type:"url",url:urls[index]};
    if(input.type==="url") return {...input,url:publicUrl(input.url,`${label} ${index+1}`)};
    throw new Error(`参考${label} ${index+1} 缺少公网 URL。该接口不接受本地${label}的 Base64；请在节点设置中按连线顺序填写参考${label}公网 URL`);
  });
}
function checkDurations(value:unknown,count:number,output:number,label:string):void {
  if(value===undefined || value==="") return;
  const durations=typeof value==="string"?value.split(/[,，\s]+/).filter(Boolean).map(Number):Array.isArray(value)?value:[];
  if(durations.length!==count || durations.some(x=>typeof x!=="number" || !Number.isFinite(x) || x<=0)) throw new Error(`参考${label}秒数须按素材顺序填写正数`);
  const total=durations.reduce((a,b)=>a+b,0);
  if(total>30 || (label==="视频" && output>0 && total+output>30)) throw new Error(label==="视频"?"参考视频总时长与输出时长之和不能超过30秒":"参考音频总时长不能超过30秒");
}
function referencePrompt(request:VideoRequest,images:MediaInput[],videos:MediaInput[],audios:MediaInput[]):string {
  return request.prompt.replace(/\{\{ref (\d+)\}\}/g,(marker,number)=>{
    const ref=request.referenceOrder?.[Number(number)-1];
    if(!ref) throw new Error(`引用标记 ${marker} 缺少连线素材映射，请更新后端并重新选择引用`);
    if(ref.type==="text") return `参考 ${number}`;
    if(ref.type==="firstFrame" || ref.type==="lastFrame") {
      if(!request[ref.type]) throw new Error(`${marker} 对应的首尾帧不存在`);
      return ref.type==="firstFrame"?"首帧":"尾帧";
    }
    const lists={image:images,video:videos,audio:audios};
    if(!("index" in ref) || !Number.isSafeInteger(ref.index) || ref.index<0 || !lists[ref.type]?.[ref.index]) throw new Error(`${marker} 对应的参考素材不存在`);
    return `${{image:"图片",video:"视频",audio:"音频"}[ref.type]}${ref.index+1}`;
  });
}


export default {
  id: "antaixin",
  label: "安泰信 (Antaixin)",
  version: "4.1.1",
  readme: "Seedream：1K/2K，最多10张参考图；图片比例以提示词约束，当前图片接口未声明独立比例参数。Seedance：4–30秒、可选音频、首尾帧与多模态参考；旧图片先上传安泰信再提交URL。视频/音频参考须提供公网URL；生成结果可复用来源链接。",
  rules: [
    {
      type: "input",
      field: "apiKey",
      title: "API Key",
      value: "",
      props: { type: "password", showPassword: true, autocomplete: "off" }
    }
  ],
  models: [
  {
    "id": "seedream-5.0-pro",
    "label": "Seedream 5.0 Pro（文生图 / 最多10张参考图）",
    "type": "image",
    "mode": [
      "text",
      "singleImage",
      "multiReference"
    ],
    "imageSizes": [
      "1K",
      "2K"
    ],
    "imageRatios": [
      "1:1",
      "4:3",
      "3:4",
      "16:9",
      "9:16",
      "3:2",
      "2:3",
      "21:9"
    ],
    "rules": [
      {
        "type": "select",
        "field": "n",
        "title": "生成数量",
        "value": 1,
        "options": [
          {
            "label": "1",
            "value": 1
          },
          {
            "label": "2",
            "value": 2
          },
          {
            "label": "3",
            "value": 3
          },
          {
            "label": "4",
            "value": 4
          }
        ]
      }
    ]
  },
  {
    "id": "seedance-2.5-video",
    "label": "Seedance 2.5（文生视频 / 首尾帧 / 多模态参考）",
    "type": "video",
    "mode": [
      "text",
      "singleImage",
      "endFrameOptional",
      "startEndRequired",
      [
        "imageReference:30",
        "videoReference:10",
        "audioReference:10"
      ]
    ],
    "audio": "optional",
    "durationResolutionMap": [
      {
        "duration": [
          4,
          5,
          6,
          7,
          8,
          9,
          10,
          11,
          12,
          13,
          14,
          15,
          16,
          17,
          18,
          19,
          20,
          21,
          22,
          23,
          24,
          25,
          26,
          27,
          28,
          29,
          30
        ],
        "resolution": [
          "480p",
          "720p",
          "1080p"
        ]
      }
    ],
    "rules": [
      {
        "type": "switch",
        "field": "compressReferences",
        "title": "压缩大型本地参考图（WebP，最长边2048；不修改原图）",
        "value": true
      },
      {
        "type": "select",
        "field": "ratio",
        "title": "视频画幅（覆盖通用比例）",
        "value": "",
        "options": [
          {
            "label": "跟随通用比例",
            "value": ""
          },
          {
            "label": "adaptive",
            "value": "adaptive"
          },
          {
            "label": "16:9",
            "value": "16:9"
          },
          {
            "label": "9:16",
            "value": "9:16"
          },
          {
            "label": "1:1",
            "value": "1:1"
          },
          {
            "label": "4:3",
            "value": "4:3"
          },
          {
            "label": "3:4",
            "value": "3:4"
          },
          {
            "label": "21:9",
            "value": "21:9"
          }
        ]
      },
      {
        "type": "select",
        "field": "omni_reference_task_type",
        "title": "任务类型",
        "value": "auto",
        "options": [
          {
            "label": "普通生成 / 参考视频编辑",
            "value": "auto"
          },
          {
            "label": "延长单段参考视频",
            "value": "extend"
          }
        ]
      },
      {
        "type": "switch",
        "field": "autoDuration",
        "title": "视频编辑：自动匹配输入时长",
        "value": false
      },
      {
        "type": "inputNumber",
        "field": "seed",
        "title": "随机种子（-1 为随机）",
        "value": -1,
        "props": {
          "min": -1,
          "max": 2147483647,
          "precision": 0
        }
      },
      {
        "type": "switch",
        "field": "watermark",
        "title": "输出水印",
        "value": false
      },
      {
        "type": "select",
        "field": "imageTransport",
        "title": "无原始 URL 的图片传递方式",
        "value": "upload",
        "options": [
          {
            "label": "上传安泰信素材接口后使用 URL",
            "value": "upload"
          },
          {
            "label": "Base64（仅兼容排查时使用）",
            "value": "inline"
          }
        ]
      },
      {
        "type": "input",
        "field": "referenceVideoUrls",
        "title": "参考视频公网 URL（按连线顺序，每行一个）",
        "value": "",
        "props": {
          "type": "textarea",
          "rows": 2,
          "placeholder": "本地视频缺少原始链接时必填；无视频连线时也可直接填写 URL"
        }
      },
      {
        "type": "input",
        "field": "referenceAudioUrls",
        "title": "参考音频公网 URL（按连线顺序，每行一个）",
        "value": "",
        "props": {
          "type": "textarea",
          "rows": 2,
          "placeholder": "本地音频缺少原始链接时必填；无音频连线时也可直接填写 URL"
        }
      },
      {
        "type": "input",
        "field": "referenceVideoDurations",
        "title": "参考视频秒数（可选，按顺序逗号分隔，用于时长校验）",
        "value": ""
      },
      {
        "type": "input",
        "field": "referenceAudioDurations",
        "title": "参考音频秒数（可选，按顺序逗号分隔，用于时长校验）",
        "value": ""
      }
    ]
  }
],

  async generateImage(this: Context, request: ImageRequest): Promise<MediaAsset[]> {
    this.signal?.throwIfAborted();
    const apiKey = this.config.apiKey?.trim();
    if (!apiKey) throw new Error("请填写 API Key");

    if (request.model !== "seedream-5.0-pro") throw new Error("模型无效");
    if (!request.prompt?.trim() || request.prompt.length > 5000) {
      throw new Error("提示词不能为空且不能超过 5000 字符");
    }

    const options=request.other ?? {};
    const size=(request.size ?? "1K").toUpperCase();
    if(!["1K","2K"].includes(size)) throw new Error("Seedream 仅支持 1K / 2K");
    const n=request.n ?? options.n ?? 1;
    integer(n,1,4,"图片生成数量");
    const ratio=request.ratio;
    if(ratio && !IMAGE_RATIOS.includes(ratio)) throw new Error("不支持的图片构图比例");
    // This native image endpoint documents size tiers, not an aspect-ratio field.
    const prompt=ratio ? `${request.prompt}\n构图要求：画幅宽高比 ${ratio}。` : request.prompt;
    if(prompt.length>5000) throw new Error("加入构图要求后，图片提示词不能超过 5000 字符");
    const body: Record<string, unknown> = {model:request.model,prompt,size,n,response_format:"url"};
    if(options.watermark!==undefined && booleanValue(options.watermark,"水印")) throw new Error("当前 Seedream 模型不支持水印参数");
    if(request.mask) throw new Error("当前 Seedream 接口不支持 mask，请使用参考图编辑");
    if(request.images?.length) {
      if(request.images.length>10) throw new Error("最多支持 10 张参考图");
      for(let i=0;i<request.images.length;i++) {
        await checkImage(this,request.images[i],`图片参考 ${i+1}`);
        if(request.images[i].type==="url" && !getMediaUrl(request.images[i]).startsWith("https://")) throw new Error("Seedream 图片参考需要公开 HTTPS URL");
      }
      body.image=request.images.map(getMediaUrl);
    }
    if(Buffer.byteLength(JSON.stringify(body),"utf8")>64*1048576) throw new Error("图片请求体超过64MB，请减少参考图或改用公开HTTPS链接");
    const signal = AbortSignal.any([AbortSignal.timeout(300000), ...(this.signal ? [this.signal] : [])]);

    try {
      const response = await this.tool.fetch("https://images-api.antaixin.ai/api/v3/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body),
        signal
      });

      if (!response.ok) {
        throw new Error(`图片请求失败，HTTP ${response.status}: ${await parseError(response)}`);
      }

      const result = await response.json();
      if (!result || !Array.isArray(result.data)) {
        throw new Error("接口未返回有效的图片数据");
      }

      const assets=result.data.map((item: any) => ({
        mediaType: "image" as const,
        type: "url" as const,
        url: item.url
      })).filter((item: any) => typeof item.url==="string" && /^https:\/\//i.test(item.url));
      if(!assets.length) throw new Error("图片接口未返回有效的 HTTPS 图片链接");
      return assets;
    } catch (err: any) {
      if (err.name === 'AbortError') throw err;
      if (err.message.includes('fetch failed')) {
        throw new Error(`无法连接到安泰信图片服务器，请检查您的网络环境。`);
      }
      throw err;
    }
  },

  async generateVideo(this: Context, request: VideoRequest): Promise<MediaAsset[]> {
    this.signal?.throwIfAborted();
    const apiKey = this.config.apiKey?.trim();
    if (!apiKey) throw new Error("请填写 API Key");

    if (request.model !== "seedance-2.5-video") throw new Error("模型无效");
    if (!request.prompt?.trim() || request.prompt.length > 15000) throw new Error("视频提示词不能为空且不能超过 15000 字符");
    const options=request.other ?? {};
    const images=request.images ?? [];
    const videos=publicReferences(request.videos,options.referenceVideoUrls,"视频");
    const audios=publicReferences(request.audios,options.referenceAudioUrls,"音频");
    const frames=Boolean(request.firstFrame || request.lastFrame);
    if(request.lastFrame && !request.firstFrame) throw new Error("尾帧必须与首帧同时提供");
    if(frames && (images.length || videos.length || audios.length)) throw new Error("首尾帧不能与多模态参考角色混用");
    if(images.length>30 || videos.length>10 || audios.length>10) throw new Error("视频参考最多30张图片、10段视频、10段音频");
    if(request.mode==="text" && (frames||images.length||request.videos?.length||request.audios?.length)) throw new Error("文生视频模式不能带参考素材，请选择参考模式");
    if(request.mode==="singleImage" && (images.length!==1 || videos.length || audios.length || frames)) throw new Error("单图模式需要且仅支持一张参考图");
    if(request.mode==="startEndRequired" && (!request.firstFrame || !request.lastFrame)) throw new Error("首尾帧模式必须同时提供首帧和尾帧");
    if(request.mode==="endFrameOptional" && !request.firstFrame) throw new Error("首帧模式必须提供首帧");
    const extend=options.video_extend===true || options.omni_reference_task_type==="extend";
    if(options.video_extend!==undefined) booleanValue(options.video_extend,"视频延长");
    if(options.omni_reference_task_type!==undefined && !["auto","extend"].includes(String(options.omni_reference_task_type))) throw new Error("任务类型只支持 auto / extend");
    if((options.video_extend===true && options.omni_reference_task_type==="auto") || (options.video_extend===false && options.omni_reference_task_type==="extend")) throw new Error("视频延长参数冲突");
    if(extend && (videos.length!==1 || images.length || audios.length || frames)) throw new Error("视频延长需要且仅支持一段参考视频");
    if(options.autoDuration!==undefined) booleanValue(options.autoDuration,"自动时长");
    const duration=options.autoDuration===true ? -1 : request.duration ?? 5;
    if(duration===-1) {
      if(extend || !videos.length) throw new Error("自动时长仅适用于带参考视频的编辑，不能用于延长");
    } else integer(duration,4,30,"视频时长");
    const resolution=(request.resolution ?? "480p").toLowerCase()==="1k"?"1080p":(request.resolution ?? "480p").toLowerCase();
    if(!["480p","720p","1080p"].includes(resolution)) throw new Error("分辨率仅支持 480p / 720p / 1080p");
    const ratio=frames||extend ? "adaptive" : options.ratio || request.ratio || "adaptive";
    if(!VIDEO_RATIOS.includes(ratio)) throw new Error("不支持的视频比例");
    const seed=options.seed ?? -1;
    integer(seed,-1,2147483647,"随机种子");
    if(options.framespersecond!==undefined && options.framepersecond!==undefined) throw new Error("帧率字段不能同时传入");
    if((options.framespersecond ?? options.framepersecond ?? 24)!==24) throw new Error("帧率固定为24");
    checkDurations(options.referenceVideoDurations,videos.length,duration,"视频");
    checkDurations(options.referenceAudioDurations,audios.length,0,"音频");
    const generateAudio=booleanValue(request.generateAudio ?? true,"生成音频");
    const watermark=booleanValue(options.watermark ?? request.watermark ?? false,"水印");
    const prompt=referencePrompt(request,images,videos,audios);
    if(prompt.length>15000) throw new Error("转换引用后，视频提示词不能超过15000字符");
    const transport=options.imageTransport ?? "upload";
    const compress=booleanValue(options.compressReferences ?? true,"参考图压缩");
    if(!["upload","inline"].includes(String(transport))) throw new Error("未知的图片传递方式");
    const content:any[]=[{type:"text",text:prompt}];
    // Validate the whole request before any upload or generation network call.
    const allImages=[...images,...(request.firstFrame?[request.firstFrame]:[]),...(request.lastFrame?[request.lastFrame]:[])];
    for(let i=0;i<allImages.length;i++) await checkImage(this,allImages[i],`视频图片 ${i+1}`);
    const urlFor=async(input:MediaInput,label:string)=>input.type==="url" || transport==="inline" ? getMediaUrl(input) : uploadImage(this,input,apiKey,label,compress);
    if(request.firstFrame) content.push({type:"image_url",image_url:{url:await urlFor(request.firstFrame,"首帧")},role:"first_frame"});
    if(request.lastFrame) content.push({type:"image_url",image_url:{url:await urlFor(request.lastFrame,"尾帧")},role:"last_frame"});
    for(let i=0;i<images.length;i++) content.push({type:"image_url",image_url:{url:await urlFor(images[i],`参考图 ${i+1}`)},role:"reference_image"});
    videos.forEach(input=>content.push({type:"video_url",video_url:{url:getMediaUrl(input)},role:"reference_video"}));
    audios.forEach(input=>content.push({type:"audio_url",audio_url:{url:getMediaUrl(input)},role:"reference_audio"}));
    const body:Record<string,unknown>={model:request.model,content,duration,resolution,ratio,
      generate_audio:generateAudio,watermark,seed};
    if(options.framespersecond!==undefined || options.framepersecond!==undefined) body.framespersecond=24;
    if(options.omni_reference_task_type!==undefined || options.video_extend!==undefined) body.omni_reference_task_type=extend?"extend":"auto";

    const signal = AbortSignal.timeout(3600000);
    const combinedSignal = this.signal ? AbortSignal.any([signal, this.signal]) : signal;
    const payload = JSON.stringify(body);
    const summary = videoPayloadSummary(content, payload);

    let submitResponse: Response;
    try {
      submitResponse = await this.tool.fetch("https://antaixin.ai/api/v3/contents/generations/tasks", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: payload,
        signal: combinedSignal,
      });
    } catch (error: any) {
      this.signal?.throwIfAborted();
      throw new Error(`视频任务提交异常：${combinedSignal.aborted ? "本机等待已超时" : "连接在任务 ID 返回前中断"}。远端任务状态未知；请先查看安泰信任务/调用记录，勿直接重复提交。${summary}。`);
    }
    if (!submitResponse.ok) throw await videoSubmitError(submitResponse, summary);
    let submitResult: any;
    try { submitResult = await submitResponse.json(); }
    catch {
      throw new Error(`视频任务提交响应无法解析，尚未取得任务 ID，远端任务状态未知；请先查看安泰信任务/调用记录，勿直接重复提交。${summary}。`);
    }
    const taskId = submitResult?.id;
    if (typeof taskId !== "string" || !taskId.trim()) {
      throw new Error("视频任务提交响应未返回有效任务 ID，远端任务状态未知；请先查看安泰信任务/调用记录，勿直接重复提交。");
    }

    while (true) {
      try { await waitForVideoPoll(5000, combinedSignal); }
      catch {
        this.signal?.throwIfAborted();
        throw new Error(`视频查询等待超时，远端任务可能仍在运行；任务 ID：${taskId}。请按此 ID 查询，勿重新创建任务。`);
      }
      let checkResponse: Response;
      try {
        checkResponse = await this.tool.fetch(`https://antaixin.ai/api/v3/contents/generations/tasks/${encodeURIComponent(taskId)}`, {
          method: "GET", headers: { Authorization: `Bearer ${apiKey}` }, signal: combinedSignal,
        });
      } catch {
        this.signal?.throwIfAborted();
        if (combinedSignal.aborted) {
          throw new Error(`视频查询等待超时，远端任务可能仍在运行；任务 ID：${taskId}。请按此 ID 查询，勿重新创建任务。`);
        }
        continue; // Only repeat GET for the same known task; never repeat POST.
      }
      if (!checkResponse.ok) {
        if (checkResponse.status === 429 || checkResponse.status >= 500) {
          await checkResponse.body?.cancel().catch(() => {});
          continue;
        }
        throw new Error(`查询视频任务失败，HTTP ${checkResponse.status}：${await parseError(checkResponse)}；任务 ID：${taskId}`);
      }
      let checkResult: any;
      try { checkResult = await checkResponse.json(); }
      catch { throw new Error(`视频查询响应无法解析，远端任务状态未知；任务 ID：${taskId}`); }
      if (checkResult.status === "succeeded") {
        const url = checkResult.content?.video_url;
        if (typeof url === "string" && /^https?:\/\//i.test(url)) {
          return [{ mediaType: "video", type: "url", url }];
        }
        throw new Error(`视频生成成功，但未返回有效视频链接；任务 ID：${taskId}`);
      }
      if (["failed", "expired", "cancelled", "canceled"].includes(checkResult.status)) {
        const reason = safeErrorText(checkResult.error?.message || checkResult.error?.code) || "未提供详细原因";
        throw new Error(`视频任务已结束（${checkResult.status}）：${reason}；任务 ID：${taskId}`);
      }
      if (!["queued", "running"].includes(checkResult.status)) {
        throw new Error(`视频查询返回未知状态；任务 ID：${taskId}。请在平台核实，勿重新创建任务。`);
      }
    }

  }
};
import {test,expect} from 'bun:test';
const {default:p}=await import(process.env.TOONFLOW_TEST_PROVIDER || '/Applications/data/providers/antaixin.ts');
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j3ioAAAAASUVORK5CYII=','base64');
const inline={type:'base64',data:png.toString('base64'),mimeType:'image/png'};
const url=(name='image')=>({type:'url',url:`https://example.invalid/${name}`});
async function invoke(kind:'Image'|'Video',request:any,options:any={}){
 const calls:any[]=[];let result:any,error:any;
 const timer=globalThis.setTimeout;
 globalThis.setTimeout=((fn:any,ms:number,...args:any[])=>timer(fn,ms===5000?0:ms,...args)) as any;
 const controller=new AbortController();
 try{
  result=await p[`generate${kind}`].call({config:{apiKey:'offline-secret'},signal:controller.signal,tool:{
   media:{inspectImage:async()=>({width:options.width??1024,height:1024,format:'png'}),resizeImage:async(input:any,settings:any)=>{
     options.resizeCalls?.push(settings);
     return {type:'binary',data:Buffer.from('RIFFxxxxWEBPfixture'),mimeType:'image/webp'};
   }},
   fetch:async(u:string,init:any)=>{
    calls.push({url:u,...init});
    if(u.endsWith('/api/upload/image')){
     if(options.abortUpload){controller.abort();throw controller.signal.reason;}
     if(options.uploadFailure)return Response.json({message:'fixture upload unavailable'},{status:503});
     return Response.json({success:true,data:{path:'/uploads/fixture.png'}});
    }
    if(u.includes('/images/generations'))return Response.json({data:Array.from({length:JSON.parse(init.body).n},(_,i)=>({url:`https://example.invalid/output${i}.png`}))});
    if(init.method==='POST')return Response.json({id:'fixture-id/encoded'});
    return Response.json({status:'succeeded',content:{video_url:'https://example.invalid/output.mp4'}});
   }
  }},{model:kind==='Image'?'seedream-5.0-pro':'seedance-2.5-video',prompt:'offline fixture',...request});
 }catch(e){error=e;}finally{globalThis.setTimeout=timer;}
 return {calls,result,error,body:calls.find(c=>c.url.endsWith('/tasks'))?.body};
}
test('ten connected image references reach Seedream with 1K/2K and output count',async()=>{
 for(const size of ['1K','2K']){
  const r=await invoke('Image',{size,ratio:'9:16',images:Array(10).fill(inline),other:{n:4,watermark:false}});
  expect(r.error).toBeUndefined();expect(r.result).toHaveLength(4);
  const body=JSON.parse(r.calls[0].body);
  expect(r.calls[0].url).toBe('https://images-api.antaixin.ai/api/v3/images/generations');
  expect(body.image).toHaveLength(10);expect(body.size).toBe(size);expect(body).not.toHaveProperty('watermark');
  expect(body.prompt).toContain('9:16');expect(body).not.toHaveProperty('aspect_ratio');
 }
});
test('Seedream never sends unsupported watermark=false and rejects watermark=true locally',async()=>{
 const r=await invoke('Image',{other:{watermark:false}});
 expect(r.error).toBeUndefined();expect(JSON.parse(r.calls[0].body)).not.toHaveProperty('watermark');
 const unsupported=await invoke('Image',{other:{watermark:true}});
 expect(unsupported.error?.message).toContain('不支持');expect(unsupported.calls).toHaveLength(0);
});
test('text-only image generation needs no reference',async()=>{
 const r=await invoke('Image',{});expect(r.error).toBeUndefined();expect(r.result).toHaveLength(1);
 expect(JSON.parse(r.calls[0].body)).not.toHaveProperty('image');
});
test('unsupported image size or excessive references never reaches paid endpoint',async()=>{
 for(const request of [{size:'4K'},{images:Array(11).fill(inline)},{images:[{...inline,mimeType:'image/jpeg'}]},{other:{n:0}}]){
  const r=await invoke('Image',request);expect(r.error).toBeDefined();expect(r.calls).toHaveLength(0);
 }
});
test('old local image is uploaded to Antaixin before video is submitted with a URL',async()=>{
 const r=await invoke('Video',{images:[inline]});expect(r.error).toBeUndefined();
 expect(r.calls.map(c=>c.method)).toEqual(['POST','POST','GET']);
 expect(r.calls[0].url).toBe('https://antaixin.ai/api/upload/image');
 const multipart=Buffer.from(r.calls[0].body);
 expect(multipart.toString()).toContain('name="file"');expect(multipart.includes(png)).toBe(true);
 const b=JSON.parse(r.body);expect(b.content[1].image_url.url).toBe('https://antaixin.ai/uploads/fixture.png');
 expect(r.body).not.toContain('data:image');expect(r.calls[2].url).toEndWith('fixture-id%2Fencoded');
});
test('already available original URL is reused without upload',async()=>{
 const original='https://example.invalid/image?signature=preserved';
 const r=await invoke('Video',{images:[{type:'url',url:original}]});
 expect(r.error).toBeUndefined();expect(r.calls).toHaveLength(2);expect(JSON.parse(r.body).content[1].image_url.url).toBe(original);
});
test('upload failure or cancellation cannot accidentally create a video task',async()=>{
 for(const options of [{uploadFailure:true},{abortUpload:true}]){
  const r=await invoke('Video',{images:[inline]},options);expect(r.error).toBeDefined();
  expect(r.calls).toHaveLength(1);expect(r.calls[0].url).toEndWith('/api/upload/image');
 }
});
test('image dimensions are checked before uploading local image',async()=>{
 const r=await invoke('Video',{images:[inline]},{width:16});expect(r.error?.message).toContain('32');expect(r.calls).toHaveLength(0);
});
test('large local video image is compressed before upload while original data stays intact',async()=>{
 const large=Buffer.alloc(1200000);png.copy(large);
 const resizeCalls:any[]=[];
 const r=await invoke('Video',{images:[{type:'binary',data:large,mimeType:'image/png'}]},{resizeCalls,width:4096});
 expect(r.error).toBeUndefined();expect(resizeCalls[0]).toMatchObject({width:2048,height:512,format:'webp',quality:90});
 expect(r.calls[0].body.length).toBeLessThan(1000);expect(r.calls[0].body.toString()).toContain('Content-Type: image/webp');
 expect(large.length).toBe(1200000);expect(large.subarray(0,png.length)).toEqual(png);
 const original=await invoke('Video',{images:[{type:'binary',data:large,mimeType:'image/png'}],other:{compressReferences:false}},{resizeCalls:[]});
 expect(original.error).toBeUndefined();expect(original.calls[0].body.length).toBeGreaterThan(1200000);
});
test('maximum multimodal reference counts keep media roles and selectable audio',async()=>{
 const r=await invoke('Video',{images:Array(30).fill(url()),videos:Array(10).fill(url('video')),audios:Array(10).fill(url('audio')),generateAudio:false});
 expect(r.error).toBeUndefined();const b=JSON.parse(r.body);
 expect(b.content.filter((c:any)=>c.role==='reference_image')).toHaveLength(30);
 expect(b.content.filter((c:any)=>c.role==='reference_video')).toHaveLength(10);
 expect(b.content.filter((c:any)=>c.role==='reference_audio')).toHaveLength(10);expect(b.generate_audio).toBe(false);
});
test('all documented video ratios and duration/resolution choices serialize correctly',async()=>{
 for(const ratio of ['adaptive','16:9','9:16','1:1','4:3','3:4','21:9']){
  const r=await invoke('Video',{ratio});expect(r.error).toBeUndefined();expect(JSON.parse(r.body).ratio).toBe(ratio);
 }
 for(let duration=4;duration<=30;duration++)for(const resolution of ['480p','720p','1080p']){
  const r=await invoke('Video',{duration,resolution,generateAudio:duration%2===0});
  expect(r.error).toBeUndefined();const b=JSON.parse(r.body);expect(b.duration).toBe(duration);expect(b.resolution).toBe(resolution);
 }
 const override=await invoke('Video',{ratio:'9:16',resolution:'1k',other:{ratio:'21:9'}});
 expect(JSON.parse(override.body).ratio).toBe('21:9');expect(JSON.parse(override.body).resolution).toBe('1080p');
});
test('first frame and first/last frame upload with roles and adaptive ratio',async()=>{
 for(const last of [false,true]){
  const r=await invoke('Video',{mode:last?'startEndRequired':'endFrameOptional',firstFrame:inline,...last?{lastFrame:inline}:{},ratio:'9:16'});
  expect(r.error).toBeUndefined();const b=JSON.parse(r.body);expect(b.ratio).toBe('adaptive');
  expect(b.content.slice(1).map((c:any)=>c.role)).toEqual(last?['first_frame','last_frame']:['first_frame']);
 }
});
test('video editing and extension expose documented switches without undocumented fields',async()=>{
 const edit=await invoke('Video',{videos:[url('video')],other:{autoDuration:true,seed:0,watermark:true,framepersecond:24}});
 expect(edit.error).toBeUndefined();const a=JSON.parse(edit.body);expect(a.duration).toBe(-1);expect(a.seed).toBe(0);expect(a.watermark).toBe(true);expect(a.framespersecond).toBe(24);
 const extend=await invoke('Video',{videos:[url('video')],duration:4,ratio:'9:16',other:{omni_reference_task_type:'extend',referenceVideoDurations:'20'}});
 expect(extend.error).toBeUndefined();const b=JSON.parse(extend.body);expect(b.omni_reference_task_type).toBe('extend');expect(b.ratio).toBe('adaptive');
});
test('local video/audio require explicit public URLs rather than invalid Base64',async()=>{
 for(const type of ['Video','Audio']){
  const field=type==='Video'?'videos':'audios';
  const r=await invoke('Video',{[field]:[{type:'base64',data:'AAAA',mimeType:type==='Video'?'video/mp4':'audio/mpeg'}]});
  expect(r.error?.message).toContain('公网 URL');expect(r.calls).toHaveLength(0);
  const good=await invoke('Video',{[field]:[{type:'base64',data:'AAAA'}],other:{[`reference${type}Urls`]:'https://example.invalid/media'}});
  expect(good.error).toBeUndefined();expect(good.body).not.toContain('data:');
 }
});
test('URL-only reference editing works when the canvas offers only text mode without wired files',async()=>{
 const r=await invoke('Video',{mode:'text',duration:4,other:{referenceVideoUrls:'https://example.invalid/source.mp4',omni_reference_task_type:'extend'}});
 expect(r.error).toBeUndefined();expect(JSON.parse(r.body).content[1]).toMatchObject({type:'video_url',role:'reference_video'});
 expect(JSON.parse(r.body).omni_reference_task_type).toBe('extend');
});
test('unsafe parameter combinations and limits fail before network activity',async()=>{
 const cases=[{duration:3},{duration:31},{duration:-1},{resolution:'4k'},{ratio:'2:3'},{images:Array(31).fill(url())},
 {videos:Array(11).fill(url())},{audios:Array(11).fill(url())},{other:{seed:2147483648}},
 {other:{framespersecond:25}},{other:{framespersecond:24,framepersecond:24}},
 {firstFrame:url(),audios:[url()]},{firstFrame:url(),videos:[url()]},
 {videos:[url()],other:{omni_reference_task_type:'extend',autoDuration:true}},
 {videos:[url()],duration:10,other:{referenceVideoDurations:'25'}},
 {audios:[url()],other:{referenceAudioDurations:'31'}},
 {videos:[url()],other:{omni_reference_task_type:'extend',video_extend:false}},
 {mode:'text',images:[url()]}, {mode:'startEndRequired',firstFrame:url()},
 {mode:'singleImage',images:[url(),url()]}, {generateAudio:'false'}];
 for(const request of cases){
  const r=await invoke('Video',request);expect(r.error).toBeDefined();expect(r.calls).toHaveLength(0);
 }
});

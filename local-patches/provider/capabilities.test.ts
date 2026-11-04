import { test, expect } from 'bun:test';
const {default: provider} = await import(process.env.TOONFLOW_TEST_PROVIDER || '/Applications/data/providers/antaixin.ts');

const image = {type:'url',url:'https://example.invalid/reference.png'};
async function run(request:any, failure=false) {
  const calls:any[]=[];
  const timer=globalThis.setTimeout;
  globalThis.setTimeout=((fn:any,ms:number,...args:any[])=>timer(fn,ms===5000?0:ms,...args)) as any;
  try {
    let result:any,error:any;
    try { result=await provider.generateVideo.call({config:{apiKey:'offline'},signal:new AbortController().signal,
      tool:{fetch:async(url:string,init:any)=>{
        calls.push({url,method:init.method,body:init.body});
        if(failure)return Response.json({error:{code:'bad_request',message:'Reference image upload failed; task was not submitted'}},
          {status:400,headers:{'cf-ray':'a523c551ea154865-DFW'}});
        return init.method==='POST'?Response.json({id:'offline-task'}):Response.json({status:'succeeded',content:{video_url:'https://example.invalid/result.mp4'}});
      }}}, {model:'seedance-2.5-video',prompt:'offline',...request});
    }catch(e){error=e;}
    return {calls,result,error};
  }finally{globalThis.setTimeout=timer;}
}

test('reported 400 is explained without a second submission, and identifies payload transport',async()=>{
  const r=await run({images:[image]},true);
  expect(r.calls).toHaveLength(1);
  expect(r.error.message).toContain('参考图');
  expect(r.error.message).toContain('未提交');
  expect(r.error.message).toContain('HTTP(S)链接 1 个');
  expect(r.error.message).toContain('a523c551ea154865-DFW');
});
test('audio can actually be switched off in the canvas',()=>{
  expect(provider.models.find((m:any)=>m.type==='video').audio).toBe('optional');
});
test('frame and multimodal roles must never be mixed',async()=>{
  const r=await run({firstFrame:image,images:[image]});
  expect(r.error?.message).toContain('混用');
  expect(r.calls).toHaveLength(0);
});
test('tail frame requires a first frame',async()=>{
  const r=await run({lastFrame:image});
  expect(r.error?.message).toContain('首帧');
  expect(r.calls).toHaveLength(0);
});
test('frame mode uses adaptive even when canvas retained a previous ratio',async()=>{
  const r=await run({firstFrame:image,lastFrame:image,ratio:'9:16'});
  expect(r.error).toBeUndefined();
  expect(JSON.parse(r.calls[0].body).ratio).toBe('adaptive');
});
test('15000 character video prompt is supported',async()=>{
  const r=await run({prompt:'a'.repeat(6000)});
  expect(r.error).toBeUndefined();
});
test('caption reference markers preserve connected reference ordering',async()=>{
  const r=await run({prompt:'{{ref 2}} uses {{ref 1}}',images:[image,image],referenceOrder:[{type:'image',index:1},{type:'image',index:0}]});
  expect(r.error).toBeUndefined();
  expect(JSON.parse(r.calls[0].body).content[0].text).toBe('图片1 uses 图片2');
});

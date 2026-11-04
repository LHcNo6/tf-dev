from pathlib import Path
import hashlib,json
ROOT=Path.cwd();work=ROOT/'work/toonflow-params';out=ROOT/'outputs/toonflow-params'
(work/'original').mkdir(exist_ok=True);(work/'candidate').mkdir(exist_ok=True)
manifest={}
for name,scope in [('videoGenerationNode.umd.js','data-v-7a26b817'),('imageGenerationNode.umd.js','data-v-0ff55c1f')]:
 p=Path('/Applications/data/nodes')/name;backup=work/'original'/name
 if not backup.exists():backup.write_bytes(p.read_bytes())
 source=backup.read_text();patched=source
 def replace(old,new):
  global patched
  assert patched.count(old)==1,(name,old[:140],patched.count(old));patched=patched.replace(old,new)
 start=patched.index('__name:`generationSettings`');end=patched.index('[[`__scopeId`,`'+scope+'`]]',start)
 pre,part,post=patched[:start],patched[start:end],patched[end:]
 def sub(old,new):
  global part
  assert part.count(old)==1,(name,old[:140],part.count(old));part=part.replace(old,new)
 if name.startswith('video'):
  logic='''const tfArk=(0,e.computed)(()=>r.model?.providerId===`antaixin`&&r.model?.modelId===`seedance-2.5-video`),tfMode=(0,e.computed)(()=>{try{return JSON.parse(c.value)}catch{return c.value}}),tfExtend=(0,e.computed)(()=>tfArk.value&&(u.value?.omni_reference_task_type===`extend`||u.value?.video_extend===!0)),tfRatioLocked=(0,e.computed)(()=>tfArk.value&&(tfExtend.value||[`startEndRequired`,`endFrameOptional`,`startFrameOptional`].includes(tfMode.value))),tfRatio=(0,e.computed)(()=>tfRatioLocked.value?`adaptive`:tfArk.value&&u.value?.ratio?u.value.ratio:s.value),tfRatios=(0,e.computed)(()=>[...new Set([...(r.ratios??[]),...tfArk.value?(r.model?.rules?.find(t=>t.field===`ratio`)?.options??[]).map(t=>t.value).filter(Boolean):[]])]),tfAutoDuration=(0,e.computed)(()=>tfArk.value&&u.value?.autoDuration===!0),tfPrimary=(0,e.computed)(()=>[tfRatio.value===`adaptive`?`自适应`:tfRatio.value,o.value,tfAutoDuration.value?`自动时长`:a.value?`${a.value}秒`:``].filter(Boolean).join(` · `)),tfSecondary=(0,e.computed)(()=>[tfExtend.value?`视频延长`:Array.isArray(tfMode.value)?`混合参考`:f[tfMode.value]??`选择模式`,r.model?.audio===`optional`?l.value?`生成音频`:`无音轨`:r.model?.audio===!0?`生成音频`:``].filter(Boolean).join(` · `));function tfSelectRatio(t){if(tfRatioLocked.value&&t!==`adaptive`)return;r.ratios.includes(t)&&(s.value=t);tfArk.value&&(u.value={...u.value,ratio:r.ratios.includes(t)?``:t})}function tfCurrent(){return(0,e.createElementVNode)(`div`,{class:`tfCurrent`,role:`status`,"aria-live":`polite`},[(0,e.h)(`span`,{class:`tfCurrentLabel`},`当前设置`),(0,e.createElementVNode)(`strong`,null,tfPrimary.value,1),(0,e.createElementVNode)(`span`,null,tfRatioLocked.value?`首尾帧或延长模式使用自适应画幅；选择后即时生效`:tfAutoDuration.value?`自动匹配输入视频时长；选择后即时生效`:`选择后即时生效`,1),(0,e.h)(`button`,{type:`button`,class:`tfClose`,"aria-label":`收起视频参数`,onClick:()=>i.value=!1},`收起`)],16)}'''
  sub('return(r,f)=>',''+logic+'return(r,f)=>')
  sub('onKeydown:f[8]||=(0,e.withModifiers)(()=>{},[`stop`])','onKeydown:f[8]||=(0,e.withModifiers)(e=>{e.key===`Escape`&&(i.value=!1)},[`stop`])')
  sub('y(s.value)','y(tfRatio.value)')
  sub('(0,e.createElementVNode)(`span`,null,(0,e.toDisplayString)([s.value,o.value,a.value?`${a.value}秒`:``].filter(Boolean).join(` · `)),1)','(0,e.h)(`span`,{class:`tfSummary`},[(0,e.h)(`span`,{class:`tfPrimary`},tfPrimary.value),(0,e.h)(`span`,{class:`tfSecondary`},tfSecondary.value)])')
  sub('"aria-label":`视频生成设置`','"aria-label":`视频生成设置`,title:tfPrimary.value+`；`+tfSecondary.value')
  sub('[`disabled`,`aria-expanded`]','[`disabled`,`aria-expanded`,`title`]')
  sub('[m.value.length?','[tfCurrent(),m.value.length?')
  sub('modelValue:a.value,"onUpdate:modelValue":f[1]||=e=>a.value=e,disabled:n.disabled','modelValue:a.value,"onUpdate:modelValue":f[1]||=e=>a.value=e,disabled:n.disabled||tfAutoDuration.value')
  sub('`通用比例`','`画面比例`')
  sub('(0,e.renderList)(n.ratios,','(0,e.renderList)(tfRatios.value,')
  sub('class:`ratioButton`,disabled:n.disabled,"aria-label":`比例 ${r}`,"aria-pressed":s.value===r,onClick:e=>s.value=r','class:`ratioButton`,disabled:n.disabled||tfRatioLocked.value&&r!==`adaptive`,"aria-label":`比例 ${r}`,"aria-pressed":tfRatio.value===r,onClick:e=>tfSelectRatio(r)')
  form='(0,e.createVNode)((0,e.unref)(Px),{modelValue:u.value,"onUpdate:modelValue":f[4]||=e=>u.value=e,rules:n.model?.rules,disabled:n.disabled},null,8,[`modelValue`,`rules`,`disabled`])'
  sub(form,'(0,e.h)(`details`,{class:`tfAdvanced`},[(0,e.h)(`summary`,`更多设置（画幅覆盖、种子与参考素材）`),'+form+'])')
  assert part.count('teleported:!1')==3
  sub('let[t=1,n=1]=e.split(`:`).map(Number)','let[t=1,n=1]=e===`adaptive`?[1,1]:e.split(`:`).map(Number)')
 else:
  logic='''const tfCount=(0,e.computed)(()=>{let t=Number(o.value?.n??1);return Number.isInteger(t)&&t>0?t:1}),tfPrimary=(0,e.computed)(()=>[a.value,i.value,`${tfCount.value}张`].filter(Boolean).join(` · `)),tfPromptRatio=(0,e.computed)(()=>n.model?.providerId===`antaixin`&&n.model?.modelId===`seedream-5.0-pro`);function tfCurrent(){return(0,e.createElementVNode)(`div`,{class:`tfCurrent`,role:`status`,"aria-live":`polite`},[(0,e.h)(`span`,{class:`tfCurrentLabel`},`当前设置`),(0,e.createElementVNode)(`strong`,null,tfPrimary.value,1),(0,e.createElementVNode)(`span`,null,tfPromptRatio.value?`比例为构图要求，实际尺寸以模型返回为准`:`选择后即时生效`,1),(0,e.h)(`button`,{type:`button`,class:`tfClose`,"aria-label":`收起图片参数`,onClick:()=>r.value=!1},`收起`)],16)}'''
  sub('return(c,l)=>',logic+'return(c,l)=>')
  sub('onKeydown:l[5]||=(0,e.withModifiers)(()=>{},[`stop`])','onKeydown:l[5]||=(0,e.withModifiers)(e=>{e.key===`Escape`&&(r.value=!1)},[`stop`])')
  sub('(0,e.createElementVNode)(`span`,null,(0,e.toDisplayString)(a.value)+` · `+(0,e.toDisplayString)(i.value)+` · 1张`,1)','(0,e.h)(`span`,{class:`tfSummary`},[(0,e.h)(`span`,{class:`tfPrimary`},tfPrimary.value)])')
  sub('"aria-label":`图片生成设置`','"aria-label":`图片生成设置`,title:tfPrimary.value')
  sub('[`disabled`,`aria-expanded`]','[`disabled`,`aria-expanded`,`title`]')
  sub('[l[8]||=','[tfCurrent(),l[8]||=')
 sub('class:`generationSettings nodrag nopan nowheel`,', 'class:`generationSettings nodrag nopan nowheel`,onClick:(0,e.withModifiers)(()=>{},[`stop`]),')
 # Give the popover a bounded scroll area, keeping all existing controls available.
 sub('width:`min(340px, calc(100vw - 24px))`','width:`min(420px, calc(100vw - 24px))`')
 sub('popperStyle:{padding:`14px`}', 'popperStyle:{padding:`14px`},popperOptions:{modifiers:[{name:`preventOverflow`,options:{altAxis:!0,tether:!1,padding:12,rootBoundary:`viewport`}}]}')
 patched=pre+part+post
 replace('.generationSettings['+scope+']{text-align:left}', '.generationSettings['+scope+']{text-align:left;max-height:min(680px,calc(100dvh - 64px));overflow-y:auto;overscroll-behavior:contain;scrollbar-gutter:stable}')
 replace('grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;display:grid}.generationSettings .ratioOptions', 'grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;display:grid}.generationSettings .ratioOptions')
 replace('.settingsButton['+scope+']{flex-shrink:0}', '.settingsButton['+scope+']{flex-shrink:1;min-width:0;height:auto;min-height:32px;padding:6px 8px;white-space:normal}')
 replace('.settingsButton['+scope+']>span{gap:6px}', '.settingsButton['+scope+']>span{gap:6px;min-width:0}.tfSummary['+scope+']{display:flex;flex-direction:column;align-items:flex-start;gap:3px;text-align:left;line-height:1.4}.tfPrimary['+scope+']{font-weight:600}.tfSecondary['+scope+']{color:var(--el-text-color-secondary);font-size:11px}.tfCurrent['+scope+']{display:flex;flex-direction:column;gap:5px;padding:10px 58px 10px 12px;margin-bottom:16px;border-radius:8px;position:sticky;top:0;z-index:3;background:var(--el-color-primary-light-9);color:var(--el-text-color-regular);font-size:12px;line-height:1.5}.tfCurrentLabel['+scope+']{font-size:11px;color:var(--el-text-color-secondary)}.tfCurrent['+scope+'] strong{font-size:14px;color:var(--el-color-primary)}.tfAdvanced['+scope+']{margin-top:16px;border-top:1px solid var(--el-border-color-lighter);padding-top:12px}.tfAdvanced['+scope+']>summary{cursor:pointer;font-size:12px;font-weight:500;padding:4px 0 12px;color:var(--el-text-color-regular)}')
 selected='.generationSettings .ratioOptions .ratioButton[aria-pressed=true]['+scope+']{color:var(--el-text-color-primary);border-color:var(--el-text-color-regular);background:var(--el-fill-color)}'
 replace(selected,'.generationSettings .ratioOptions .ratioButton[aria-pressed=true]['+scope+']{color:var(--el-color-primary);border-color:var(--el-color-primary);background:var(--el-color-primary-light-9);box-shadow:inset 0 0 0 1px var(--el-color-primary)}')
 replace('.tfCurrentLabel['+scope+']{font-size:11px;', '.tfClose['+scope+']{position:absolute;right:8px;top:8px;border:0;background:transparent;color:var(--el-color-primary);font:inherit;font-size:12px;cursor:pointer;padding:4px 6px;border-radius:4px}.tfClose['+scope+']:hover{background:var(--el-color-primary-light-8)}.tfClose['+scope+']:focus-visible{outline:2px solid var(--el-color-primary)}.tfCurrentLabel['+scope+']{font-size:11px;')
 # Keep footer controls usable when the summary has two lines or the node is narrow.
 footer='data-v-89af5127'if name.startswith('video')else'data-v-08e0567e'
 replace('.promptCard .promptFooter['+footer+']{justify-content:flex-start;align-items:center;gap:12px;display:flex}', '.promptCard .promptFooter['+footer+']{justify-content:flex-start;align-items:center;gap:8px;display:flex;flex-wrap:wrap}')
 if name.startswith('image'):
  replace('--el-radio-button-checked-bg-color:var(--el-fill-color);--el-radio-button-checked-text-color:var(--el-text-color-primary);--el-radio-button-checked-border-color:var(--el-text-color-regular)', '--el-radio-button-checked-bg-color:var(--el-color-primary-light-9);--el-radio-button-checked-text-color:var(--el-color-primary);--el-radio-button-checked-border-color:var(--el-color-primary)')
  replace('.generationSettings .sizeOptions .el-radio-button.is-active['+scope+'] .el-radio-button__inner{border-color:var(--el-text-color-regular)}', '.generationSettings .sizeOptions .el-radio-button.is-active['+scope+'] .el-radio-button__inner{border-color:var(--el-color-primary)}')
 # Keep form-generated dropdowns inside the popover so canvas click-outside does not dismiss it.
 form_start=patched.index('__name:`modelForm`');form_end=patched.index('__name:`generationSettings`',form_start)
 form_part=patched[form_start:form_end]
 import re
 form_part,count=re.subn(r'rules:(\w+)\.copyRules\(r\.rules\?\?\[\]\)',r'rules:\1.copyRules(r.rules??[]).map(t=>t.type===`select`?{...t,props:{...t.props,teleported:!1}}:t)',form_part)
 assert count==1,(name,'modelForm select patch',count)
 patched=patched[:form_start]+form_part+patched[form_end:]
 (work/'candidate'/name).write_text(patched)
 manifest[name]={'before':hashlib.sha256(source.encode()).hexdigest(),'after':hashlib.sha256(patched.encode()).hexdigest()}
(out/'patch.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('Prepared image/video parameter UI candidates; provider and backend unchanged')

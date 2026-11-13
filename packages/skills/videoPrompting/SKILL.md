---
name: videoPrompting
description: 编写和优化视频生成提示词，支持文生视频、图像或关键帧生视频及多参考生成；也为角色一致性编写角色参考板图像提示词。用户请求视频提示词、角色三视图或身份参考板，或指定 MiniMax H3、Seedance 2.0/2.5、Ovi、Veo 3、Wan 2.2、Wan Animate 2、LTX-2/2.3/2.5 时使用。
metadata:
  locales:
    en: en.md
  version: "1.0.1"
  displayName: 视频提示词（第三方）
  author: Square Zero Labs
  github: https://github.com/Square-Zero-Labs/video-prompting-skill
---

# 视频提示词

无限画布适配版：技能名称和资源路径已按项目命名约定调整。来源及许可证见 `sourceInfo.md` 和 `license.txt`。由 `videoPromptAdapter` 调用时，其执行、事实、素材、声音和授权规则优先。

## 概述

将用户意图转成符合目标模型要求的视频提示词，或为后续图生视频保持角色一致性的参考板图像提示词。模型专篇位于 `references/models/`，角色参考板资料位于 `references/workflows/characterSheets.md`。

先选择正确资料，只补问必要信息，再按对应格式编写。默认以中文交付说明和创作内容；用户逐字台词及模型要求的固定语法保留原样，参考资料的原始语言不改变当前交付语言。

## 模型索引

- Ovi：`references/models/ovi/prompting.md`
- Veo 3 / 3.1：`references/models/veo3/prompting.md`
- Wan 2.2：`references/models/wan22/prompting.md`
- Wan Animate 2：`references/models/wanAnimate2/prompting.md`
- Seedance 2.0：`references/models/seedance2/prompting.md`
- Seedance 2.5：`references/models/seedance25/prompting.md`
- MiniMax H3：`references/models/minimaxH3/prompting.md`
- LTX-2：`references/models/ltx2/prompting.md`
- LTX-2.3：`references/models/ltx23/prompting.md`
- LTX-2.5：`references/models/ltx25/prompting.md`

## 工作流索引

- 一致性角色参考板：`references/workflows/characterSheets.md`

新增模型时创建 `references/models/<model>/prompting.md` 并更新模型索引；新增工作流时创建 `references/workflows/<workflow>.md` 并更新工作流索引。

## 通用视频提示词规则

- 最终提示词不包含模型名、版本、总时长、画幅、分辨率或接口控制参数名，除非该模型规定的提示词结构明确要求时间。MiniMax H3 的对齐要求和镜头时间码属于例外。
- 其他情况下，时长仅用于内部判断能够承载的动作节拍数量。
- 用户询问参数或模型必须提供参数时，在提示词之外单列推荐参数。
- 图生视频以图像为视觉锚点。不重复详细描述原图，除非用户要求分析或确需修改细节；重点写动作、摄影机、情绪表演和声音。

## 工作流程

### 1. 识别任务

区分视频生成提示词与图像模型的角色参考板提示词。用户需要可复用参考板、三视图、表情板、服装板、摄影身份参考板，或长篇图生视频的一致角色起点时，进入角色参考板流程。

两者都需要时，顺序为：角色参考板 → 场景静帧或锚点帧 → 视频提示词。

### 2. 确认模型和输入模式

用户未指定模型时，询问模型或提供模型索引中的选项。先区分文生视频和图生视频，再按所选专篇确认额外关键帧或全参考模式。

MiniMax H3 区分 `T2VA`、`I2VA`、首尾帧 `FL2VA`、尾帧 `L2VA` 和全参考模式。末帧对齐或定时切镜依赖时长时，补问实际时长。

Seedance 2.5 区分文生视频、图生视频、参考生视频、编辑和延长。多节拍时间轴需要时长时补问；长镜头或连续性敏感镜头还要确认预期终态。推荐能够承载动作的最短时长，不默认每次取模型上限。

图生视频可请用户提供图片，以便更好地编写提示词；按模型规则将其作为身份、服装和构图锚点，文字聚焦动作、摄影机和变化。涉及版本、时长限制或必填参数时，仅询问选择格式所需信息。

LTX-2.3 未给时长时，外部参数默认 10 秒，询问是否需要更短或更长，并使动作复杂度匹配时长；提示词正文不写总时长。

LTX-2.5 区分连续单镜、原生多镜场景、剧本式对白、Dub-It 语音替换和 Video Editing IC-LoRA。用户询问设置、没有固定时长且接口支持时，可推荐外部自动时长；提供尾帧条件时使用固定外部时长。正文不写时长或设置名。

### 3. 读取对应资料

视频任务读取所选模型的 `prompting.md` 并遵循其格式。角色参考板任务读取 `references/workflows/characterSheets.md` 并遵循其结构；这是图像提示词，不是视频提示词。

### 4. 编写提示词

按所选资料的结构与约束完成正文。视频遵循该专篇的区块顺序、对白和声音格式及镜头规则。交付前清除正文里的模型名或版本、片长、画幅、分辨率和生成设置，所选模型明确要求的时间语法除外。

角色参考板严格按对应资料的布局、一致性约束和表情行要求编写。

### 5. 输出

默认只输出最终提示词。用户未要求多行且模型无结构要求时，默认单行。MiniMax H3 保留规定字段名、行序与空行；Seedance 2.5 的复杂时间轴或参考任务保留制作说明及时间轴换行；LTX-2.5 对白或节拍需要时保留剧本多行格式，普通单镜、图生视频及多镜散文默认一段。

用户要求选项时，提供 2–3 个自包含且符合格式的不同版本。模型需要接口参数时，仅在用户已经指定或明确询问参数时附简短推荐参数行。

完整一致性流程还需在角色参考板之后提供：使用该参考板的首个场景静帧提示词，以及后续图生视频镜头提示词。

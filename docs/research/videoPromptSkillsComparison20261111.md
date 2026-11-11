# 三个多模型视频提示词 Skill 对比

调研日期：2026-11-11。比较用户本机的 `ai-media-generator`、`cinematic-director` 和 GitHub 上的 `video-prompting`，重点是不同视频模型的提示词、宠物拟人口播带货以及接入 Toonflow 的可能性。

本报告根据 Skill 指令与参考文件分析设计取向，不等同于在真实模型上对三个 Skill 进行了 A/B 测试。它们写出的模型参数、最优字数和效果主张应回查对应模型、供应商和入口的实时能力；各 Skill 作者的评测和宣传不能直接作为横向排名。

## 结论

- **找多模型视频提示词优化的直接候选：** [video-prompting](https://github.com/Square-Zero-Labs/video-prompting-skill/blob/main/video-prompting/SKILL.md)。它以模型版本和输入方式为入口，加载对应规则后输出该模型的 Prompt；但当前索引没有列出可灵、Runway 等模型，也不是现成的 Toonflow 插件。
- **需要全面影片导演和逐镜细节：** [cinematic-director](/Users/llx/.codex/skills/cinematic-director/SKILL.md)。它覆盖故事、调度、分镜、连续性、声音、镜头提示词和修片建议，具有模型适配，但电影制作规则较多，简单宠物带货不宜强行套完整生产流程。
- **同时涉及图片、视频、音乐或多平台选型：** [ai-media-generator](/Users/llx/.codex/skills/ai-media-generator/SKILL.md)。覆盖范围最广，还有商品、Seedance 2.5 和声音等专项资料；规则多且部分资料有时效性，实际模型能力需复核。

对于现有 Toonflow 宠物带货流程，更合适的是保持宠物/商品/台词由宠物创作技能负责，模型适配使用明确且可维护的模型规则，画布连接与生成授权继续由工作流负责。**这只是架构建议，本次不改动现有工作流，也不自动安装三个 Skill。**

## 一览

| 比较项 | ai-media-generator | cinematic-director | video-prompting |
| --- | --- | --- | --- |
| 本次核对对象 | 本机安装文件 | 本机安装文件，主文件声明 2.1.0 | GitHub 主分支主文件及 Seedance 2.5、MiniMax H3 专篇；页面显示提交 `15e4b3c` |
| 定位 | 多媒体、多平台提示词和可选平台操作 | 影视导演、预演、分镜到声音/剪辑/质检 | 把输入整理成指定视频模型的提示词，也可生成用于角色一致性的图片提示词 |
| 主入口思路 | 识别媒体和平台，选模型及垂直资料，查词汇库、模板和质检 | 先处理故事与调度，再按工具控制面选提示词形式 | 确定模型和输入方式，加载该模型 `prompting.md`，按模型规则输出 |
| 覆盖媒体 | 图片、视频、音乐；还描述浏览器平台操作 | 视频制作、关键帧图、声音与剪辑规划 | 视频提示词和角色设定图提示词 |
| 模型规则 | 例如 Seedance、可灵、Runway、Veo、Vidu、海螺、Wan；也有图片与音乐模型 | Runway、Veo、Kling、Seedance、Wan 等 12 个适配器族，先看实际控制面 | 主索引列 Ovi、Veo 3/3.1、Wan 2.2、Wan Animate 2、Seedance 2.0/2.5、MiniMax H3、LTX-2/2.3/2.5 |
| 对宠物带货 | 有产品、UGC、对白、参考资产和商品外观资料；宠物主播需另补 | 调度、视线、爪子接触、镜头和对话可借用；需补宠物/商品事实 | 模型适配和参考分工可借用；需补宠物人设、带货剧情与事实边界 |
| 创作粒度 | 从创意到成片提示词，也有模型模板和问题修复 | 从故事节拍、站位到每镜的动作、光线和终态 | 从已有意图或镜头描述到模型适配后的完整 Prompt |
| 执行能力 | 指令包含网页自动操作与自动驾驶模式，依赖具体平台和工具 | 主要产出导演与预演方案，不因 Skill 文件本身获得生成能力 | 主要产出文字，不负责实际生成 |
| 安装及许可 | 本机 Codex Skill；本机 LICENSE 为 MIT | 本机 Codex Skill；本机 LICENSE 为 MIT | GitHub 仓库 Apache 2.0；未在本机常见 Skill 目录发现安装 |

模型清单是**文件列出的覆盖范围，不是已验证的供应商功能清单**。不同版本可能改名或新增模型，需检查实际项目版本。[来源：ai-media-generator 模型路由](/Users/llx/.codex/skills/ai-media-generator/SKILL.md)、[cinematic-director 适配器](/Users/llx/.codex/skills/cinematic-director/references/ai-video-tool-adapters.md)、[video-prompting 模型索引](https://github.com/Square-Zero-Labs/video-prompting-skill/blob/main/video-prompting/SKILL.md)。

## 一、ai-media-generator

### 怎样工作

主文件先识别媒体类型、目标平台、时长、比例、参考与音频，再进入平台文件。视频模型有独立参考，如 `references/kling.md`、`seedance.md`、`runway.md`、`veo.md`、`vidu.md`、`hailuo.md`；部分新模型放在多模型速查中。Seedance 2.5 的社群案例、广告/商品和长视频连续性又拆成独立参考文件。[来源：主文件平台路由](/Users/llx/.codex/skills/ai-media-generator/SKILL.md)

其 Prompt Craft Engine 提供通用组装框架和评分表；主文件还要求从不同层次选择具体摄影、光线、构图、风格等词，并按模型分流。可用于把简短想法扩展为脚本和多媒体提示词，但这些强制用词和评分是作者的方法，不能视为所有模型的最佳写法。[来源：Prompt Craft Engine](/Users/llx/.codex/skills/ai-media-generator/references/prompt-craft-engine.md)

### 宠物带货能借什么

- [商品和商业参考](/Users/llx/.codex/skills/ai-media-generator/references/seedance-domain-playbook.md) 有商品形态、参考职责、卖点证据、UGC 结构及检视问题，可辅助梳理商品展示。
- [Seedance 2.5 社群手册](/Users/llx/.codex/skills/ai-media-generator/references/seedance-2-5-community-playbook.md) 区分素材职责、对白归属和能力验证；它是 2026 年 8 月研究快照，不是实时官方事实。
- 有声、音乐、人物一致性及多平台操作资料较完整，适合横跨多种媒体的创作流程。

### 限制

它的 `auto-pilot` 有自动选型、默认值和平台执行步骤；其中“免费且无回复后继续”等逻辑不能覆盖 Toonflow 或用户的生成授权要求。它包含浏览器操作说明，但只有宿主具备对应工具和明确授权时才可执行。它也要求每条 prompt 使用一定数量的“高信号 token”，这与官方对 Seedance 2.5 没有统一最佳字数、按复杂度写清内容的建议不能直接画等号。

一个可核实的时效例子：本机 `seedance.md` 写的是截至 2026 年 8 月尚未找到完整 2.5 官方 Prompt 指南；[火山方舟当前 2.5 指南](https://docs.volcengine.com/docs/ark/seedance-2-5-prompt-guide?lang=zh)现已公开。因此不能只靠 Skill 快照决定当前模型能力。[来源：本机 Seedance 资料](/Users/llx/.codex/skills/ai-media-generator/references/seedance.md)

## 二、cinematic-director

### 怎样工作

它把任务分为故事节拍、视觉方案、人物调度、分镜、关键帧、视频提示词、声音、剪辑和质检等模式。用户只要单镜提示词时可只用相应模式；完整制作才串联更多步骤。核心是先想清人物/宠物和道具在空间里如何移动，再选景别与机位，要求动作有可见终态。[来源：主文件路由和硬规则](/Users/llx/.codex/skills/cinematic-director/SKILL.md)

它的[模型适配器](/Users/llx/.codex/skills/cinematic-director/references/ai-video-tool-adapters.md)先判断实际控制面，再选四种 Prompt 形式：强首帧图生视频、文生视频、首尾帧过渡、多镜头时间轴；另列视频编辑。每个模型族再提供模板、常见故障和修法。文件明确标注能力表为 2026 年 8 月快照，应以当下界面和官方文档复核。

### 宠物带货能借什么

- [镜头表模板](/Users/llx/.codex/skills/cinematic-director/assets/shot-plan-template.md)明确起始姿态、动作过程、终态、景别、机位、移动、光线和连续性，适合补足“猫怎么伸爪展示商品”的细节。
- [声音与对白](/Users/llx/.codex/skills/cinematic-director/references/sound-and-dialogue.md)与[视频提示词模板](/Users/llx/.codex/skills/cinematic-director/assets/video-prompt-template.md)有说话者、逐字台词、语音及口型安排。
- [商品与微距](/Users/llx/.codex/skills/cinematic-director/references/product-and-macro.md)专门考虑商品形态、材质、文字和接触风险。

### 限制

它不是宠物拟人带货专用，必须额外给出宠物表演方向、用户商品事实和推销内容。它提供的单镜动作预算、镜头时长、每秒字数以及 Seedance 提示词长度区间是作者的方法，不是所有模型的固定上限或实测成功率。例如其 Seedance 单镜写法给出 80–130/130–180 字的工作预算；方舟 2.5 官方指南没有提供统一最佳字数，复杂多镜不应机械截断到这些数字。

完整导演表的摄影机角度、镜头、布光和风险评分很细，适合复杂项目；普通宠物带货短片可能增加执行负担。它倾向逐镜生成/剪辑的制作思路，不能直接覆盖用户已授权的单次生成时长与次数。

## 三、video-prompting

### 怎样工作

主文件的路由是：判断视频提示词还是角色设定图 → 确定模型和输入方式 → 阅读对应模型的 `references/models/<model>/prompting.md` → 按该模型规则输出。它特别区分文生视频、图生视频、参考视频、首尾帧、编辑、延长等，具体分支按模型专篇而异。模型和参数通常单列，不把界面参数当作普通 prompt 内容。[来源：项目主文件](https://github.com/Square-Zero-Labs/video-prompting-skill/blob/main/video-prompting/SKILL.md)

它默认输出单条、单行 Prompt；例如复杂 Seedance 2.5 的多阶段结构是明确例外。简单图生视频以输入图作为视觉锚点，重点描述动作、摄影机、表演和音频；复杂参考任务写清参考职责、起点、事件顺序及终态。并非所有模型都支持该项目主文件索引以外的规则。[来源：Seedance 2.5 专篇](https://github.com/Square-Zero-Labs/video-prompting-skill/blob/main/video-prompting/references/models/seedance2-5/prompting.md)

### 宠物带货能借什么

- Seedance 2.5 专篇要求写说话者、逐字台词、说话时机、前后动作及声音；它会按复杂程度决定是否使用时间线。
- 参考素材逐份规定用途，有利于区分宠物身份、商品外观、场景、声音和动作参考。
- [MiniMax H3 专篇](https://github.com/Square-Zero-Labs/video-prompting-skill/blob/main/video-prompting/references/models/minimax-h3/prompting.md)按多种输入方式使用对应结构，展示了为模型分文件维护规则的方式。

### 限制

它的主索引未列出可灵、Runway、Wan 2.7；不能假设这些模型已有对应专篇。它没有宠物拟人主播、带货话术、商品事实与 Toonflow 画布授权的完整流程。其 Seedance 2.5 专篇对“已有台词音频”采用只引用音频、不在正文复述台词的特定策略；这是该 Skill 的写法，不能视为所有 Seedance 供应商的官方硬规则。

仓库 [LICENSE](https://github.com/Square-Zero-Labs/video-prompting-skill/blob/main/LICENSE) 为 Apache 2.0。其 README 的 Codex 安装方式要求带上 `video-prompting/` 的完整目录（含模型参考）并重启；只复制主文件会缺失路由目标。本次没有安装，也未测试 Toonflow 是否可直接扫描其命名和资源。项目许可、版本与文件内容未来可能变动，实际使用前重新核对。

## 四、同一需求下，三者分别带来什么

假设用户提供猫图、玩具实物图、室内场景图，确认“轻推玩具会摇晃”，希望猫面向镜头用中文口播。以下是依据各文件的**示意推演**，不是分别运行 Skill 产生的结果，也不是生成模型对照结果。

| 阶段 | ai-media-generator 倾向 | cinematic-director 倾向 | video-prompting 倾向 |
| --- | --- | --- | --- |
| 创意 | 先选平台、短视频或 UGC 形式、展示方式和参考资料 | 定义每镜展示什么，安排猫与商品的站位、视线和爪子动作 | 接收已有的猫、商品、动作与台词目标，并确定目标模型/输入模式 |
| 分镜 | 使用广告结构和平台对应 Prompt 模板 | 明确猫起始姿态、爪子如何触到玩具、玩具终态、机位/光线及下一镜衔接 | 将必要的镜头或阶段写成目标模型易于理解的提示词 |
| 模型适配 | 读取对应模型资料和该类型案例 | 按模型暴露的图生视频、首尾帧或多镜控制面选形式 | 读取对应模型专篇，用该版本的字段和引用方法组织 |
| 商品与声音 | 有商品外观锁、商品事实和声音资料 | 有商品材质/接触风险及对白表演模板 | 可绑定商品图、声源和台词；需上游提供可信商品事实与带货内容 |
| 交付 | 可包含可复制 Prompt、建议参数和平台操作指导 | 可包含镜头表、关键帧、声音、视频 Prompt 和修片建议 | 偏向直接交付一条模型适配后的 Prompt，参数按请求单列 |

具体一镜如果需要清楚呈现猫轻推玩具，**三者都可以写出详细文字**；从指令设计看，cinematic-director 更强调先把接触、站位和终态设计清楚，video-prompting 更强调把这些内容转换成对应模型的输入结构，ai-media-generator 则会结合平台、广告模板及多媒体资料组织。实际谁的片子更好，需要在同素材和参数下测量，不能由描述推断。

## 五、对当前 Toonflow 工作流的意义

当前 [petShortVideo](../../packages/skills/petShortVideo/SKILL.md) 在模型为 Seedance 2.5 时使用 [petCommercePromptSd25](../../packages/skills/petCommercePromptSd25/SKILL.md)，其他模型使用 [petCommercePrompt](../../packages/skills/petCommercePrompt/SKILL.md)。两种创作技能各自负责宠物带货，工作流负责真实节点、授权、参考和生成；它们没有调用本报告中的三个外部 Skill。

如果后续要支持更多模型，建议在设计前核对真实模型目录：

1. 宠物带货层先确定宠物身份、商品事实、逐镜动作和逐字口播，形成统一中间方案。
2. 模型适配层按**确切的模型和输入方式**选择一份规则；仅在已覆盖的模型使用对应专篇，缺失时保留通用方案并说明模型专门优化尚未核实。
3. 运行层按当前节点实际能力设置参数、解析 `{{ref N}}`、核对真实素材与授权。提示词里的 `@Image1` 等标签不能假设适用于当前供应商。
4. 同一阶段指定一个最终 Prompt 规则源。三个 Skill 对长度、镜头数量、参数写入位置、声音和自动执行有差异；不能无条件串联并让后一个随意覆盖前一个的剧情、台词和素材身份。
5. 明确候选的版本、许可证、更新来源和资源文件；如果复制或改编外部文件，应按对应 MIT/Apache 2.0 许可证检查署名和分发要求。

先做一个模型和同一商品的受控试用，再考虑扩大范围：保持宠物图、商品图、声音目标、时长、分辨率、生成次数一致；分别由候选规则产出提示词，记录实际模型、参考映射、费用、成片、失败类型，由人看听并评价商品一致、口播内容、口型、动作、分镜和可用性。未做这一步前不能用本报告断定谁生成更好。

## 资料与限制

- 本机 [ai-media-generator](/Users/llx/.codex/skills/ai-media-generator/SKILL.md) 与 [cinematic-director](/Users/llx/.codex/skills/cinematic-director/SKILL.md) 为本次读取对象，不能假设其与 GitHub 当前主分支完全一致；前者目录约 67 个文件，后者约 50 个文件，数量只说明资料规模。
- GitHub [video-prompting 主文件](https://github.com/Square-Zero-Labs/video-prompting-skill/blob/main/video-prompting/SKILL.md)、[Seedance 2.5](https://github.com/Square-Zero-Labs/video-prompting-skill/blob/main/video-prompting/references/models/seedance2-5/prompting.md)、[MiniMax H3](https://github.com/Square-Zero-Labs/video-prompting-skill/blob/main/video-prompting/references/models/minimax-h3/prompting.md)、[LICENSE](https://github.com/Square-Zero-Labs/video-prompting-skill/blob/main/LICENSE) 已通过 GitHub 页面核对；本次未复制、安装或运行该 Skill。
- 官方事实核对入口：[火山方舟 Seedance 2.5 指南](https://docs.volcengine.com/docs/ark/seedance-2-5-prompt-guide?lang=zh)及[官方撰写指南](https://bytedance.larkoffice.com/docx/OsiUdR1OxoDqvnxsK8LczYx7nPd)。对应能力是否通过 Toonflow 具体供应商暴露，需要现场核实。
- 本次没有运行同题提示词生成、模型 A/B、真实宠物口播、画布操作或付费调用；优劣结论仅适用于规则设计与适用范围。

# 宠物拟人口播带货：视频提示词 Skill 调研

日期：2026-11-10。范围：比较 Skill 的公开或本机规则与官方模型文档，判断适配性；未运行视频生成、口型对照或商业转化测试。Skill 内容是作者的方法主张，不等于模型实测结果。

## 结论

建议以 Square-Zero 的 video-prompting 作为**逐镜提示词结构参考**，结合本机 cinematic-director 的调度和产品细节方法，以及 ai-pet-short-video-director 的动物动作与一致性方法，为现有 petShortVideo 定制“宠物拟人口播带货”规则。电商广告 Skill 可借鉴内容节奏，但不能照搬其未经证实的性能和营销结论。不建议将多个 Skill 全量拼接：它们在格式、拟人程度和模型路由上可能冲突，应为 Toonflow 明确单一优先规则和模型适配。

## 调研时原有规则的问题

- 调研时 `petShortVideo` 1.0.4 明确读取其本地 `lengyi.md`，规定视频采用主体、场景、固定音乐行与多镜头格式。Lengyi 已要求每镜的时间、景别、动作、运镜、构图及动态，因此不能说它完全没有镜头细节。随后该快照已由独立的 [宠物带货提示词](../../packages/skills/petCommercePrompt/SKILL.md) 替换，当前行为见[变更记录](../knowledgeBase/changes/petCommercePrompt20261110.md)。
- 但 Lengyi 将镜头正文限定为画面，声音固定为“不要生成任何背景音乐，只生成对应音效”，没有规定逐镜口播原文、说话归属、声音性格、语速、口型或对白与动作的时序。该限制与拟人带货口播的目标存在明确缺口。
- 它建议 30 秒通常 8–14 镜，并要求每镜运镜和环境动态；这些是其创作规则而非已验证的模型要求。对于说话镜头，频繁切镜或同时叠加动作可能不利于口播可读性，实际需要按内容和模型试验。

## 候选对比

| 候选 | 实际可借鉴内容 | 局限 |
| --- | --- | --- |
| [Square-Zero video-prompting](https://github.com/Square-Zero-Labs/video-prompting-skill/blob/main/video-prompting/SKILL.md)，[Seedance 2.5 规则](https://github.com/Square-Zero-Labs/video-prompting-skill/blob/main/video-prompting/references/models/seedance2-5/prompting.md) | 区分输入模式；参考素材分别规定用途；明确初态、时间线、动作、镜头、声音、终态；生成对白时写原文、说话者和时间，控制对白长度。 | 非宠物或电商专用；其中能力与格式规则是作者主张，实际以所用供应商为准；音频参考时的处理与纯文本对白不同。 |
| 本机 [cinematic-director](../../../../.codex/skills/cinematic-director/SKILL.md)，[公开仓库](https://github.com/wuwangzhang1216/DirectorSKILL) | 先确定调度和可见动作，再定构图；动作终态、光线、身份连续性、商品与声音规划；按模型控制面适配。 | 不是宠物带货专用；其短镜头和动作预算是建议，非模型保证。 |
| 本机 [ai-pet-short-video-director](../../../../.codex/skills/ai-pet-short-video-director/SKILL.md) | 保持宠物外观、肢体结构和参考一致，明确爪子、视线、身体、道具接触及动作前后状态。 | 默认不将宠物变成人形，主要面向宠物故事；用户明确要拟人演绎时，应允许有意识地模仿主播，而非把其自然动物动作原则当作禁止拟人。 |
| [dexhunter Seedance Skill](https://github.com/dexhunter/seedance2-skill/blob/main/zh/SKILL.md) | 原文有猫狗脱口秀对白示例，能启发角色说话、语气和反应的编排。 | 示例并非完整宠物带货流程，也不证明口型或模型能力。 |
| [Higgsfield 电商广告 Skill](https://github.com/beshuaxian/higgsfield-seedance2-jineng/blob/main/skills/07-ecommerce-ad/zh-CN/SKILL.md) | 可参考开场吸引、商品展示、演示和结尾行动引导等电商节奏。 | 宣称的 6–60 秒、99% 色准及效果结论未在其文中提供充分证据；不专门处理宠物口播，不能直接当作供应商规格或效果保证。 |

另一本机 [ai-media-generator](https://github.com/Hao0321/ai-media-generator) 附有商品参考职责、商品形态锁和声音规划，可作补充。它包含很多模型能力与“最佳 prompt 长度”断言，需逐项用目标供应商文档和实验验证，不能跨模型照搬。

## 建议的逐镜结构

1. **素材角色**：宠物、商品、场景分别使用实际可访问的参考；标明各参考负责什么，按节点实际连接顺序映射，不猜引用编号。
2. **商业信息**：用户已确认的品牌、产品、卖点和行动引导；缺失信息留待确认，不生成虚构功效、价格或包装文字。
3. **镜头计划**：时间、画面用途、起始状态、宠物姿态与视线、爪子和商品关系、主要动作及结束状态、景别和单一合适机位/运镜、光线、画面主体。
4. **口播单列**：宠物是画内说话还是画外配音，写清逐字台词、语言、声音风格、开始结束时间、停顿和与动作的关系；画内口播才要求口型对齐。实际可否生成中文、音频、参考音频和口型以接入模型为准。
5. **生成与验收**：把可读的口播时间留足；避免将复杂拿取、旋转商品、长句和镜头运动强塞同一镜头。检查宠物身份和肢体、商品外观/标签、口播字词和发音、口型及声音同步。一次生成不可用时先判断是声音、动作、商品或参考问题，再决定重新生成或拆镜、后期配音。

示意镜头（虚构，不是商品事实或实测结果）：

> 0–5 秒，中近景，固定机位。橘猫坐在桌后，眼睛看镜头，商品瓶直立在画面右侧，猫的左前爪轻搭桌面。它先抬爪向商品方向示意，再保持不动；窗侧柔光从画面左侧照亮脸和瓶身。橘猫以轻快的中文说：“今天给大家看看这个。”说话时嘴部随语音变化，句末停顿；商品轮廓与参考一致。轻微室内环境声。

该示例仅展示希望表达的细节；拟人动作、准确语音和同步效果须经真实模型检验。

## 官方能力参考与验证边界

- [Google Veo 视频提示指南](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/video-gen-prompt-guide)：将主体、动作、场景、机位、时间和音频作为可选构成，并示例明确说话者与台词；也说明部分高级摄像角度与镜头效果不受官方支持或可靠性因场景而异。它是 Veo 指南，不能证明 Seedance 具有相同控制能力。
- [Runway Act-Two 表演捕捉](https://help.runwayml.com/hc/en-us/articles/42311337895827-Performance-Capture-with-Act-Two)：用人物表演视频和角色图或视频驱动角色，官方称适用于非人类角色；角色图片与视频的手势控制不同。它可作为表演驱动的备选思路，不能证明 Toonflow 已接入该能力，也不能保证宠物商品交互与中文口型成功。
- 下一步应先核实 Toonflow 当前模型与供应商的声音和参考输入能力，再用同一宠物图、商品图和台词，对照当前 Lengyi 与候选规则生成样片，逐项记录结果和成本。是否实现或更换规则由后续需求决定。

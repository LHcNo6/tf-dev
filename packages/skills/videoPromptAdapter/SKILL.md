---
name: videoPromptAdapter
description: 将已有视频创作或分段方案按确切模型版本和输入模式整理为视频生成提示词；适用于 Toonflow 短视频和长视频，包含宠物带货规划参考，不调用生成。
metadata:
  version: "1.1.1"
  displayName: 视频模型提示词适配
  author: Toonflow
---

# 视频模型提示词适配

接收已确定的创作方案、目标模型及版本、供应商、输入模式、时长、真实参考职责和声音目标，输出一条或每段一条完整提示词与单列的参数建议。本技能只组织文字，不操作画布、不执行生成、不改变模型或扩大授权。保留已确认剧情、逐字台词、宠物身份、商品事实、事件顺序和用户要求；格式调整不能删改这些内容。

## 模型路由

先核实目标的确切版本和模式，再按需用同一技能的 name、scope 读取对应 `references/` 文件：

| 目标 | 资料 | 状态 |
| --- | --- | --- |
| Kling VIDEO 3.0（不包括 Omni） | `references/klingVideo30.md` | 官方 VIDEO 3.0 用户指南已核查；实际输入和开关仍以节点为准 |
| Veo 3.1 | `references/veo31.md` | Google Veo 提示指南已核查；具体版本和输入需由当前供应商核实 |
| Wan 3.0 | `references/wan30.md` | 未找到可核实的 3.0 官方或对应第三方专篇，使用通用方案并标记未核实 |

优先使用上表中与确切版本、模式相符且可读取的官方来源规则；该规则不存在、不可读取或未覆盖本次输入模式时，按下表查询第三方 `videoPrompting` 中完全对应的版本及其专篇。**模型名相似不等于同一版本**，先核实第三方专篇覆盖本次输入模式；不满足时使用通用方法并标记“该模型专门优化未核实”。

| 确切目标 | 第三方 `videoPrompting` 中的 path |
| --- | --- |
| Ovi | `references/models/ovi/prompting.md` |
| Veo 3 或 3.1 | `references/models/veo3/prompting.md` |
| Wan 2.2 | `references/models/wan22/prompting.md` |
| Wan Animate 2 | `references/models/wanAnimate2/prompting.md` |
| Seedance 2.0 | `references/models/seedance2/prompting.md` |
| MiniMax H3 | `references/models/minimaxH3/prompting.md` |
| LTX-2、LTX-2.3、LTX-2.5 | 分别为 `references/models/ltx2/prompting.md`、`references/models/ltx23/prompting.md`、`references/models/ltx25/prompting.md` |

第三方路由：先用 `skillOperator(action=list, scope=global)` 查找实际 `videoPrompting`，然后用返回的 name 和 `scope=global` 读取主文件、`sourceInfo.md` 和上表对应 path，确认来源及版本；无 skillOperator 时按本轮技能目录中的全局实际位置读取。专篇引用的示例仍以同一 name、scope 和相对路径读取。第三方技能、来源、专篇或匹配模式不可用时说明来源缺失，使用本文件通用方法并标记未核实；不擅自借用相邻版本。第三方写法是作者建议，不代表供应商或 Toonflow 的执行能力。将来源和未验证项随方案交付。

第三方规则只负责组织对应模型的 prompt；本技能、调用方和用户的已确认剧情、逐字台词、实际引用及声音、时长、授权和参数约束优先。上游的只输出单行、默认时长、音频或引用标记等要求与上述约束冲突时，保留用户目标和工作流要求，不静默删除台词、引用、镜头或改模型。真实引用由工作流映射，第三方样例中的 `<Picture 1>` 等不能当作已经绑定。

Seedance 2.5 宠物短片和长视频由 `petCommercePromptSd25` 定稿，普通 Seedance 2.5 长视频由 `sd25-pe` 定稿；Seedance 2.0 长视频由调用方的 `workflow` PART A 定稿。本技能均不重写这些最终 prompt。模型变化时由调用工作流重新适配受影响段并核对授权。

## 通用方法

按实际输入描述：文生视频写主体、场景、起始状态；图生视频说明现有图像的职责，重点写动作、可见变化、摄影机和终态，不重新设计已确定外观；首尾帧或多参考只在实际输入存在且模式支持时写各自职责。按先后顺序安排动作及声音；每句对白写明说话者、逐字内容、语言、语气和画内/画外位置。只写必要的一致性、接触和光线约束。参数、提示词与待绑定素材分开；不要把未提供的媒体、未配置的开关或模型效果当事实。

输出创作目标、参考来源和职责、每段完整可复制提示词、实际参数与待验证项。引用按调用方真实连接映射，例如 `{{ref N}}`；未就绪时写素材身份和绑定规则，不编造编号。模式或能力明确不支持必要输入时交回工作流，不擅自删除输入、切模型或改成无声。中文语音、口型及时间服从等质量未知时保留目标并标明未验证，由调用方在授权范围内尝试。

宠物带货的全片及长视频规划读取 `references/petCommercePlanning.md`；它是创作输入，Seedance 2.5 每段再由宠物专版完成提示词，单段时长以模型实际能力及专版范围为准。资料来源、许可证及验证边界见各参考文件和项目知识库。

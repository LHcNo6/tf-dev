# Seedance 2.5 长视频逐段优化与多参考衔接

日期：2026-11-11。

`longVideoWorkflow` 1.3.0 先规划全片并按实际模型能力分段：普通 Seedance 2.5 长视频逐段使用全局官方 `sd25-pe`，宠物带货逐段使用 `petCommercePromptSd25` 1.1.0；将剧情、逐字台词、资产与前后状态传入每段，不重复片头和收尾。此路线不使用 `workflow` PART A 或其执行文件；Seedance 2.0 保留原路线。官方 Skill 在本机全局目录存在，与先前核验的 BytePlus 版本摘要一致；其自更新在无联网 npx 工具时按官方失败分支提示后继续，不假称已更新。

视频生成节点 2.0.3 新增 `node:setContinuityReferenceBinding`，将已核验的上一段尾帧与其他资产作为多参考输入。此方式不是硬首帧，不保证第一帧逐像素一致；沿用真实 `referenceOrder` 和供应商多参考协议，不修改或声称支持混用硬首帧字段。绑定含来源、视频地址和 attemptId，关联提取记录的 SHA-256；绑定及生成前核对连接、输出、视频、生成记录和文件内容，提示词需引用实际参考编号。旧尾帧若无摘要需重新提取，旧硬首帧绑定保持原行为。`videoPromptAdapter` 1.1.1 更新描述，避免把 Seedance 2.5 长视频导向旧 PART A。

实现位置：`packages/nodes/videoGenerationNode/src/index.vue`、`packages/skills/longVideoWorkflow/SKILL.md`、`packages/skills/petCommercePromptSd25/SKILL.md`。维护文档见[视频尾帧](../videoLastFrame.md)、[视频合成](../videoComposition.md)及[宠物带货](../petShortVideo.md)。

## 验证与未完成项

视频生成节点类型检查及生产构建、服务端构建和 `git diff --check` 通过。更新前核对并备份开发数据目录中的节点与三个 Skill；源码、构建及安装副本一致。检查全部开发工作区没有运行中的 Agent，核对后重启开发后端；网页及后端均返回 HTTP 200。运行时技能接口显示 `longVideoWorkflow` 1.3.0、`petCommercePromptSd25` 1.1.0、`videoPromptAdapter` 1.1.1 和全局 `sd25-pe` 已启用；节点产物接口返回的文件包含新工具名称。

在开发测试画布中创建视频生成节点并选择了安泰信 Seedance 2.5，随后移除了本次创建的空白节点；页面和节点加载正常。没有完成图片多参考连线、绑定调用、保存重开、修改文件或旧首帧的画布交互验收，也没有拦截并验证实际供应商请求。向配置中的 Toonflow Agent 发送检查请求被自动审批拦截，理由是可能把画布或会话上下文传给未明确的模型供应商；没有发送请求。普通剧情和宠物带货的真实 Agent 逐段方案、模型分流、付费生成、口型和成片衔接均未验证。

开发环境备份位于系统临时目录；回退需恢复对应节点产物、三个 Skill 安装副本及源码，检查是否存在后续用户修改。官方 `sd25-pe` 不随本次构建分发，其他数据目录没有全局安装该 Skill 时应先安装或说明缺失，不自动冒充已有官方版。

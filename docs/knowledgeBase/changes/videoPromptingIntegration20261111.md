# 接入第三方视频提示词规则

日期：2026-11-11。

将 Square-Zero-Labs 的 `video-prompting` 以 `videoPrompting` 安装为 Toonflow 内置技能，来源提交 `3f55fd70342d0874d66a54e9708e881462414c06`；保留全部 20 个上游技能文件及 Apache 2.0 许可证。为满足项目命名和加载规则，将技能名、目录、资料文件名及其引用路径改为小驼峰，补充元数据、来源说明与适配器的优先级约束；模型资料正文没有其他改写。相关资料和许可证在 `packages/skills/videoPrompting/`，上游来源见其中 `sourceInfo.md`。

`videoPromptAdapter` 1.1.0 统一路由：先选择适用的已核实官方来源，官方规则不存在、不可读取或不覆盖该输入模式时，读取全局 `videoPrompting` 中对应确切版本与模式的第三方专篇；仍无匹配则保留通用写法并标记专门优化未核实。第三方规则不能覆盖用户剧情、逐字台词、实际素材、声音、参数、授权及生成约束，也不证明节点支持所述能力。上游包含 MiniMax H3、Wan 2.2、Wan Animate 2、Ovi、Veo 3/3.1、LTX-2 系列和 Seedance 2.0/2.5；上游未包含 Wan 3.0 专篇。Seedance 2.5 宠物短片和 Seedance 长视频仍分别由 SD 版宠物技能和 `workflow` PART A 定稿。

`petShortVideo` 1.3.1 与 `longVideoWorkflow` 1.2.1 均通过适配器选择模型规则；应用启动时在已初始化数据目录中补装缺失的 `videoPrompting`，保留已有同名用户技能。实现位置：`packages/skills/videoPrompting/`、`packages/skills/videoPromptAdapter/SKILL.md`、两个工作流主文件和 `apps/server/src/app.ts`。维护入口见[宠物短视频与带货提示词](../petShortVideo.md)。

## 验证与边界

服务端类型检查、Bun 1.4.0 服务端构建和 `git diff --check` 通过。按上游提交校对 19 个附属文件及许可证，模型资料除了路径替换与换行规范化外一致；全部 Markdown 内部引用均有目标文件。构建目录和开发数据目录与源码一致，更新前核对了现有版本并将三个主文件备份到系统临时目录。隔离数据目录验证了首次补装、新技能附属资料、已有工作流与同名技能不被覆盖。

提交时对所有暂存文件运行 `git diff --cached --check`，发现上游许可证末尾空行和 `wanAnimate2` 专篇四处尾随空格；保留这些上游原文，禁用两项空白检查后其余暂存检查通过。上文开发时的 `git diff --check` 未包含当时尚未暂存的新文件。

重启前检查全部三个开发工作区的 Agent 会话，没有运行中的主 Agent 或子 Agent；核对进程后重启开发后端。网页与服务端均 HTTP 200，技能列表显示四个相关技能已启用并返回预期版本；实际 `skillOperator` 成功列出并读取适配器、第三方主文件、来源、MiniMax H3、Wan 2.2、LTX-2.5 和 Ovi 示例。未运行真实 Agent 的模型分流、画布生产或付费模型生成，实际口播、口型和成片效果未验证。文件和工具读取不保证 Agent 一定遵循规则。

回退时恢复三个工作流/适配器安装副本及相应源码构建，再移除或停用本次安装的 `videoPrompting`；检查是否存在用户对该 Skill 的后续修改后再处理。已存在的同名 Skill 不会被启动流程覆盖；若它不是记录的上游来源，适配器回退通用规则。

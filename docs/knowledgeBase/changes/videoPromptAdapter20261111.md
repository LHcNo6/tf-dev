# 多模型视频提示词与宠物长视频规划

日期：2026-11-11。

新增 `videoPromptAdapter` 1.0.0，按确切模型版本和输入模式读取可灵 VIDEO 3.0、Veo 3.1 或 Wan 3.0 资料，并提供未核实版本的通用方案。可灵官方 3.0 用户指南及 Google Veo 系列提示指南已阅读；Wan 3.0 官方提示指南未核实，明确保留通用方案，不将其他版本经验冒称官方。模型官网功能、输入模式和效果不等于当前 Toonflow 节点能力。共享宠物带货规划覆盖主播姿态、商品事实、逐字口播及跨段状态。

`petShortVideo` 1.3.0 在非 Seedance 2.5 的创作方案之后调用适配器；Seedance 2.5 继续由 `petCommercePromptSd25` 1.0.1 完成最终提示词。`longVideoWorkflow` 1.2.0 为宠物带货加入规划分支；非 Seedance 模型逐段适配，Seedance 保留 `workflow` PART A 和 A9。两者维持实际参考、授权、次数与首帧限制。源码在服务启动时补装缺失的适配器，已有同名目录不覆盖。

实现位置：`packages/skills/videoPromptAdapter/`、`packages/skills/petShortVideo/`、`packages/skills/longVideoWorkflow/`、`packages/skills/petCommercePromptSd25/`、`apps/server/src/app.ts` 与 `apps/server/src/agent/runtime/prompt.ts`。持续维护见[宠物短视频与带货提示词](../petShortVideo.md)。三个外部 Skill 的方法来源及许可见适配器的宠物规划参考；未复制外部模板。

## 验证与边界

服务端 TypeScript 检查和构建通过，使用安装版自带 Bun 1.4.0（项目声明 1.4.3）。构建目录与开发数据目录中的受影响 Skill 文件在旧构建与安装版本一致后同步，原安装主文件备份至系统临时目录。服务端启动前本机 3000 端口无可访问服务；随后启动新构建，服务端及开发网页均返回 HTTP 200。技能接口读取到四个启用版本及全部适配器资料；实际 `skillOperator` 能列出并跨技能读取它们。隔离数据目录验证已初始化时补装新 Skill、保留同名用户技能；静态检查覆盖引用路径和两条工作流的关键约束。

未执行真实 Agent 生成脚本或自动路由、实际画布制作、付费生成及视频审看听音，无法保证宠物口型、商品一致性或最终效果。文件与工具读取成功不证明 Agent 会始终遵循文本指令。

部署时应以受影响源码重建服务，将新 Skill 和附属参考安装到实际数据目录，更新工作流及专版，确认同名工作区 Skill 不覆盖预期版本；重启前检查活动任务。回退须恢复对应工作流、Seedance 专版、适配器安装与宿主构建；不要覆盖用户自定义技能。

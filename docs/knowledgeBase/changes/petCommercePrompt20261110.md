# 宠物带货提示词 Skill 与工作流接入

日期：2026-11-10。

新增独立 `petCommercePrompt` 1.0.0，负责宠物拟人主播的脚本、资产提示词和完整视频提示词。逐镜写清姿态与视线、前爪/商品接触、动作过程及终态、取景和光线、逐字口播、声音归属与停顿；允许固定机位和稳定环境，按口播和内容分配镜头。已确认商品事实、参考职责、物种身份和能力限制构成创作边界。附属资料提供一条完整的 24 秒橘猫介绍玩具示例，标明其虚构前提和未验证状态。

`petShortVideo` 升级至 1.1.0，先发现并读取新 Skill 及其 `references/shotGuide.md`，以其作为唯一创作规则源；移除工作流内的 Lengyi 快照及模板。画布、模型参数、授权和自动模式预算继续由原工作流执行，补充口播能力核实和表达方式冲突处理。宿主新增仅创作内容的直接路由，避免只要提示词时启动制作；已有初始化数据目录缺少新内置 Skill 时自动补装，同名版本保留。

主要位置：`packages/skills/petCommercePrompt/`、`packages/skills/petShortVideo/SKILL.md`、`apps/server/src/app.ts`、`apps/server/src/agent/runtime/prompt.ts`。当前行为见[宠物短视频维护说明](../petShortVideo.md)，范围见[规格](../../localIssues/petCommercePrompt/spec.md)，方法来源见[调研](../../research/petCommerceVideoPromptSkills20261110.md)。

## 验证

服务端 `typecheck` 和 `build` 通过，构建包含新技能。重启前查询本机三个工作区的 Agent 会话，未发现运行中的 Agent 或子 Agent；本地后端已重新启动。技能接口读取到已启用的内置 `petCommercePrompt` 1.0.0 和 `petShortVideo` 1.1.0，新 Skill 在启动时被自动补装。开发工作流旧版本已备份，再同步源码与安装副本并移除其 Lengyi 资源。

使用真实 `skillOperator` 插件和服务端技能上下文执行 list/read，在 `global` scope 成功读取新 Skill 主文件与 `references/shotGuide.md`；技能文件 HTTP 接口也成功读取该资料。两个 Skill 的源码、`build/skills` 和 `data/skills` 内容一致，旧 Lengyi 快照与模板均已移除。`http://localhost:5173` 和 `http://localhost:3000` 均返回 HTTP 200，浏览器可打开 Toonflow 首页；`git diff --check` 通过。通用 skill-creator 校验器因本机 Python 缺少 PyYAML 未能运行，采用 Toonflow 实际 SDK 扫描和技能读取接口核对；未向仓库增加测试脚本或依赖。

## 未验证边界与更新注意

未调用媒体模型或通过 Agent 实际制作视频，未验证拟人动作、商品一致性、中文语音、口型同步、成片质量和转化效果。同名 Skill 保留分支沿用现有实现，未用修改用户 Skill 的方式做覆盖试验。新规则不新增配音、对口型或剪辑工具，也不扩大已有生成授权。

已有用户安装需同时更新工作流并安装新创作 Skill；源码变更不自动覆盖现有同名版本。回退须同时恢复工作流、创作 Skill、宿主路由及安装副本；独立安装的通用 Lengyi Skill 保留，不影响其他工作流。当前本机使用 Bun 1.4.3。

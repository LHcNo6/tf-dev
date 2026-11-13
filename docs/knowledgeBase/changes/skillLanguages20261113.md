# 2026-11-13 Skill 中英文入口与品牌统一

## 实际变更

为 9 个内置技能和用户确认纳入的 3 个已安装第三方技能（`seedance`、`sd25-pe`、`lengyi-seedance25-prompt`）准备中文、英文名称、描述和入口正文。技能保留唯一技术 `name`，中文规范入口声明 `metadata.locales.en: en.md`；中文请求读取 `SKILL.md`，英文请求读取 `en.md`，不出现中英文两条重复技能。中文品牌文案改为“无限画布”，英文改为“Infinite Canvas”，真实上游地址、协议与工具标识保持兼容。

界面切换语言时重新加载技能菜单及已安装列表，取消旧请求，防止旧响应回填。技能读取、Agent 发现、默认主正文、`skillOperator` 的 `path=SKILL.md`、MCP 资源和接入技能下载使用同一请求语言规则。技能编辑器文件树隐藏另一语言入口，读写携带实际路径，防止切换语言后错写译本；两份入口都受主文件校验与移动保护，完整导出仍保留两份。

简体和繁体界面均使用简体中文技能，其他尚未提供译本的界面语言回退英语。未声明译本的其他自定义技能保持原文。本次没有自动覆盖全部用户技能的升级机制，也没有接入尚不存在的主站；未来主站通过现有请求 `Accept-Language` 传入所选语言。

## 关键实现

- `apps/server/src/utils/skills/localize.ts`：按请求异步上下文选择入口，验证同目录普通文件、路径边界、相同 name 和合法描述，不修改进程全局语言。
- `apps/server/src/agent/skills/index.ts`、技能 HTTP 路由、文件操作及 MCP 资源：共用译本规则；工作区优先级、启停、原始相对资料路径保留。
- `apps/web/src/components/agent/skillMenu.vue`、设置插件市场及技能编辑器：本地化展示、按语言重取和明确路径读写。
- `packages/skills/`：9 个内置双语入口及版本更新。`packages/mcp/skills/toonflow/`：按语言独立下载的服务接入入口。
- `packages/skillLocales/`：3 个额外安装技能的双语入口来源，构建复制至 `build/skillLocales/`，需与原包合并，不能用仅入口目录替换完整原包。

## 本机同步与回滚

已先核对 9 个内置已安装入口与原版一致，再备份并同步改动文件；用户确认纳入另外 3 个技能后，先备份其入口，再同步两种入口。备份位于被 Git 忽略的 `data/skillBackups/skillLocalization20261113/`，实际安装仍位于 `data/skills/`。参考资料、许可证和其他原文件保留。源码中的第三方入口译本用于后续部署合并；完整迁移可使用现有导出分享功能取得 ZIP。回滚时恢复对应备份入口；恢复单语版本后应同时处理其语言声明，避免残留错误引用。

`sd25-pe` 保留其固定的尽力更新命令及失败继续分支；上游更新可能覆盖入口/语言声明，更新后须重新核对译本，不能宣称旧译本对应新的上游版本。

## 验证与边界

已执行并通过 Web `vue-tsc`、Server `tsc`、Web/Server/MCP 构建及 `git diff --check`，构建已同步 `build/web`、`build/server`、`build/skills`、`build/mcp` 和 `build/skillLocales`。Vite 存在既有配置扩展名和大分块提示，构建成功。

使用 Ego Lite 在本地网页实际切换语言，核对已安装列表及 Agent 选择技能菜单：中英文各显示同一组 12 个技能的对应名称/描述，菜单保留原 `/skill:name` 技术指令。编辑器英文默认 `en.md`、中文默认 `SKILL.md`，文件树隐藏另一份入口，正文品牌与语言匹配。检查后恢复原来的“跟随系统”语言设置并返回首页，未发送 Agent 消息或改动正文。

实际 HTTP 验证中英文 `/api/skills/get`、`/api/skills/list`、`/api/skills/read`、`/api/agent/skills` 与 `/api/mcp/skill` 均返回 200 和对应语言。4 个并发中英文列表请求各自返回 12 条，未观察到语言串用。直接只读调用 `createSkillContext.read`，中文与英文的显式 `path=SKILL.md` 分别解析为 `SKILL.md` 与 `en.md`。未通过该调用执行写入或生成。

本地服务与 Web 开发服务已重启，刷新地址 `http://localhost:5173/`。构建网页 `http://localhost:3000/` 及其实际入口脚本均返回 200。未改动或启动桌面端、移动端。

双语范围为名称、描述和入口正文。原模型专篇、方法参考、示例数据及第三方许可证保留来源语言；逐字对白、模型固定语法、参数名与真实来源链接也可能保留原标识。英文入口有按语义合并重复说明，并非逐行镜像。没有执行上游自动更新、模型生成、付费请求或真实 Agent 制作；构建及入口切换通过不代表模型效果、生成质量或行为完全等价已验收。未验证桌面端、移动端和未来主站接入。

相关主题：[Skill 中英文与语言选择](../skillLanguages.md)。

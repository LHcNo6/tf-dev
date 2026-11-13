# Skill 中英文与语言选择

[返回知识库](readme.md)

## 当前行为

9 个内置 Skill 及本机已安装的 `seedance`、`sd25-pe`、`lengyi-seedance25-prompt` 均提供中文入口 `SKILL.md` 和英文入口 `en.md`，两种入口使用相同 `name`，不会成为两条重复技能。名称、描述和入口正文按每个请求的 `Accept-Language` 选择：`zh-CN`、`zh-TW` 使用简体中文版，英语及其他暂未提供 Skill 译本的语言使用英文版。没有语言头时沿用服务端既有语言回退规则。切换界面语言会重新加载打开的技能菜单和已安装插件列表。

中文产品文案使用“无限画布”，英文使用“Infinite Canvas”。模型名称、工具名、参数、引用句柄、现有协议及真实上游来源链接保留原标识。第三方许可证、模型专篇、示例数据，以及已有中文方法资料保留来源语言；本次双语覆盖名称、描述及入口正文，不将参考资料误称为已完成全文翻译。入口规定的交付语言优先于参考资料原始语言，用户原始对白和模型固定语法继续保留。

菜单展示本地化名称，仍以原 `name` 插入 `/skill:name`。Agent 自动发现、显式调用及 `skillOperator` 默认正文读取使用同一译本。`skillOperator` 读取 `path=SKILL.md` 时也选择当前语言入口，附属资料路径仍相对技能根目录。

已安装页的编辑器默认打开当前语言入口，文件列表隐藏另一语言入口；导出 ZIP 保留完整双语包。中英文入口都受主文件身份校验和禁止移动保护。编辑器读取及保存携带实际路径，避免界面语言改变后误写另一入口。关闭编辑器再切换语言可编辑另一版本；运行中会话沿用本轮语言，后续请求重新选择。其他用户技能没有声明英文译本时保持原样，不自动翻译或删除。

MCP 接入技能下载 `/api/mcp/skill` 也按同一请求语言提供独立的中文或英文 `SKILL.md`；`name: toonflow` 是既有调用标识，展示名和产品正文使用新品牌。MCP 的资源列表按当前服务请求上下文选择内置 Skill；未携带语言头的外部客户端继续使用既有服务端回退值。

## 实现位置

- `packages/skills/<name>/SKILL.md` 的 `metadata.locales.en: en.md` 声明同目录英文译本；英文文件保留完整 frontmatter，`name` 必须相同，`description` 非空且不超过 1024 字符。译本文件名使用小驼峰 `.md`，不允许目录路径、符号链接或越界文件。保持唯一准确大写的 `SKILL.md`，兼容现有扫描和安装协议。
- `apps/server/src/utils/skills/localize.ts` 使用请求语言上下文选择译本；不修改服务进程全局语言，也不联网翻译。
- `apps/server/src/agent/skills/index.ts`、`routes/agent/skills.ts`、`routes/skills/get.ts` 共用选择规则；技能目录仍保持工作区同名优先和全局启停规则。
- `apps/server/src/utils/skills/files.ts` 管理当前语言主文件及两个入口的写入/移动保护；`utils/mcp/resources.ts` 使用相同译本。
- `apps/web/src/components/agent/skillMenu.vue` 监听语言及项目变化，清空旧列表并取消旧请求，避免旧语言响应覆盖新结果；`components/settings/panels/pluginMarket/index.vue` 刷新已安装列表。
- MCP 双语入口位于 `packages/mcp/skills/toonflow/`，服务端下载路由和 MCP 构建导出同步维护。
- 3 个用户指定的第三方入口译本位于 `packages/skillLocales/`，随服务复制到 `build/skillLocales/`；保留原包参考资料与许可证。目录映射、部署合并及上游更新注意事项见 [译本说明](../../packages/skillLocales/readme.md)。

## 安装与更新

内置 Skill 仍遵守原有首次补入、保留用户修改的安装策略；本次没有把启动改成强制覆盖已有技能。新部署使用当前构建包即可。既有部署需要更新对应 Skill 包，或在核对原版、保留备份后同步；仅替换源码不代表数据目录已更新。中英文入口版本需同步递增。

本次验证和未验证边界见 [变更记录](changes/skillLanguages20261113.md)。

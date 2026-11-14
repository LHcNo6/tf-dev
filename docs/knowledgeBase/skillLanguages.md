# Skill 名称、描述与语言选择

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

## 应用导向名称与描述

2026-11-14 起，上述 12 个 Skill 的中英文展示名以用户要完成的任务命名，描述按「什么时候使用、交付什么、与相邻技能的边界」组织。界面显示 `metadata.displayName`，Agent 发现与 `skillOperator` 列表主要依赖技术 `name` 和 `description`，因此触发条件、时长、模型及是否生成媒体必须写在描述中，不能只放在展示名或正文里。技术标识、目录和 `/skill:name` 命令保持兼容；正文仅同步主标题，执行规则与授权要求不变。

| 技术 name | 中文展示名 | 选择依据 |
| --- | --- | --- |
| `canvas` | 画布节点搭建与整理 | 操作画布和节点结构 |
| `workflow` | 创意与剧本转视频 | 从创意、小说或剧本制作视频片段，或继续、修改已有项目 |
| `longVideoWorkflow` | 长视频分段制作与合成 | 超过 30 秒或已有多段视频的续作、修订与合成 |
| `petShortVideo` | 宠物带货短视频制作（30 秒内） | 实际制作单条宠物带货短片；明确选用时也支持无商品短片 |
| `petCommercePrompt` | 宠物带货脚本与提示词 | 宠物带货创作，只交付文字 |
| `petCommercePromptSd25` | 宠物带货脚本与提示词（Seedance 2.5） | Seedance 2.5 宠物带货创作及长视频单段定稿，只交付文字 |
| `v118workflow` | 小说改编与分集视频制作 | 按集改编、逐阶段确认与分集画布归档 |
| `videoPromptAdapter` | 视频方案转模型提示词 | 将已有方案按确切模型版本和输入模式适配为提示词 |
| `videoPrompting` | 视频与角色参考图提示词编写 | 编写多模型视频提示词或角色三视图、身份参考板提示词 |
| `seedance` | 即梦视频与参考图提示词（Seedance） | Seedance 2.0/2.5 视频及配套参考图提示词；可选 CLI 执行仍须工具和授权 |
| `sd25-pe` | Seedance 2.5 生成、编辑与延长提示词 | Seedance 2.5 新生成、编辑、延长的提示词，只交付文字 |
| `lengyi-seedance25-prompt` | 故事转多镜头提示词（Seedance 2.5） | 故事扩写为通常 20–30 秒、最长 30 秒的多镜头提示词 |

9 个内置技能的中英文 `metadata.version` 同步递增补丁版本。3 个第三方译本保留上游标识和版本字段，不把本地文案调整冒充上游升级。后续部署仍按上节保留用户修改的安装策略处理，不能只修改源码就认为当前数据目录已更新。

此次同步、验证和未验证边界见 [应用导向命名变更记录](changes/skillNaming20261114.md)。

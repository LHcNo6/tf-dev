# 图片指令库

[返回知识库](readme.md)

## 当前行为

首页左栏「指令库」打开 `/#/home?view=imageCommands`。首版共 24 条中文指令，通用与宠物各 12 条；提供搜索、范围与分类筛选、效果说明、参考要求、保持项、建议画幅和完整提示词。卡片展示原创宠物及用品效果预览，详情展示完整图片；图片用于说明创作方向，不是实际商品或身份保持能力的证明。

| 分类 | 指令 |
| --- | --- |
| 基础摄影 | `/whiteBackground`、`/premiumShowcase`、`/flatLay`、`/macro`、`/studioLight`、`/bokeh`、`/goldenHour` |
| 通用风格 | `/watercolor`、`/oilPainting`、`/lineArt`、`/paperCraft`、`/pixelArt` |
| 宠物形象 | `/petAvatar`、`/pet3d`、`/petChibi`、`/petFigure` |
| 宠物材质与表情 | `/petPlush`、`/petFelt`、`/petSticker` |
| 宠物生活 | `/petDaily`、`/petCamping`、`/petBirthday` |
| 宠物内容与带货 | `/petCover`、`/petProduct` |

效果方向参考 [Xavvi 图片指令库](https://ai.xavvi.com/image-commands)，按基础需求和宠物身份保持要求重写提示词，没有复制其预览图。数据保留参考方向的来源映射；新增效果维护同一数据源即可，不必新建 Skill 或模型工具。

详情支持复制提示词、复制命令和「填入草稿」。填入时切回首页，插入 `/id ` 前缀并保留已有正文、附件，不自动发送；草稿附近显示已选效果的参考要求。首页输入 `/` 或点击书本按钮可选择图片指令；项目聊天的同一菜单同时提供图片指令与现有 `/skill:name`，运行期间仅提供图片指令用于后续排队/引导。支持方向键、Enter、Tab 和 Escape。

## 上下文与调用边界

- 指令由独立 `GET /api/imageCommands` 接口供网页使用，不注册到 Skill、`skillOperator`、MCP 资源或系统提示。未使用时，名称、描述和正文不会因本功能自动进入 Agent 上下文。
- 只有网页真人请求设置内部 `manualImageCommands` 标记。MCP `runAgent`、内部子 Agent 任务和 Agent 间消息不设置该标记，不展开预设。此标记不加入 MCP 或工具参数。
- 消息开头的 `/id` 必须大小写一致且后接空白或结束；展开时保留后续补充的引号和换行。普通正文中的命令、代码块、`/Users/...` 路径不展开。未知短命令由网页入口在建立模型流前返回 HTTP 400。`/skill:name` 沿用现有 Skill 路径。
- 首条消息在 SDK `message_start` 阶段展开；真人入队消息用消息对象的 WeakSet 标记，在消费或停止保存时展开，再拼接已有引导说明。展示元数据保留原始短命令，SDK 历史保存单条展开正文。队列模式转换保留标记。
- 未附带其他指令的目录或正文；已使用的单条正文会成为历史上下文，后续轮次仍可能携带。这里控制自动载入，不是额外的工具访问权限隔离。
- 预设不改变算力授权和工具权限；默认一张、不自动追加或重试。真实参考、用户要求和模型能力优先；只要文字的请求不要求实际生图。

## 实现与扩展

服务端 `lib/imageCommands.ts` 维护数据及展开，`imageCommandTypes.ts` 通过包 exports 向 Web 提供纯类型；`routes/imageCommands.ts` 提供网页接口，`routes/agent.ts` 标记真人请求，`agent/runtime/{index,delivery}.ts` 处理入队来源与实际投递。新增路由须运行 `bun run routes`。

Web `lib/imageCommands.ts` 共享加载状态，合并并发加载，失败可重开重试。`pages/home/{index,imageCommands}.vue` 提供入口和草稿衔接，`components/agent/skillMenu.vue` 与 `conversation/messageInput.vue` 复用菜单及富文本插入。首版内容为中文，不等同于 Skill 内容的双语支持。

预览图片放在 `apps/web/src/assets/imageCommands/<id>.webp`，由页面构建时引入，不加入指令接口或 Agent 上下文；新增同名图片即可接入卡片与详情。网页使用 640px WebP、卡片懒加载与异步解码，保留完整主体；没有图片的新增指令显示分类图标。原图、模型、提示词与处理方式见[预览图变更记录](changes/imageCommandPreviews20261114.md)。

修改数据后构建并重启 Server；修改页面后构建 Web，刷新或重启开发服务。没有持久化格式迁移；移除入口、接口及展开逻辑即可撤回，已保存历史中的正文保持原样。

## 验证边界

2026-11-14：Web/Server 类型检查与构建通过，5173 开发服务及 3000 构建版服务已重启。两个浏览器入口均显示 24 条；构建版数据接口返回 24 条，Skill 接口仍是现有 12 条、没有图片指令。搜索、筛选、详情、复制反馈、填入草稿、原正文/路径保留、斜杠键盘选择和项目菜单已实际操作。查看了常规桌面、960px 宽桌面及 200% 等效布局视口截图，短视口详情正文滚动、底部操作可见。

本地展开验证覆盖已知/未知指令、普通消息、代码块、绝对路径、`/skill:` 和补充中的换行/引号；构建版未知命令 HTTP 400 已实际验证。SDK 投递顺序、停止保存和重发经过源码核对，未完成真实模型响应下的排队、引导、停止/重发及附件/提及组合验收。

首版网页交付时没有真实付费生图、生成效果、桌面端或移动端验收。一次拟进行的外部模型文字验收被自动审批拒绝，原因是可能披露未经授权的工作区上下文；该请求未执行。详见[首版变更记录](changes/imageCommands20261114.md)。随后按用户授权，使用配置的安泰信 MCP 为网页制作原创预览图，实际结果及边界见[预览图变更记录](changes/imageCommandPreviews20261114.md)；这不等同于通过应用 Agent 执行全部预设的端到端验证。

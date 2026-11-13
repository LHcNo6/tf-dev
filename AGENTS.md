# 开发文档索引

- 当前开发以 Web 端为主，按需求处理 Web 所需的服务端和共享代码；除非用户明确要求，暂不修改、构建、打包、安装或启动桌面端和移动端。
- 所有仓库工作：先阅读并遵守 [开发规范](docs/developmentRules.md)。
- 开发 Tools、Nodes、Skill 插件及交付发布：阅读 [插件开发指南](docs/pluginDevelopment.md)。
- 源码运行、构建与桌面打包：阅读 [开发与构建文档](docs/development.md)；本机环境参见 [本地开发说明](LOCAL_DEVELOPMENT.md)。
- 功能开发和修复：先查阅[项目知识库](docs/knowledgeBase/readme.md)及相关主题；维护视频尾帧时阅读[视频尾帧维护说明](docs/knowledgeBase/videoLastFrame.md)。

# 功能交付要求

- 推送到任何远程仓库前，必须获得用户明确批准；本地提交不视为推送批准。
- 每次完成新增功能或修复，包括小功能和小修复，按[知识库维护规则](docs/knowledgeBase/readme.md)新增一篇本次变更记录，并更新受影响的主题维护文档及索引；记录实际行为、关键实现、验证结果和未验证边界。
- 每次完成功能修改后，构建并同步受影响的开发产物，自动重启相关本地开发服务，验证网页和更新后的产物可访问，提供刷新地址；如运行中的任务、端口冲突或其他条件阻止安全重启，保留现场并说明原因及未完成项。

## Agent skills

### Issue tracker

工程议题和规格使用本地 Markdown 管理。参见 `docs/agents/issueTracker.md`。

### Triage labels

议题使用默认分流状态。参见 `docs/agents/triageLabels.md`。

### Domain docs

采用单一领域文档布局。参见 `docs/agents/domain.md`。

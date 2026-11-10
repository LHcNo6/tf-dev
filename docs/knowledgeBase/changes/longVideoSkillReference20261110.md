# 长视频跨技能资料读取修复

日期：2026-11-10。

一次长视频自动模式会话中，Agent 使用 `name=longVideoWorkflow` 读取 `references/stateAndDelivery.md`，返回 ENOENT 并误报规则缺失。该文件实际属于 `workflow`。本次在长视频技能中明确目标技能、实际发现的作用域及相对路径，并要求读取失败时先核对参数重试；保留真实缺失时暂停、自动模式范围授权和能力核验规则。原因已证实为此次工具调用选错技能；模型为何选错无法确定。

实现见 `packages/skills/longVideoWorkflow/SKILL.md`，主题见[视频合成](../videoComposition.md)。技能源码及开发构建、安装副本需同步；已有会话须重新读取技能。无需迁移数据。

验证：通过真实 `skillOperator` 和服务端技能上下文，以原参数复现 ENOENT，以 `name=workflow` 成功读取同一路径；检查源码、构建和安装副本一致，网页可访问。此为指令修复，未重新运行模型验证其行为，也未进行付费视频生成、配音或合成。开发服务有用户浏览器连接，为避免中断当前会话未重启。

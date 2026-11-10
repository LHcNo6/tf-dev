# 精简生成节点配置回执

Status: ready-for-human

## 问题与目标

图片和视频生成节点多次查询或修改配置时，反复将全部模型能力发送给 Agent。默认只返回当前配置和所选模型的完整能力；选模型时按需查询目录，保留实际模型能力校验和生成前授权复核。

## 行为与验收

- 图片和视频的 `node:getConfig` 接受可选布尔值 `includeModels`。默认返回 `config` 与 `selectedModel`；视频还返回 `ratios` 和随实际输入计算的 `matchingModes`。`includeModels: true` 额外返回完整 `models`。
- `node:setConfig` 和视频 `node:setFirstFrameBinding` 返回精简结果。所选模型不可用时 `selectedModel` 为 `null`；视频配置保留首帧绑定、路径及错误信息。
- 内置技能按节点实际 schema 查询；选型和查替代模型时才查询完整目录。旧插件沿用实际接口，不以缺失字段推断能力。
- 验证查询、设置、模型切换、首帧绑定和清除、非法规格与模式、无效模型，以及真实画布交互和保存重开。无需启动媒体生成。
- 更新维护说明与索引，类型检查、构建并同步受影响产物，安全重启服务并报告真实验证边界；不覆盖现有未提交改动。

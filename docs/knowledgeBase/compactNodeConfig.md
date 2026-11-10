# 生成节点配置回执

## 背景

宠物短视频和长视频的两次制作记录中，16 次配置工具回执共约 17.2 万字符，绝大部分是重复的模型目录。生成节点需要保留所选模型的真实能力和配置核验信息，但常规读回不需要反复携带其他模型的能力，因此改为按需读取完整目录。按历史回执推算，精简后字符数约减少 85%；这是静态估算，不代表实际 Token、延迟或费用的变化。

## 行为

图片、视频生成节点的 `node:getConfig({includeModels?: boolean})` 默认返回 `config` 和 `selectedModel`；视频还返回 `ratios`、当前输入对应的 `matchingModes`。`selectedModel` 是所选模型的完整能力声明；不可用时为 `null`。仅 `includeModels: true` 增加完整 `models` 目录。`node:setConfig` 和视频的 `node:setFirstFrameBinding` 返回同样的精简信息，首帧绑定、路径及错误仍在 `config` 中。

选择或更换模型前按节点实际 schema 获取完整目录；日常和授权后的配置复核读取精简结果，仍须核对实际提示词、配置、连接、引用及调用前输出。旧插件可能没有 `includeModels` 和 `selectedModel`，应按其真实 schema 与结果读取。新接口改变了空参数回执，依赖 `models` 的调用方须显式请求目录。

调用示例中的参数传给画布工具 `nodeTools` 的 `args`：

| 场景 | 节点函数与参数 | 应核对的信息 |
| --- | --- | --- |
| 首次选型或查询替代模型 | `node:getConfig`，`{ "includeModels": true }` | `models` 中可用模型的实际能力 |
| 日常读回或授权后复核 | `node:getConfig`，`{}` | `config`、`selectedModel`，视频还需检查 `matchingModes` |
| 修改配置或绑定首帧后 | `node:setConfig` / `node:setFirstFrameBinding` 的实际参数 | 精简回执中的生效配置、所选模型及视频首帧信息 |

`selectedModel` 为 `null` 时不能推断能力或据此自动更换模型；先检查可用目录及用户选择。模型能力和输入匹配模式不替代实际提示词、引用来源与已授权方案的逐项核对。

## 实现

图片与视频生成节点各自在原有 `getConfig` 中组织返回值，选中的能力仍来自节点已加载模型；`models` 仅在请求时附加。修改配置和首帧绑定仍执行原有校验，不新增模型缓存、生成接口或后台任务。实现分别位于 [图片生成节点](../../packages/nodes/imageGenerationNode/src/index.vue) 和 [视频生成节点](../../packages/nodes/videoGenerationNode/src/index.vue)；[画布执行规则](../../packages/skills/workflow/references/canvasExecution.md)及其他内置技能说明了新旧接口的使用。需求和验收范围见[本地规格](../localIssues/compactNodeConfig/spec.md)，生成等待机制见[图片与视频生成等待维护](generationWaiting.md)。

## 验证状态

2026-11-10 本地验证：

- 全仓 `bun run typecheck` 通过；图片、视频生成节点构建通过，以 `NODE_ENV=dev` 同步至 `data/nodes`，并与构建结果逐字节核对一致。五个受影响技能的主文件及修改过的引用文件已与安装副本核对一致。
- 在 `videoComposeQA` 工作区的“配置回执验证”隔离画布中加载真实节点，直接调用节点注册函数：图片与视频的默认查询、显式全量查询、空配置修改和模型切换均返回预期字段；两种查询返回的所选模型能力一致。实际图片回执分别为 811 和 10067 字符，视频默认模型分别为 408 和 11475 字符；这不等于实际 Token 或费用节省。
- 实际节点拒绝不存在的模型、非法图片尺寸、视频时长和分辨率、与输入不匹配的模式；失败后原配置未变。在隔离节点临时指定不存在的模型时，`selectedModel` 为 `null`，原选择未被替换。
- 在画布上传已有图片并连接视频节点，验证首帧绑定、读回、无效来源拒绝和清除；临时改变来源后回执包含 `firstFrameError`。拖动两个生成节点，在视频设置中将分辨率改为 720p，并验证画布重开后节点位置、连线和先前首帧绑定保留。
- 页面和服务均返回 HTTP 200；节点接口返回两个 2.0.2 插件且无加载错误，节点文件接口可访问，技能接口返回更新版本。

所有已有 Agent 会话的 `running` 均为 false；但本机仍有其他用户持有的浏览器页面连接开发服务，浏览器内的媒体合成状态无法从服务端完整核实，因此未自动重启前后端，避免中断可能的任务。请在确认相关页面空闲后重启服务；当前服务已可读取更新节点和技能。未启动真实媒体生成，未验证实际 Token、延迟及费用变化，也未覆盖桌面端和全部节点控件。

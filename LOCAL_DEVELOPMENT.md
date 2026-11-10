# Toonflow 二次开发工作区

本仓库基于官方 `v2.0.8` 标签，提交 `af6e884c3d8cda353acaf8ef13aea8ea754a4afd`。本机安装包自报版本 2.0.8；尚未证明该标签构建产物与安装包完全一致。当前分支 `local-development` 的改动尚未提交。

本机下载的 `macos-arm64-toonflow.dmg` SHA-256 为 `f89041dd8e3f23bc0a4591cd6c56ad6cf3bd54e54d0615a01175b7b51eb81daa`，与官方 v2.0.8 发布记录一致。这证明下载文件对应发布资产，不能单独证明当前安装包未被其他修改影响。

## 当前状态

- `apps/server/src/utils/media/generation.ts` 和 `origin.js`：迁入图片、视频、音频来源记录、视频引用 URL 复用及安泰信引用顺序处理。
- `apps/web/src/lib/canvasShortcuts.ts` 和 `apps/web/src/components/settings/panels/general/keyInput.vue`：迁入 macOS Option 滚轮默认值、显示名称和录制焦点修复。
- `packages/providers/src/media/antaixin.ts`：安泰信 4.1.1 适配器。应用初始化时仅在数据目录没有同名文件时安装；已有用户供应商不会被覆盖，未来更新需要显式处理现有文件。
- [安泰信媒体模型维护说明](docs/knowledgeBase/antaixinModels.md)：模型列表发现、数据目录更新方式、分类规则和未适配的生成能力。
- `packages/nodes/imageGenerationNode/src` 和 `packages/nodes/videoGenerationNode/src`：图片和视频参数面板的源码实现。`local-patches/nodes/` 保存原安装构建产物和历史脚本；脚本使用原工作区和应用的绝对路径，仅供研究，不应直接运行。
- `local-patches/web/`：当前已安装快捷键相关构建产物和补丁记录。
- `local-patches/backend/`：来源模块、后端补丁记录及安装时校验值。`installed.json` 中的路径和备份是原机器的历史记录，不是本仓库的安装指令。
- `local-patches/records/`：历史修复总结，其中相对链接指向原始交付目录，不属于此仓库。

已完成 Web、服务端和节点构建及类型检查，隔离实例确认供应商加载、图片参数摘要和视频比例保存恢复。尚未重新打包 macOS 应用、进行 WebKit 实机验收或使用真实 API 付费生成；不要把这些检查视为完整生产验收，也不要直接覆盖现有应用或数据。

仓库源码和补丁快照不包含用户设置、API Key、画布或生成资产。开发时生成的 `data/` 是隔离数据且不纳入 Git。原安装和备份保持原位。先前测试记录描述的是当时安装版的验证，不代表当前源码构建已通过同样测试。

来源模块离线检查：`node --test local-patches/origin.test.mjs`。
其余历史测试文件使用原路径或原构建产物，需要先检查和调整后才能作为本仓库的回归测试。

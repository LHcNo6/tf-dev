# 外观与品牌

[返回知识库](readme.md)

## 当前行为

产品展示名称为“无限画布”。Web 首页、引导页、加载页、Agent 和设置中使用新名称与图标；首页侧栏不再提供 GitHub 按钮。“关于”中的上游仓库链接仍保留实际来源名称和地址。

未保存外观配置时默认使用浅色、雾蓝 `#5477a6` 和 12px 基础圆角。已保存的主题、颜色与圆角继续生效。默认雾蓝在深色主题中使用更浅的显示色，显式配置的其他主题颜色仍按用户选择显示；主题、颜色及圆角仍可在界面设置中调整。

首页保留原有布局和点阵动画，浅色模式使用蓝灰色背景及更柔和的卡片边界。卡片悬停、按钮按下与键盘焦点有相应反馈，并遵循减少动态效果的系统设置。

## 维护位置

- `packages/assets/logo.svg` 是带底板的品牌图标，`logoMark.svg` 是无底板轮廓，首页点阵、加载描边和 Agent 蒙版使用后者。两者形状应同步维护。
- `apps/web/src/pages/home/bg.vue` 先将 SVG 绘制到离屏画布再裁剪，避免部分 Chromium 对 SVG 源区域裁剪产生空白。
- 默认设置位于 `apps/web/src/stores/settings.ts`；深色默认显示色由 `apps/web/src/App.vue` 派生；首页样式位于 `apps/web/src/pages/home/index.vue`。
- macOS 图标集、Windows 图标及原生启动动画分别位于 `packages/assets/logo.iconset/`、`packages/assets/logo.ico`、`packages/startup/assets/startup.json`。
- Android 的应用显示名位于 `apps/mobile/native/manifest.xml`，构建时复用同一图标集；包标识不变。Windows 安装器使用新的显示名称和快捷方式名，已有旧快捷方式不会在升级时主动删除。
- 品牌显示文案覆盖 Web、桌面窗口和常见服务端提示；协议、工作区文件标记、包名、安装身份、更新地址及上游仓库来源仍使用其原有标识，以维持兼容。

具体验证范围和未验证项见 [本次变更记录](changes/infiniteCanvasAppearance20261113.md)。

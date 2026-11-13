# 画布菜单图标与开关状态

日期：2026-11-13

添加节点菜单放大既有节点图标、调整图标间距和圆角焦点样式。素材库、地图、网格吸附和连线开关在开启时显示主题色底色与边界；缩放菜单打开时同样显示状态。画布与文档切换选中项增加轻微阴影。菜单图标仍由各节点提供，节点和开关行为保持原有逻辑。

实现位于 `apps/web/src/pages/workspace/panels/canvas/components/nodeMenuItems.vue`、`canvasControls.vue` 和 `apps/web/src/pages/workspace/index.vue`；维护入口见[外观与品牌](../appearanceAndBrand.md)。

验证：Web 构建、类型检查通过，构建预览和重启后的 Web 页面返回 HTTP 200；浏览器中查看了节点菜单和已开启的连线状态，切换并恢复网格吸附，重启后项目画布可加载。构建有大体积分包提示。

未逐一验证全部节点图标、深色主题和其他浏览器。

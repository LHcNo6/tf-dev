# 工作区切换

[返回项目知识库](readme.md)

画布左上角的项目名称仍可直接编辑；名称旁的下拉按钮列出首页已保存的项目，按最近打开时间排序，当前项目带勾选标记。鼠标停在条目上可查看目录路径。选择其他项目会在当前页面切换；列表仅包含已有项目，不负责添加目录。

切换由 `apps/web/src/pages/workspace/index.vue` 协调：画布操作繁忙时阻止切换，先保存已打开的文档和所有画布，再通过 `workspaceStore.openProject` 校验目标目录并更新当前项目。保存或目录校验失败时显示错误并保留当前项目。下拉界面位于 `apps/web/src/pages/workspace/panels/canvas/components/canvasMenu.vue`，项目列表和最近打开时间由 `apps/web/src/stores/workspace.ts` 管理。

实际切换会卸载原工作区的画布与文档实例并加载新工作区；正在进行的生成或其他跨工作区操作应先完成。首次记录的验证和限制见[工作区快速切换变更记录](changes/workspaceSwitch20261110.md)。

# 本地议题管理

规格和议题保存在 `docs/localIssues/`。

- 每项功能一个小驼峰目录：`docs/localIssues/<feature>/`。
- 规格文件为该目录下的 `spec.md`。
- 实施议题放在 `issues/` 下，每项一个小驼峰 Markdown 文件；在文件中记录编号。
- 在文件开头用 `Status:` 记录分流状态，状态定义见 `triageLabels.md`。
- 讨论和补充记录追加到文件底部的 `## Comments`。
- Skill 要求发布到 issue tracker 时，创建对应本地文件。
- Skill 要求读取议题时，读取用户指定的本地文件。

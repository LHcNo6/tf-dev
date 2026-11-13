import { parseFrontmatter, type Skill } from "@earendil-works/pi-coding-agent";
import { lstatSync, readFileSync, realpathSync } from "@toonflow/file";
import { dirname, join } from "node:path";
import { getLocale, t } from "@/lib/i18n";

function getMetadata(frontmatter: Record<string, unknown>) {
  return frontmatter.metadata && typeof frontmatter.metadata === "object" && !Array.isArray(frontmatter.metadata)
    ? frontmatter.metadata as Record<string, unknown> : {};
}

export function localizeSkill(skill: Skill) {
  const { frontmatter } = parseFrontmatter(readFileSync(skill.filePath, "utf8"));
  const metadata = getMetadata(frontmatter);
  // ACT: 只选择技能显式提供的离线译本；自定义技能没有译本时保留原文。
  const locales = metadata.locales;
  const english = locales && typeof locales === "object" && !Array.isArray(locales) ? (locales as Record<string, unknown>).en : undefined;
  if (english !== undefined && (typeof english !== "string" || !/^[a-z][a-zA-Z0-9]*\.md$/.test(english))) throw new Error(t`技能路径无效`);
  const manifestPaths = [skill.filePath, ...(typeof english === "string" ? [join(skill.baseDir, english)] : [])];
  let filePath = skill.filePath;
  let localized = frontmatter;
  if (!getLocale().startsWith("zh") && english !== undefined) {
    filePath = manifestPaths[1]!;
    if (!lstatSync(filePath).isFile() || dirname(realpathSync(filePath)) !== realpathSync(skill.baseDir)) throw new Error(t`技能路径无效`);
    localized = parseFrontmatter(readFileSync(filePath, "utf8")).frontmatter;
    if (localized.name !== skill.name || typeof localized.description !== "string" || !localized.description.trim() || localized.description.length > 1024) {
      throw new Error(t`SKILL.md 必须包含合法 YAML、与原技能相同的字符串 name，以及非空且不超过 1024 字符的 description`);
    }
  }
  const displayName = getMetadata(localized).displayName;
  return {
    ...skill,
    filePath,
    manifestPaths,
    description: localized.description as string,
    displayName: typeof displayName === "string" && displayName.trim() ? displayName : skill.name,
  };
}

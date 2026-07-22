import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export function creatorInstallPaths({
  platform = process.platform,
  env = process.env,
  home = os.homedir(),
} = {}) {
  const codexRoot = env.CODEX_HOME || path.join(home, ".codex");
  const enginePlatform = platform === "win32" ? "windows" : "macos";
  return {
    codexRoot,
    skillRoot: path.join(codexRoot, "skills", "codex-theme-creator"),
    creatorRoot: path.join(codexRoot, "codex-theme-creator"),
    platformEngineRoot: path.join(codexRoot, "codex-theme-creator", "engine", enginePlatform),
  };
}

export async function provisionCreatorSkill({ sourceRoot, platform = process.platform, env = process.env, home } = {}) {
  if (!sourceRoot) throw new Error("Creator source root is required");
  const paths = creatorInstallPaths({ platform, env, home });
  const skillSource = path.join(sourceRoot, "skills", "codex-theme-creator");
  const engineSource = path.join(sourceRoot, "engine");
  await Promise.all([fs.access(path.join(skillSource, "SKILL.md")), fs.access(engineSource)]);
  await fs.mkdir(paths.skillRoot, { recursive: true });
  await fs.mkdir(paths.creatorRoot, { recursive: true });
  await fs.cp(skillSource, paths.skillRoot, { recursive: true, force: true });
  await fs.cp(skillSource, path.join(paths.creatorRoot, "skill"), { recursive: true, force: true });
  await fs.cp(engineSource, path.join(paths.creatorRoot, "engine"), { recursive: true, force: true });
  return paths;
}

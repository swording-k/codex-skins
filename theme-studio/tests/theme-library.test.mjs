import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  createStudioTheme,
  discoverThemes,
  normalizeStudioSettings,
  resolveThemeDirectory,
  updateStudioTheme,
} from "../lib/theme-library.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../..");

const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "codex-theme-studio-"));
const themesRoot = path.join(tmpRoot, "themes");
await fs.mkdir(themesRoot, { recursive: true });

const themes = await discoverThemes({ repoRoot, themesRoot });
assert.ok(
  themes.some((theme) => theme.id === "preset-porsche-gt3rs" && theme.source === "preset"),
  "discovers bundled Porsche GT3 RS preset",
);
assert.ok(
  themes.some((theme) => theme.id === "preset-rainforest-focus" && theme.profile === "glass-studio"),
  "keeps preset UI profile in theme summary",
);

assert.throws(
  () => resolveThemeDirectory(themesRoot, "../escape"),
  /Invalid theme id/,
  "rejects traversal-like theme ids",
);

const normalized = normalizeStudioSettings({
  accent: "#12abef",
  backgroundBlur: 99,
  backgroundDim: -1,
  homeOpacity: 3,
  taskOpacity: -4,
  motionEffect: "gt",
  motionIntensity: 8,
  rain: true,
  telemetry: true,
  signalLights: true,
});
assert.equal(normalized.backgroundBlur, 24, "clamps blur");
assert.equal(normalized.backgroundDim, 0, "clamps dim");
assert.equal(normalized.homeOpacity, 1, "clamps home opacity");
assert.equal(normalized.taskOpacity, 0, "clamps task opacity");
assert.equal(normalized.motionIntensity, 1, "clamps motion intensity");
assert.equal(normalized.accent, "#12abef", "accepts valid accent color");

const created = await createStudioTheme({
  baseThemeDir: path.join(repoRoot, "dream-skin", "preset-porsche-gt3rs"),
  themesRoot,
  name: "My GT Night",
  settings: {
    accent: "#2ad4ff",
    backgroundBlur: 9,
    backgroundDim: 0.36,
    homeOpacity: 0.46,
    taskOpacity: 0.91,
    motionEffect: "gt",
    motionIntensity: 0.72,
    rain: true,
    telemetry: true,
    signalLights: true,
  },
});
const written = JSON.parse(await fs.readFile(path.join(created.themeDir, "theme.json"), "utf8"));
assert.equal(written.name, "My GT Night");
assert.equal(written.ui.routes.home.opacity, 0.46);
assert.equal(written.ui.routes.task.opacity, 0.91);
assert.equal(written.colors.accent, "#2ad4ff");
assert.equal(written.motion.profile, "gt-broadcast");
assert.equal(written.motion.rain, true);
assert.equal(written.motion.telemetry, true);
assert.equal(written.studio.effects.backgroundBlur, 9);
assert.equal(written.studio.effects.backgroundDim, 0.36);
await fs.access(path.join(created.themeDir, written.image));

const updated = await updateStudioTheme({
  themeDir: created.themeDir,
  name: "My GT Night Tuned",
  settings: {
    accent: "#ffcc00",
    backgroundBlur: 2,
    backgroundDim: 0.1,
    homeOpacity: 0.62,
    taskOpacity: 0.78,
    motionEffect: "rain",
    motionIntensity: 0.33,
  },
});
assert.equal(updated.theme.id, created.id, "updates keep the existing local theme id");
assert.equal(updated.theme.name, "My GT Night Tuned");
assert.equal(updated.theme.colors.accent, "#ffcc00");
assert.equal(updated.theme.motion.profile, "rainforest");
assert.equal(updated.theme.motion.intensity, 0.33);
const rewritten = JSON.parse(await fs.readFile(path.join(created.themeDir, "theme.json"), "utf8"));
assert.equal(rewritten.ui.routes.home.opacity, 0.62);
assert.equal(rewritten.studio.effects.backgroundBlur, 2);

console.log("PASS: theme studio library creates safe customized local themes.");

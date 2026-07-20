import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const publicRoot = path.resolve(here, "..", "public");
const html = await fs.readFile(path.join(publicRoot, "index.html"), "utf8");
const app = await fs.readFile(path.join(publicRoot, "app.js"), "utf8");

for (const removedControl of ["motionEffect", "motionIntensity", "signalLights", "telemetry", "rain"]) {
  assert.equal(html.includes(`name="${removedControl}"`), false, `${removedControl} should not be exposed in the MVP UI`);
}

for (const requiredControl of ["backgroundBlur", "backgroundDim", "homeOpacity", "taskOpacity", "accent"]) {
  assert.ok(html.includes(`name="${requiredControl}"`), `${requiredControl} remains available`);
}

assert.match(html, /让 Codex 创作新主题/, "app has a clear Codex creation entry");
assert.match(html, /id="themePreview"/, "app has an in-app theme preview");
assert.match(html, /用户主题放哪里/, "app explains where user-created themes live");
assert.match(app, /copyCreatePrompt/, "creation entry copies the Codex prompt");
assert.match(app, /applyLocalPreview/, "sliders update the in-app preview immediately");
assert.match(app, /--preview-bg-blur/, "preview uses the same blur setting as the theme package");
assert.match(app, /--preview-home-opacity/, "preview uses the home opacity slider");

console.log("PASS: theme studio UI exposes only working MVP controls.");

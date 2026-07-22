import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const skill = await fs.readFile(path.resolve(here, "../SKILL.md"), "utf8");

assert.match(skill, /macOS and Windows/, "Skill describes both supported desktop platforms");
assert.match(skill, /\$env:APPDATA/, "Skill gives Windows agents the real theme library path");
assert.match(skill, /switch-theme-windows\.ps1/, "Skill tells Windows agents how to activate the created package");
assert.match(skill, /switch-theme-macos\.sh/, "Skill keeps the macOS activation path");
assert.match(skill, /verified/, "Skill preserves explicit real-interface verification evidence");

console.log("PASS: creator Skill drives complete theme creation on macOS and Windows.");

import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const installer = await fs.readFile(
  path.resolve(here, "../../../scripts/install-enhanced-runtime.sh"),
  "utf8",
);

assert.match(
  installer,
  /for file in injector\.mjs stage-theme\.mjs/,
  "hot runtime installation must update both payload validation and theme staging",
);

console.log("PASS: enhanced runtime hot install covers every schema-v2 switch component.");

const restoreScript = path.resolve(here, "../../../scripts/restore-enhanced-runtime.sh");
const home = await fs.mkdtemp(path.join(os.tmpdir(), "codex-theme-restore-"));
try {
  const installRoot = path.join(home, ".codex", "codex-dream-skin-studio");
  await fs.mkdir(path.join(installRoot, "assets"), { recursive: true });
  await fs.mkdir(path.join(installRoot, "scripts"));
  for (const [section, name] of [
    ["assets", "dream-skin.css"],
    ["assets", "renderer-inject.js"],
    ["scripts", "injector.mjs"],
    ["scripts", "stage-theme.mjs"],
  ]) {
    const file = path.join(installRoot, section, name);
    await fs.writeFile(file, "enhanced");
    await fs.writeFile(`${file}.apex-original`, `original-${name}`);
  }
  execFileSync("/bin/bash", [restoreScript], { env: { ...process.env, HOME: home } });
  assert.equal(await fs.readFile(path.join(installRoot, "assets", "dream-skin.css"), "utf8"), "original-dream-skin.css");
  assert.equal(await fs.readFile(path.join(installRoot, "scripts", "stage-theme.mjs"), "utf8"), "original-stage-theme.mjs");
} finally {
  await fs.rm(home, { recursive: true, force: true });
}

console.log("PASS: enhanced runtime restore reinstates every backed-up component.");

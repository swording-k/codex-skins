import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(here, "..");
const packageJson = JSON.parse(await fs.readFile(path.join(appRoot, "package.json"), "utf8"));
const main = await fs.readFile(path.join(appRoot, "main.mjs"), "utf8");
const repoRoot = path.resolve(appRoot, "..");

assert.equal(packageJson.name, "codex-theme-creator-app");
assert.equal(packageJson.main, "main.mjs");
assert.ok(packageJson.scripts.start.includes("electron"), "desktop app can be launched with npm start");
assert.ok(packageJson.devDependencies.electron, "desktop app declares Electron");
assert.match(main, /startThemeStudioServer/, "desktop shell starts the embedded Theme Studio server");
assert.match(main, /BrowserWindow/, "desktop shell creates a native window");
assert.match(main, /Tray/, "desktop shell creates a macOS menu bar / Windows tray icon");
assert.match(main, /Menu\.buildFromTemplate/, "tray icon has a native context menu");
assert.match(main, /setContextMenu/, "tray menu is attached to the tray icon");
assert.match(main, /\/api\/themes/, "tray menu can read the local theme library");
assert.match(main, /\/api\/switch/, "tray menu can switch saved local themes");
assert.match(main, /event\.preventDefault\(\)/, "closing the window hides it to the tray instead of quitting");
await fs.access(path.join(repoRoot, "scripts", "start-theme-app.sh"));
await fs.access(path.join(repoRoot, "scripts", "start-theme-app.ps1"));

console.log("PASS: desktop app entry is packaged and starts Theme Studio.");

import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const windowsRoot = path.resolve(here, "..");

const common = await fs.readFile(path.join(windowsRoot, "scripts", "common-windows.ps1"), "utf8");
const start = await fs.readFile(path.join(windowsRoot, "scripts", "start-theme-windows.ps1"), "utf8");
const switcher = await fs.readFile(path.join(windowsRoot, "scripts", "switch-theme-windows.ps1"), "utf8");
const restore = await fs.readFile(path.join(windowsRoot, "scripts", "restore-theme-windows.ps1"), "utf8");

assert.match(common, /Get-AppxPackage/, "runtime discovers the Microsoft Store ChatGPT package");
assert.match(common, /Get-StoreCodexInstall/, "runtime validates the registered Microsoft Store Codex package");
assert.match(common, /IApplicationActivationManager/, "runtime uses the Windows package activation API for Store Codex");
assert.match(common, /ActivateApplication/, "runtime passes CDP launch arguments through application package activation");
assert.match(common, /OpenAI\.Codex/, "runtime targets the official Codex Store package identity");
assert.doesNotMatch(common, /[^\x00-\x7F]/, "Windows PowerShell runtime scripts remain ASCII-only for Windows PowerShell 5.1 compatibility");
const storeCheck = common.indexOf("Test-StorePackagedCodex -ExecutablePath $executable");
const storeLaunch = common.indexOf("Start-StoreCodexWithCdp -Port $Port", storeCheck);
const stopCall = common.indexOf("Stop-ChatGPTProcesses", storeCheck);
assert.ok(storeCheck >= 0 && stopCall > storeCheck && storeLaunch > stopCall, "Store Codex is closed before it is relaunched through package activation");
assert.match(common, /ChatGPT\.exe|Codex\.exe/, "runtime supports current and legacy executable names");
assert.match(common, /127\.0\.0\.1/, "runtime binds CDP to loopback only");
assert.match(common, /remote-debugging-address=127\.0\.0\.1/, "ChatGPT is launched with a loopback-only debugger");
assert.match(common, /ELECTRON_RUN_AS_NODE/, "the packaged Electron runtime launches the shared Node injector");
assert.match(common, /Codex Theme Creator\.exe/, "the installed controller provides a Node fallback before Codex has been opened");
assert.match(common, /\$process\.ExitCode -ne 0/, "Electron's successful Node mode is not mistaken for a missing PowerShell exit code");
assert.match(common, /Start-Process.+-Wait.+-PassThru/, "the Electron Node fallback is awaited before the staged theme is read");
assert.match(common, /Get-Content -LiteralPath \(Join-Path \$StageRoot "theme\.json"\) -Raw -Encoding UTF8/, "theme metadata is decoded as UTF-8 on Windows PowerShell 5.1");
assert.match(common, /Quote-ProcessArgument/, "detached injector arguments remain intact when install paths contain spaces");
assert.match(common, /stage-theme\.mjs/, "theme switching uses the shared stable package staging implementation");
assert.match(switcher, /StageThemePath/, "theme switching validates and stages a stable package snapshot");
assert.match(switcher, /--check-payload/, "theme switching validates the exact staged payload before publishing");
assert.match(restore, /--remove/, "restore removes injected DOM and CSS through the shared injector");
assert.doesNotMatch(restore, /Remove-Item.+themes/i, "restore never deletes the user's theme library");

console.log("PASS: Windows runtime contract covers discovery, injection, switching, and restore.");

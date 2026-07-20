import assert from "node:assert/strict";
import path from "node:path";

import { getPlatformConfig } from "../lib/platform.mjs";

const mac = getPlatformConfig({
  platform: "darwin",
  home: "/Users/alice",
  repoRoot: "/repo",
  env: {},
});
assert.equal(
  mac.themesRoot,
  path.join("/Users/alice", "Library", "Application Support", "CodexDreamSkinStudio", "themes"),
);
assert.equal(mac.canSwitch, true);
assert.equal(mac.switchScript, path.join("/repo", "engine", "macos", "scripts", "switch-theme-macos.sh"));

const win = getPlatformConfig({
  platform: "win32",
  home: "C:\\Users\\Alice",
  repoRoot: "C:\\repo",
  env: { APPDATA: "C:\\Users\\Alice\\AppData\\Roaming" },
});
assert.equal(
  win.themesRoot,
  path.win32.join("C:\\Users\\Alice\\AppData\\Roaming", "CodexDreamSkinStudio", "themes"),
);
assert.equal(win.canSwitch, false);
assert.match(win.switchUnavailableReason, /Windows/);

const linux = getPlatformConfig({
  platform: "linux",
  home: "/home/alice",
  repoRoot: "/repo",
  env: { XDG_DATA_HOME: "/home/alice/.local/share" },
});
assert.equal(linux.themesRoot, path.join("/home/alice/.local/share", "CodexDreamSkinStudio", "themes"));
assert.equal(linux.canSwitch, false);

console.log("PASS: theme studio platform adapter separates editable library from runtime switching.");

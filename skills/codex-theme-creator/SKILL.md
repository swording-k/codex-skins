---
name: codex-theme-creator
description: Create, repair, install, verify, and package complete macOS and Windows Codex Desktop themes from a text idea, one or more reference images, or both. Use when a user asks to design a Codex skin, make the whole Codex interface match a visual style, improve readability, install or switch a generated theme, or export a shareable theme package.
---

# Codex Theme Creator

Create a complete interface theme, not only a wallpaper. Preserve native Codex content and interaction while styling supported surfaces and adding bounded non-interactive decorations.

## Runtime

Detect the host OS before running commands.

macOS paths:

```bash
CREATOR_ROOT="${CODEX_HOME:-$HOME/.codex}/codex-theme-creator"
SHARED_ENGINE_ROOT="$CREATOR_ROOT/engine/macos"
THEMES_ROOT="$HOME/Library/Application Support/CodexDreamSkinStudio/themes"
```

Windows PowerShell paths:

```powershell
$CreatorRoot = Join-Path $HOME ".codex\codex-theme-creator"
$SharedEngineRoot = Join-Path $CreatorRoot "engine\macos"
$WindowsEngineRoot = Join-Path $CreatorRoot "engine\windows"
$ThemesRoot = Join-Path $env:APPDATA "CodexDreamSkinStudio\themes"
```

The compiler and injector in `engine/macos` are platform-neutral JavaScript. The Windows engine supplies process discovery, startup, switching, and restore. If the required paths are missing, ask the user to install or reopen Codex Theme Creator. Never close or restart Codex without explicit permission.

## Evidence

Track and report these states separately:

- `created`: the compiled theme package exists and validates.
- `installed`: the package exists in the platform theme library.
- `active`: the live runtime reports the expected theme ID.
- `verified`: real new-chat and existing-task views pass readability review.

Do not claim a later state from evidence for an earlier state.

## Workflow

### 1. Prepare

Infer a short name when the user omits one. Preserve every attached local image as a reference. Run the installed preparation script with the platform's normal `node` command:

```text
node <creator-root>/skill/scripts/prepare-theme.mjs
  --name <theme name>
  --idea <single-line visual direction>
  --output-dir <absolute output directory>
  --profile <optional gt-control|glass-studio|editorial>
  --reference <optional absolute image path>
```

Inspect supplied references before designing. A screenshot containing Codex UI is visual direction, not the injectable background.

Choose the interface language from the request:

- `gt-control`: racing, industrial, cyber, performance, gaming, and high-energy themes.
- `glass-studio`: forest, rain, mountain, lake, coding, calm, technology, and atmospheric themes.
- `editorial`: romantic, portrait, Japanese, fashion, soft, bright, and story-led themes.

Tune palette, route surfaces, radius, density, art placement, and approved decorations in `source-theme.json`.

### 2. Design and validate

Write a concise visual plan covering palette, native-control material, focal placement, home/task differences, decorations, motion, and readability. Use the installed image generation skill for normal background creation and ground it in every supplied reference.

Keep the left 52 percent low-detail, put the main visual on the right, and keep the lower center quiet. Use supported schema-v2 fields only. Do not add raw CSS, JavaScript, remote assets, or interactive decorations.

Run `compile-theme.mjs` and then `injector.mjs --check-payload --theme-dir <run>` from the shared engine scripts directory. Fix every validation error before installation.

### 3. Install and activate

Copy `theme.json` and its local image into `<themes-root>/<theme-id>/` without following symlinks or copying unrelated files.

macOS activation:

```bash
"$CREATOR_ROOT/engine/macos/scripts/switch-theme-macos.sh" --id "<theme-id>"
```

Windows activation:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File `
  "$WindowsEngineRoot\scripts\switch-theme-windows.ps1" -ThemeId "<theme-id>"
```

### 4. Verify

On macOS run `compatibility-probe.mjs`. On Windows run the shared injector with `--verify --port 9341 --theme-dir <run>` after activation.

Capture a real new-chat route and a real existing-task route. Check sidebar text and states, suggestion cards, project selector, composer, task text, visible background, decoration occlusion, and click safety. Generated images are theme assets, never verification screenshots.

Repair contrast, masking, focal placement, or profile tokens and repeat validation. Limit automatic visual repair to two passes. If checks still fail, report `verified: false` with the failed checks.

## Package and restore

Keep `theme.json`, `source-theme.json`, the local background, `provenance.json`, real route previews, and a short README. Public packages must contain redistributable assets and identify this project as unofficial.

Restore with `restore-dream-skin-macos.sh` on macOS or `restore-theme-windows.ps1` on Windows. Always preserve reduced-motion behavior and the user's saved theme library.

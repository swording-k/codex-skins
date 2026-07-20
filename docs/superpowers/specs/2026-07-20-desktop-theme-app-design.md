# Codex Theme Creator Desktop App Design

## Product promise

Codex Theme Creator is a desktop theme manager for Codex users who do not want to edit files or understand GitHub. The user asks Codex to create a theme from a sentence or reference image; the app then shows the finished theme package in a local library, lets the user tune safe visual settings, and applies it to Codex like switching a wallpaper.

The product is not a pure online website. It works with local Codex theme packages and a local runtime, so the normal user-facing shape should be a desktop app.

## Product roles

The system has four parts:

1. **Codex skill**: the AI creation layer. It understands the user's prompt or reference image, prepares the background asset, chooses readable colors and surfaces, writes `theme.json`, installs the package, and asks for real Codex verification.
2. **Desktop app**: the library and control center. It lists presets and user-created themes, provides safe tuning controls, applies themes, and explains how to ask Codex to create another one.
3. **Local theme runtime**: the bounded renderer and switcher. It applies the selected package to Codex Desktop through the verified local injection path.
4. **Theme library**: the source of truth. Themes live in the user's app-data directory, not inside the source repository.

Product copy: "用一句话创造你的 Codex 主题，再像换壁纸一样随时管理和切换。"

## First release scope

- macOS supports theme creation through Codex, app-based library management, safe tuning, live preview, saving, and applying to Codex.
- Windows supports app launch, theme library management, package editing, and portable package structure. Real Codex apply/switch remains unavailable until a Windows runtime is separately verified.
- Users should not need to open `127.0.0.1` manually. The desktop app starts the local service and opens its own native window.
- GitHub is only the download/source channel. The app experience should not require the user to understand branches, commits, or repository layout.

## Main experience

The app opens directly into **Theme Library**:

- built-in public presets appear next to user-created themes;
- each theme can be saved as a personal copy, applied, or tuned;
- the library can be refreshed when Codex creates a new theme package;
- the creation entry copies a ready-to-use Codex prompt so the user can return to Codex and describe the next theme.

The first release exposes only controls that currently write real theme settings:

- theme name;
- accent color;
- background blur;
- background dimming;
- New Chat surface opacity;
- existing task surface opacity.

The low-quality motion controls are removed from the MVP UI. Motion can return later as curated per-theme effects after visual QA.

## Theme creation flow

```text
User prompt or reference image
        -> Codex Theme Creator skill
        -> background asset + theme.json + readability choices
        -> local theme library
        -> desktop app refresh
        -> tune, preview, apply, export
```

The app can import finished theme packages later, but it should not pretend that importing one image is the whole creation experience. A complete theme package includes background, route-specific surfaces, colors, opacity, text strategy, and Codex compatibility assumptions.

## Storage

User themes live in app data:

- macOS: `~/Library/Application Support/CodexDreamSkinStudio/themes`
- Windows: `%APPDATA%\\CodexDreamSkinStudio\\themes`

Each theme package contains at minimum:

```text
theme.json
background.jpg or background.png
```

The repository can include public presets and examples, but normal user-created themes should appear in app data so the app remains usable after upgrades.

## Architecture

- `theme-studio/lib` owns theme storage, settings normalization, safe path handling, and platform capabilities.
- `theme-studio/server.mjs` is an embeddable local service used by development scripts and the desktop app.
- `theme-studio/public` is the renderer for the manager UI.
- `desktop-app` owns the Electron window, lifecycle, and future packaging.
- `engine/macos` remains the bounded macOS Codex runtime and switcher.

The desktop shell starts the internal service on a loopback port selected by the OS and loads it in a native window. No public network service is required.

## Safety and readability

- Theme packages cannot provide arbitrary JavaScript, arbitrary CSS, remote resources, or interactive overlays.
- App controls are constrained to known schema fields and bounded numeric ranges.
- New Chat and existing task pages keep separate opacity because task content needs stronger readability.
- Unsupported platform actions are visible as unavailable, not fake-working controls.

## Verification

- Unit tests cover settings normalization, path containment, local theme creation, live-preview package creation, and platform capability reporting.
- UI contract tests make sure only working MVP controls are exposed.
- Server-entry tests verify the local service can be embedded by the desktop app.
- Desktop-entry tests verify the Electron app declares the correct entry and starts the embedded Theme Studio service.
- macOS manual verification still distinguishes `created`, `installed`, `active`, and real Codex `verified`.

## Deferred work

- Polished weather and ambient motion effects.
- Per-conversation theme binding after stable Codex task identity detection.
- Windows Codex injection and one-click apply.
- Native file import/export dialogs.
- Accounts, cloud sync, marketplace, analytics, and paid theme distribution.

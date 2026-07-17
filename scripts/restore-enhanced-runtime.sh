#!/bin/bash

set -euo pipefail

INSTALL_ROOT="${CODEX_HOME:-$HOME/.codex}/codex-dream-skin-studio"
FILES=(
  "assets/dream-skin.css"
  "assets/renderer-inject.js"
  "scripts/injector.mjs"
  "scripts/stage-theme.mjs"
)

for relative in "${FILES[@]}"; do
  [ -f "$INSTALL_ROOT/$relative.apex-original" ] || {
    printf 'Restore backup is missing: %s\n' "$INSTALL_ROOT/$relative.apex-original" >&2
    exit 1
  }
done

for relative in "${FILES[@]}"; do
  cp "$INSTALL_ROOT/$relative.apex-original" "$INSTALL_ROOT/$relative"
  chmod 600 "$INSTALL_ROOT/$relative"
done

printf 'Restored the original Dream Skin runtime files at %s\n' "$INSTALL_ROOT"
printf 'Switch themes once more to refresh the current Codex window.\n'

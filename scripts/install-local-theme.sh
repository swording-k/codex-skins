#!/bin/bash

set -euo pipefail

theme_id="${1:-}"
if [ -z "$theme_id" ]; then
  printf 'Usage: %s <theme-id>\n' "$0" >&2
  exit 2
fi

case "$theme_id" in
  *[!A-Za-z0-9_-]*)
    printf 'Invalid theme id: %s\n' "$theme_id" >&2
    exit 2
    ;;
esac

repo_root="$(cd "$(dirname "$0")/.." && pwd -P)"
src="$repo_root/dream-skin/$theme_id"
dest_root="$HOME/Library/Application Support/CodexDreamSkinStudio/themes"
dest="$dest_root/$theme_id"

if [ ! -d "$src" ]; then
  printf 'Theme not found: %s\n' "$src" >&2
  exit 1
fi

if [ ! -f "$src/theme.json" ]; then
  printf 'theme.json missing in: %s\n' "$src" >&2
  exit 1
fi

mkdir -p "$dest_root"
rm -rf "$dest"
mkdir -p "$dest"

for file in theme.json background.jpg background.png background.jpeg background.webp preview.png README.md; do
  [ -f "$src/$file" ] || continue
  cp "$src/$file" "$dest/"
done

printf 'Installed theme %s to:\n%s\n' "$theme_id" "$dest"
printf 'Switch with:\n~/.codex/codex-dream-skin-studio/scripts/switch-theme-macos.sh --id %s\n' "$theme_id"

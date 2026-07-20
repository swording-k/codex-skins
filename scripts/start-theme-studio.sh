#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${PORT:-56938}"

printf 'Starting Codex Theme Studio at http://127.0.0.1:%s/\n' "$PORT"
node "$ROOT/theme-studio/server.mjs" --port "$PORT"

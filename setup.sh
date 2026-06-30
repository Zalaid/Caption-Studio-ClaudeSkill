#!/usr/bin/env bash
# One-time environment setup for Caption Studio.
#   1. creates a Python venv and installs transcription deps
#   2. installs the Remotion (Node) dependencies
#   3. checks for ffmpeg
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

echo "== Caption Studio setup =="

# --- Python ---
PY="${PYTHON:-python3}"
command -v "$PY" >/dev/null 2>&1 || PY=python
echo "[1/3] Python deps ($PY)"
if [ ! -d ".venv" ]; then
  "$PY" -m venv .venv
fi
# shellcheck disable=SC1091
if [ -f ".venv/Scripts/activate" ]; then source ".venv/Scripts/activate"; else source ".venv/bin/activate"; fi
python -m pip install --upgrade pip >/dev/null
python -m pip install -r requirements.txt

# --- Node / Remotion ---
echo "[2/3] Node deps"
if command -v npm >/dev/null 2>&1; then
  (cd remotion && npm install)
else
  echo "  ! npm not found. Install Node 18+ from https://nodejs.org then run: cd remotion && npm install"
fi

# --- ffmpeg ---
echo "[3/3] ffmpeg"
if command -v ffmpeg >/dev/null 2>&1; then
  echo "  ok: $(ffmpeg -version | head -1)"
else
  echo "  ! ffmpeg not found. Install it (with NVENC) and ensure it is on PATH."
fi

echo "== setup complete =="

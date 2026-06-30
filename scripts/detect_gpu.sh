#!/usr/bin/env bash
# Quick GPU / NVENC sanity check. Prints a short report; exit 0 always.
set -uo pipefail

echo "== GPU / encoder check =="

if command -v nvidia-smi >/dev/null 2>&1; then
  nvidia-smi --query-gpu=name,memory.total,driver_version --format=csv,noheader 2>/dev/null \
    | sed 's/^/[gpu] /' || echo "[gpu] nvidia-smi present but query failed"
else
  echo "[gpu] nvidia-smi not found (no NVIDIA GPU or driver) -> transcription will use CPU"
fi

if command -v ffmpeg >/dev/null 2>&1; then
  if ffmpeg -hide_banner -encoders 2>/dev/null | grep -q h264_nvenc; then
    echo "[ffmpeg] h264_nvenc available (hardware export)"
  else
    echo "[ffmpeg] h264_nvenc NOT available (will use libx264)"
  fi
else
  echo "[ffmpeg] ffmpeg not found — install it before exporting"
fi

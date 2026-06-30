#!/usr/bin/env bash
# Re-encode a rendered video to a clean YouTube Shorts delivery preset.
# Uses NVENC (H.264) when available, falls back to libx264.
#
# Usage: scripts/export.sh INPUT.mp4 OUTPUT.mp4
set -euo pipefail

IN="${1:?usage: export.sh INPUT.mp4 OUTPUT.mp4}"
OUT="${2:?usage: export.sh INPUT.mp4 OUTPUT.mp4}"

# YouTube Shorts: 1080x1920, H.264 High, ~12 Mbps, AAC 192k, yuv420p, +faststart.
if ffmpeg -hide_banner -encoders 2>/dev/null | grep -q h264_nvenc; then
  echo "[export] encoding with h264_nvenc"
  ffmpeg -y -i "$IN" \
    -c:v h264_nvenc -preset p5 -profile:v high -rc vbr -b:v 12M -maxrate 16M -bufsize 24M \
    -pix_fmt yuv420p -movflags +faststart \
    -c:a aac -b:a 192k -ar 48000 \
    "$OUT"
else
  echo "[export] h264_nvenc not found, using libx264"
  ffmpeg -y -i "$IN" \
    -c:v libx264 -preset slow -profile:v high -b:v 12M -maxrate 16M -bufsize 24M \
    -pix_fmt yuv420p -movflags +faststart \
    -c:a aac -b:a 192k -ar 48000 \
    "$OUT"
fi

echo "[export] done -> $OUT"

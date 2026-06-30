<#
  Re-encode a rendered video to a clean YouTube Shorts delivery preset (Windows).
  Uses NVENC (H.264) when available, falls back to libx264.

  Usage: powershell -File scripts/export.ps1 -In input.mp4 -Out final.mp4
#>
param(
  [Parameter(Mandatory = $true)][string]$In,
  [Parameter(Mandatory = $true)][string]$Out
)

$ErrorActionPreference = "Stop"

$encoders = & ffmpeg -hide_banner -encoders 2>$null
if ($encoders -match "h264_nvenc") {
  Write-Host "[export] encoding with h264_nvenc"
  & ffmpeg -y -i $In `
    -c:v h264_nvenc -preset p5 -profile:v high -rc vbr -b:v 12M -maxrate 16M -bufsize 24M `
    -pix_fmt yuv420p -movflags +faststart `
    -c:a aac -b:a 192k -ar 48000 `
    $Out
} else {
  Write-Host "[export] h264_nvenc not found, using libx264"
  & ffmpeg -y -i $In `
    -c:v libx264 -preset slow -profile:v high -b:v 12M -maxrate 16M -bufsize 24M `
    -pix_fmt yuv420p -movflags +faststart `
    -c:a aac -b:a 192k -ar 48000 `
    $Out
}

Write-Host "[export] done -> $Out"

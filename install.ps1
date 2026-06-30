<#
  Install Caption Studio as a Claude Code skill (Windows).

  Default target is your personal skills folder (~\.claude\skills), making
  /caption-studio available in every project.

  To scope it to one tree (e.g. only under D:\Youtube), pass that parent's
  .claude\skills path:
    powershell -File install.ps1 -SkillsDir "D:\Youtube\.claude\skills"
#>
param(
  [string]$SkillsDir = (Join-Path $HOME ".claude\skills")
)

$ErrorActionPreference = "Stop"
$src = $PSScriptRoot
$target = Join-Path $SkillsDir "caption-studio"

Write-Host "Installing caption-studio -> $target"
New-Item -ItemType Directory -Force -Path $target | Out-Null

$exclude = @(".git", "node_modules", ".venv", "out", "__pycache__")

function Test-Excluded([string]$fullPath) {
  $rel = $fullPath.Substring($src.Length).TrimStart('\', '/')
  foreach ($e in $exclude) {
    if ($rel -split '[\\/]' -contains $e) { return $true }
  }
  return $false
}

Get-ChildItem -Path $src -Recurse -Force | Where-Object { -not (Test-Excluded $_.FullName) } | ForEach-Object {
  $dest = Join-Path $target $_.FullName.Substring($src.Length).TrimStart('\', '/')
  if ($_.PSIsContainer) {
    New-Item -ItemType Directory -Force -Path $dest | Out-Null
  } else {
    New-Item -ItemType Directory -Force -Path (Split-Path $dest) | Out-Null
    Copy-Item -LiteralPath $_.FullName -Destination $dest -Force
  }
}

Write-Host "Done. Open Claude Code under that tree and run /caption-studio."
Write-Host "First run will set up Python + Node deps via setup.sh."

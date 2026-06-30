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

robocopy $src $target /MIR /XD $exclude /NFL /NDL /NJH /NJS /NP | Out-Null
# robocopy exit codes 0-7 are success; 8+ are real errors.
if ($LASTEXITCODE -ge 8) { throw "robocopy failed with code $LASTEXITCODE" }

Write-Host "Done. Open Claude Code under that tree and run /caption-studio."
Write-Host "First run will set up Python + Node deps via setup.sh."

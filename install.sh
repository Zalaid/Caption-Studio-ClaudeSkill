#!/usr/bin/env bash
# Install Caption Studio as a Claude Code skill.
#
# Default target is your personal skills folder (~/.claude/skills), which makes
# /caption-studio available in every project.
#
# To scope it to one tree instead (e.g. only under a specific parent folder),
# pass that parent's .claude/skills path:
#   bash install.sh "/d/Youtube/.claude/skills"
set -euo pipefail

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST_DIR="${1:-$HOME/.claude/skills}"
TARGET="$DEST_DIR/caption-studio"

echo "Installing caption-studio -> $TARGET"
mkdir -p "$TARGET"

# Copy the skill, excluding VCS / build / venv artifacts.
if command -v rsync >/dev/null 2>&1; then
  rsync -a --delete \
    --exclude ".git" \
    --exclude "node_modules" \
    --exclude ".venv" \
    --exclude "remotion/node_modules" \
    --exclude "remotion/out" \
    --exclude "__pycache__" \
    "$SRC/" "$TARGET/"
else
  cp -R "$SRC/." "$TARGET/"
  rm -rf "$TARGET/.git" "$TARGET/node_modules" "$TARGET/.venv" \
         "$TARGET/remotion/node_modules" "$TARGET/remotion/out"
fi

echo "Done. Open Claude Code under that tree and run /caption-studio."
echo "First run will set up Python + Node deps via setup.sh."

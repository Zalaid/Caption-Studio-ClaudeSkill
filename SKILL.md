---
name: caption-studio
description: Burn animated, word-level captions into a finished vertical (1080x1920) video. Transcribes the audio to word timings, renders styled captions over the full frame with Remotion (no cropping, no reframing), then exports a YouTube Shorts-ready mp4. Use when the user wants to caption a Short / Reel / TikTok, add subtitles to a vertical video, or run /caption-studio.
argument-hint: "<video.mp4> [styleName]"
allowed-tools: Bash, Read, AskUserQuestion
user-invocable: true
license: MIT
---

# Caption Studio — animated captions for vertical video

Takes one finished 1080×1920 video in, returns the same video with on-brand,
word-by-word animated captions burned in. Three steps: **transcribe → render →
export.** The source frame is passed through untouched — there is no crop, pan, or
reframe anywhere in the pipeline.

`${CLAUDE_SKILL_DIR}` is this skill's folder. On **Windows** use `python` (not
`python3`) and prefer the `.ps1` scripts; on macOS/Linux use the `.sh` scripts.

## Step 0 — Preflight (run once per session, silent on success)

Check that deps are present before doing real work:

```bash
bash "${CLAUDE_SKILL_DIR}/scripts/detect_gpu.sh"
```

If Python deps or Node modules are missing, run setup (idempotent):

```bash
bash "${CLAUDE_SKILL_DIR}/setup.sh"
```

If `npm`/Node is missing entirely, tell the user to install Node 18+ — the render
step needs it. Everything else (transcription, export) works without Node.

## Step 1 — Input

Take the one finished vertical mp4 the user provides (Mode A — the only mode).
Confirm it is 1080×1920; if not, proceed anyway but note it. Set:

- `VIDEO` = absolute path to the input mp4.
- `WORK` = a working folder (e.g. alongside the video) for `words.json` and output.

## Step 2 — Transcribe (then verify the words)

```bash
python "${CLAUDE_SKILL_DIR}/scripts/transcribe.py" "$VIDEO" --output "$WORK/words.json"
```

**Quality gate (important for numbers/names):** read `words.json` and show the
user the transcript text. Ask them to confirm it against their written script,
especially any numbers, names, and brand terms. If something is wrong, the user
edits the `text` fields in `words.json` directly (timings stay correct), then
continue. (For TTS / separate clean voice tracks, `scripts/align.py` can force-
align a known script instead — optional, not the default.)

## Step 3 — Style

Ask the user for a `styleName` (or use the one passed as the argument). Built-in
styles live in `remotion/src/captions/styles.ts`:

- `cosmicClean` — calm fade, white text, blue active word, lower-third.
- `moneyBold` — uppercase pop-in, green active word, centered.
- `minimal` — ultra-clean, no highlight.

Optional overrides to offer: `--hook "<opening line>"`, `--progress` (progress
bar on), `--style <name>`. Anything deeper (colors, fonts, new styles) is edited
in `styles.ts`.

## Step 4 — Render + Export

Render captions over the full frame:

```bash
node "${CLAUDE_SKILL_DIR}/remotion/render.mjs" \
  --video "$VIDEO" \
  --captions "$WORK/words.json" \
  --output "$WORK/captioned.mp4" \
  --style "$STYLE"
```

Then transcode to the YouTube Shorts delivery preset:

```bash
# macOS/Linux
bash "${CLAUDE_SKILL_DIR}/scripts/export.sh" "$WORK/captioned.mp4" "$WORK/final.mp4"
# Windows
powershell -File "${CLAUDE_SKILL_DIR}/scripts/export.ps1" -In "$WORK/captioned.mp4" -Out "$WORK/final.mp4"
```

Report the path to `final.mp4` and you're done. No candidate tables, no segment
picking, no reframe prompts — plain and fast.

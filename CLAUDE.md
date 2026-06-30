# Caption Studio — notes for Claude Code

This repo is a Claude Code skill that burns animated word-level captions into a
finished vertical video. Pipeline: **transcribe → render → export**.

## Hard rule: never crop the source
The input frame is passed through full-frame in `remotion/src/CaptionedShort.tsx`
via `<OffthreadVideo>`. There is no crop / pan / reframe / face-tracking anywhere.
Do not add one.

## Where things live
- `scripts/transcribe.py` — faster-whisper → `words.json` (word timings + Remotion-ready captions).
- `remotion/render.mjs` — bundles + renders the `CaptionedShort` composition.
- `remotion/src/captions/styles.ts` — the style registry. Add styles here; there is no limit.
- `remotion/src/styles/fonts.ts` — font loading (Inter placeholder; swap for brand fonts).
- `scripts/export.sh` / `export.ps1` — final YouTube Shorts encode.

## Data contract
`words.json` carries a `captions: [{ text, startMs, endMs }]` array. The renderer
reads that directly; `transcribe.py` and `align.py` both emit it.

## Conventions
- Windows: use `python` and the `.ps1` scripts. macOS/Linux: `.sh`.
- New caption looks = new entry in `styles.ts`, not new components.

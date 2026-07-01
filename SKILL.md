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

Take the one finished vertical mp4 the user provides (Mode A — the only mode). Also
note the user's **topic name + idea** — you'll use it (plus the transcript) to
auto-generate the hook in Step 3b. Confirm the video is 1080×1920; if not, proceed
anyway but note it. Set:

- `VIDEO` = absolute path to the input mp4.
- `OUT` = the final output path. Default: same folder as `VIDEO`, named
  `<video-stem>-captioned.mp4`. **This is the only file that survives.**
- `TMP` = a fresh temp folder for intermediates (`words.json`, `captioned.mp4`):
  - macOS/Linux: `TMP="$(mktemp -d)"`
  - Windows: `TMP="$(python -c "import tempfile,sys;sys.stdout.write(tempfile.mkdtemp(prefix='captionstudio_'))")"`

## Step 2 — Transcribe (then verify the words)

```bash
python "${CLAUDE_SKILL_DIR}/scripts/transcribe.py" "$VIDEO" --output "$TMP/words.json"
```

**Quality gate (important for numbers/names):** read `words.json` and show the
user the transcript text. Ask them to confirm it against their written script,
especially any numbers, names, and brand terms. If something is wrong, the user
edits the `text` fields in `words.json` directly (timings stay correct), then
continue. (For TTS / separate clean voice tracks, `scripts/align.py` can force-
align a known script instead — optional, not the default.)

## Step 3 — Style

`curioFacts` is the **default** and the recommended look for facts / curiosity
Shorts (derived from analysing high-view Shorts): white Montserrat ExtraBold,
sentence case, 1–2 words on a single line at ~7% of frame height, thick black
outline, centered at ~75% down, word-by-word pop, with the payoff word/number in
yellow. Use it unless the user asks for something else. Other built-in styles live
in `remotion/src/captions/styles.ts` (`cosmicClean`, `moneyBold`, `boldYellow`,
`karaokePill`, `outline`, `premiumGold`, `minimal`, …).

### Emphasis (yellow words) + hook — decide these per script, no fixed list

There is **no keyword list / heuristic** — the emphasis intelligence is you (Claude)
reading the script fresh each time:

- **Numbers / units / % / $ are auto-emphasised** structurally (`3.5`, `90%`, `$2M`,
  `12°C`) — nothing to configure, always on.
- **Payoff words:** read the user's topic + the transcript and pick the ~2–4 words per
  10s that actually carry the meaning for *this* script (the surprising noun, the twist
  word), then pass them via `--keywords "word1, word2"`. Choose by understanding — never
  from a preset list.
- **Hook:** the user does **not** provide it — you generate it from the video + topic in
  Step 3b, then pass it via `--hook "..."` (big ALL-CAPS scroll-stopper, auto-timed).

**Want to pick visually?** Offer to open **Remotion Studio** — a live browser
preview where the user scrubs the video and flips styles/options in a side panel,
seeing fonts, colors and animations update instantly:

```bash
node "${CLAUDE_SKILL_DIR}/remotion/preview.mjs" --video "$VIDEO" --captions "$TMP/words.json"
# then open the printed URL (http://localhost:3000) and use the right-hand "Props" panel
```

When they've decided in Studio, note their `styleName` + any tweaks and continue.

Optional overrides to offer: `--hook "<opening line>"`, `--progress` (progress
bar on), `--style <name>`. Anything deeper (colors, fonts, new styles) is edited
in `styles.ts`.

## Step 3b — Generate the hook (automatic, 3-agent panel)

The user gives only the **video + topic name + idea** — never the hook text. You write
it, using the video's own content:

1. **Gather context once** — do NOT make each agent re-watch the video. You already have
   the full transcript in `words.json`; optionally sample 2–3 opening frames via the
   `/watch` skill for visual cues. This shared context feeds all agents.
2. **Spawn 3 hook-writer agents in parallel**, each a distinct framework, all given the
   topic + idea + transcript (+ opening frames):
   - **Curiosity gap / open loop** — tease a question the viewer must resolve.
   - **Shock number / stat** — lead with the most surprising figure.
   - **Bold / contrarian claim** — challenge an assumption ("you're doing X wrong").
   Each returns 2–3 candidate lines (≤5 words, punchy, reads well big + ALL-CAPS).
3. **Judge + pick** — score every candidate for scroll-stop power (<1s), relevance to the
   payoff, brevity (≤5 words), and big-text readability. Choose **1 winner + 1 backup**.
4. **Show the user the winner (+ the backup and other candidates) and STOP for approval.**
   Always wait for their OK before rendering — do not auto-proceed. They can approve the
   winner, pick an alternate, or ask for a reword; only continue once they confirm.
5. **Pass to render** via `--hook "<winner>"`. Do **not** pass `--hook-seconds`: the
   renderer auto-times the hook to the first natural pause in the narration (clamped 2–4s).

## Step 4 — Render + Export

Render captions over the full frame:

```bash
node "${CLAUDE_SKILL_DIR}/remotion/render.mjs" \
  --video "$VIDEO" \
  --captions "$TMP/words.json" \
  --output "$TMP/captioned.mp4" \
  --style "$STYLE" \
  --hook "$HOOK" \
  --keywords "$KEYWORDS"
```

`--style` defaults to `curioFacts` if omitted. `--hook` and `--keywords` are optional
but recommended (see Step 3): the hook is the ALL-CAPS opener, `--keywords` are the
contextual payoff words you chose for this script (numbers are emphasised automatically).

Then transcode to the YouTube Shorts delivery preset, writing the **final** file:

```bash
# macOS/Linux
bash "${CLAUDE_SKILL_DIR}/scripts/export.sh" "$TMP/captioned.mp4" "$OUT"
# Windows
powershell -File "${CLAUDE_SKILL_DIR}/scripts/export.ps1" -In "$TMP/captioned.mp4" -Out "$OUT"
```

## Step 5 — Clean up temp files (always)

Once `$OUT` exists and is non-empty, delete the temp folder so nothing is left
behind — `$OUT` is the only artifact that should remain:

```bash
rm -rf "$TMP"                          # macOS/Linux
# Windows (PowerShell): Remove-Item -Recurse -Force "$TMP"
```

If a step **failed**, keep `$TMP` and tell the user its path for debugging instead
of deleting it. (Remotion cleans its own OS-temp bundle automatically.)

Report the path to `$OUT` and you're done. No candidate tables, no segment
picking, no reframe prompts — plain and fast.

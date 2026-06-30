# Caption Studio

**Animated, word-by-word captions for vertical video — burned in, never cropped.**

Caption Studio is a [Claude Code](https://docs.claude.com/en/docs/claude-code) skill
that takes one finished vertical (1080×1920) video and returns the same video with
on-brand, animated captions baked in. It transcribes the audio to precise word
timings, renders styled captions over the **full frame** with [Remotion](https://www.remotion.dev),
and exports a YouTube Shorts–ready `.mp4`.

Three steps, nothing else: **transcribe → render → export.**

> The source frame is passed through untouched. There is **no crop, no pan, no
> reframe, no face-tracking** anywhere in the pipeline — what you put in is exactly
> what comes out, with captions on top.

---

## Features

- 🎙️ **Word-level transcription** via `faster-whisper` (GPU-accelerated, CPU fallback).
- ✍️ **Word-by-word highlighting** — the spoken word lights up as it's said (TikTok-style).
- 🎨 **Unlimited styles** — each caption look is a config object; add as many as you want.
- 🚫 **Never crops** — full-frame passthrough; your composition is preserved.
- 🔤 **Your fonts & colors** — drop in brand `.woff2` files and hex codes.
- ⚡ **Hardware export** — NVENC H.264 when available, clean `libx264` fallback.
- 🪝 **Optional overlays** — a frame-one hook line and a toggleable progress bar.
- 🤖 **Runs from `/caption-studio`** inside Claude Code, or directly from the CLI.

---

## How it works

```
  finished 1080x1920 video
            │
            ▼
  ┌───────────────────┐   faster-whisper → words.json
  │   1. TRANSCRIBE   │   (word-level timestamps, then a quick accuracy check)
  └───────────────────┘
            │
            ▼
  ┌───────────────────┐   Remotion: full-frame <OffthreadVideo> + caption layer
  │   2. RENDER       │   styled, highlighted, animated — NO crop / pan / reframe
  └───────────────────┘
            │
            ▼
  ┌───────────────────┐   ffmpeg/NVENC → YouTube Shorts preset
  │   3. EXPORT       │   → final.mp4
  └───────────────────┘
```

---

## Requirements

| Tool | Version | Notes |
|------|---------|-------|
| **Python** | 3.10+ | transcription (`faster-whisper`) |
| **Node.js** | 18+ | Remotion rendering |
| **FFmpeg** | recent | export; build with **NVENC** for hardware encoding |
| **NVIDIA GPU** | optional | speeds up transcription + export (CPU works too) |
| **Claude Code** | latest | to use the `/caption-studio` skill (optional — CLI works standalone) |

---

## Installation

```bash
git clone https://github.com/Zalaid/Caption-Studio-ClaudeSkill.git
cd Caption-Studio-ClaudeSkill

# One-time setup: Python venv + transcription deps, Remotion deps, ffmpeg check
bash setup.sh          # macOS / Linux / Git Bash on Windows
```

`setup.sh` creates a `.venv`, installs `requirements.txt`, and runs `npm install`
inside `remotion/`. If you don't have Node yet, install it from
[nodejs.org](https://nodejs.org) and re-run.

### Install it as a Claude Code skill

Make `/caption-studio` available in Claude Code:

```bash
# Available in every project (personal skills folder)
bash install.sh
```

```powershell
# Windows
powershell -File install.ps1
```

**Scope it to one folder tree instead.** Claude Code loads skills from
`.claude/skills/` in your working directory *and every parent directory*, so
installing into a parent makes the skill available in every subfolder beneath it:

```bash
# Skill loads for any project under D:\Projects
bash install.sh "/d/Projects/.claude/skills"
```

```powershell
powershell -File install.ps1 -SkillsDir "D:\Projects\.claude\skills"
```

---

## Usage

### From Claude Code

```
/caption-studio path/to/video.mp4 moneyBold
```

Claude transcribes, shows you the transcript to confirm (numbers and names
matter), renders with the chosen style, and exports the final file.

### From the command line

```bash
# 1) Transcribe → words.json
python scripts/transcribe.py input.mp4 --output words.json

#    (open words.json, sanity-check the text against your script)

# 2) Render captions over the full frame
node remotion/render.mjs \
  --video input.mp4 \
  --captions words.json \
  --output captioned.mp4 \
  --style cosmicClean

# 3) Export to the YouTube Shorts delivery preset
bash scripts/export.sh captioned.mp4 final.mp4      # macOS / Linux
powershell -File scripts/export.ps1 -In captioned.mp4 -Out final.mp4   # Windows
```

**`render.mjs` flags:** `--style <name>` · `--hook "Opening line"` ·
`--progress` (show progress bar) · `--fps 30`.

### Live preview (Remotion Studio)

```bash
cd remotion
npm run studio
```

---

## Styles

Built-in styles (in `remotion/src/captions/styles.ts`):

| Style | Look | Good for |
|-------|------|----------|
| `cosmicClean` | Calm fade, white text, blue active word, lower-third | Explainers / science |
| `moneyBold` | Uppercase pop-in, green active word, centered | Hook-driven / finance |
| `minimal` | Ultra-clean, no highlight | Neutral default |

### Add your own style

A style is just a config object — copy one, rename it, tweak the values:

```ts
// remotion/src/captions/styles.ts
export const STYLES = {
  myStyle: {
    font: FONTS.display,
    fontSize: 72,
    fontWeight: 800,
    uppercase: true,
    letterSpacing: 0.5,
    baseColor: "#FFFFFF",
    activeColor: "#FF5C8A",          // the highlighted word
    stroke: { color: "#000", width: 8 },
    shadow: "0px 6px 22px rgba(0,0,0,0.5)",
    position: "center",               // "lower-third" | "center" | { y: 1500 }
    maxWordsPerLine: 3,
    maxLines: 2,
    highlightActiveWord: true,
    animation: "pop",                 // "pop" | "fade" | "slide" | "none"
  },
  // ...add as many as you like — there's no limit.
};
```

### Per-video overrides

Override any style value for a single render without editing the registry — pass
props through `render.mjs` (`--style`, `--hook`, `--progress`) or extend the
`inputProps` it builds. The full prop schema lives in `remotion/src/types.ts`.

---

## Customization

### Brand fonts

Out of the box it loads **Inter** (no files needed). To use your own:

1. Drop `YourFont.woff2` into `remotion/public/fonts/`.
2. Register it in `remotion/src/styles/fonts.ts`:

   ```ts
   import { loadFont } from "@remotion/fonts";
   import { staticFile } from "remotion";
   loadFont({ family: "YourFont", url: staticFile("fonts/YourFont.woff2") });
   export const FONTS = { sans: "YourFont", display: "YourFont", mono: "YourFont" };
   ```

### Brand colors

Edit the `baseColor` / `activeColor` (and `stroke`, `shadow`, `pill`) values in
`styles.ts`. Placeholders are marked with `TODO (brand)`.

---

## Accuracy of numbers & names

Whisper transcribes the real audio, which is excellent but not perfect — and a
misheard number is costly. The fix is built into the workflow: after
transcription, **check `words.json` against your written script** and edit any
wrong `text` field (the timings stay correct). It's a five-second check for
perfect captions.

For separate clean voice tracks (e.g. TTS) you can instead force-align a known
script with `scripts/align.py` (requires `whisperx`) so the words come 100% from
your text. Optional — the verify-the-transcript path above is the default.

---

## Project structure

```
.
├── SKILL.md                    # the /caption-studio orchestrator
├── setup.sh                    # env setup (Python venv + Remotion deps)
├── install.sh / install.ps1    # install as a Claude Code skill
├── requirements.txt            # faster-whisper
├── scripts/
│   ├── transcribe.py           # audio → words.json (word timings)
│   ├── align.py                # optional forced alignment (known script)
│   ├── export.sh / export.ps1  # YouTube Shorts encode
│   └── detect_gpu.sh           # GPU / NVENC sanity check
└── remotion/
    ├── render.mjs              # bundle + render the composition
    ├── remotion.config.ts
    ├── package.json
    └── src/
        ├── Root.tsx            # registers the CaptionedShort composition
        ├── CaptionedShort.tsx  # full-frame video + caption layer (no crop)
        ├── types.ts            # Zod prop schema
        ├── captions/
        │   ├── styles.ts       # the style registry
        │   └── CaptionLayer.tsx
        ├── hooks/useCaptionPages.ts
        ├── overlays/{HookOverlay,ProgressBar}.tsx
        └── styles/fonts.ts
```

---

## Troubleshooting

- **`npm` / `node` not found** — install Node 18+ from [nodejs.org](https://nodejs.org), then `cd remotion && npm install`.
- **Transcription falls back to CPU** — no CUDA GPU detected; it still works, just slower. Install the CUDA build of your GPU stack to accelerate.
- **Export uses `libx264` instead of NVENC** — your FFmpeg wasn't built with NVENC. Install an NVENC-enabled FFmpeg, or accept the (slower) software encode.
- **Captions slightly off-time** — re-check `words.json`; you can nudge `startMs`/`endMs` per word by hand.
- **Wrong word/number** — edit the `text` field in `words.json` and re-render.

---

## License

[MIT](LICENSE) © 2026 Zalaid

# Curiocade Caption Skill — Build Plan
### A minimal, brand-owned captioning skill. Keep 3 parts of `claude-shorts`, delete the clipper, add unlimited styles.

> **Source note:** the `claude-shorts` paths/filenames below come from its public
> README structure (read in full). The internals of individual files
> (`transcribe.py`, the Remotion components) weren't inspected line-by-line — open
> them on disk to confirm exact arguments/output before copying. `claude-shorts` is
> **MIT-licensed**, so copying code is fine; keep its `LICENSE`/attribution in any
> file you copy.

---

## 0. FIRST STEP — clone the repo, then open the files you'll reuse

**Before building anything, clone `claude-shorts` and read the actual files.** This
plan describes what each file *should* do (from the README) — you confirm against
the real code, then you'll know exactly what to copy as-is vs. adapt.

```bash
git clone https://github.com/AgriciDaniel/claude-shorts.git
cd claude-shorts
```

**Open and read these (the ones we plan to COPY) — confirm what they do:**
- `scripts/transcribe.py` — check its CLI arguments and that it outputs **word-level
  timestamps** (text + start + end per word), and where it writes them.
- `scripts/export.sh` — find the **YouTube Shorts** ffmpeg/NVENC command to lift.
- `remotion/render.mjs` — see how it **bundles and passes props** to the composition.
- `remotion/remotion.config.ts` + `remotion/src/Root.tsx` — Remotion scaffolding +
  how compositions are registered.
- `remotion/src/hooks/useCaptionPages.ts` — the `@remotion/captions` word→page
  chunking we want to keep.
- `remotion/src/types.ts` — the Zod prop pattern.
- `setup.sh`, `install.sh`, `requirements.txt` — env + skill install (note which
  deps to drop — see §3 Delete).

**Read for reference (don't copy wholesale — borrow the technique):**
- `remotion/src/components/CleanCaptions.tsx`, `BoldCaptions.tsx` — how they animate
  the active word (spring/fade). You'll write richer versions.
- `remotion/src/styles/theme.ts` (palettes) + `styles/fonts.ts` (font loading).
- `references/caption-styles.md` — the full per-style specs (sizes, spring configs).
  *(This one couldn't be pulled from GitHub — this is where it actually lives.)*

**Glance at, only to confirm we're correctly DELETING them** (so you don't
accidentally depend on one): `scripts/detect_content.py`, `scripts/compute_reframe.py`,
`scripts/snap_boundaries.py`, and `remotion/src/components/VideoFrame.tsx`.

Once you've read the COPY set, jump to §3 (Copy / Build / Delete) and start Phase 1.

---

## 1. The goal

One finished vertical video **in** → the same video with **on-brand burned-in
captions out**. Nothing else. No segment scoring, no content detection, no
reframe/crop — those are the parts that don't fit animated Shorts and the parts
that can crop your perfect frame.

We keep `claude-shorts`'s **proven plumbing** (transcription, Remotion render
skeleton, export presets) and replace its **brain and its look** with our own.

---

## 2. The architecture (the whole thing)

```
INPUT
  ├─ Mode A: one already-assembled 1080×1920 mp4
  └─ Mode B: 6–7 raw Flow clips + narration track  (Remotion stitches them)
        │
        ▼
TRANSCRIBE          faster-whisper → words.json  (word-level timestamps)
  └─ optional: forced-align your KNOWN script instead → 100% correct words
        │
        ▼
RENDER (Remotion)   full-frame <OffthreadVideo> + caption layer
                    NO crop, NO pan, NO reframe
                    style + options come from props
        │
        ▼
EXPORT              ffmpeg/NVENC → YouTube Shorts preset → final.mp4
```

Three real steps: **transcribe → render → export.** That's the skill.

---

## 3. Copy / Build / Delete — the reference map to `claude-shorts`

### ✅ COPY (reuse, lightly trim)

| From `claude-shorts`              | Why keep it                                              | Changes |
|-----------------------------------|---------------------------------------------------------|---------|
| `scripts/transcribe.py`           | faster-whisper word-level timestamps — proven, works     | Strip anything that couples it to the segment pipeline; ensure it outputs a clean `words.json` (text, start, end per word) |
| `scripts/export.sh`               | the platform encode settings (codec/bitrate/audio)       | Keep **YouTube Shorts** preset only (H.264 High 4.2, 12 Mbps, AAC 192k); drop TikTok/IG unless you want them |
| `scripts/detect_gpu.sh`, `preflight.sh` | small GPU/disk sanity helpers                      | Optional. Nice for robustness |
| `remotion/render.mjs`             | "bundle-once, render-many" orchestrator pattern          | Copy the skeleton, then point it at *our* composition |
| `remotion/remotion.config.ts`, `Root.tsx` | Remotion project scaffolding                     | Copy, register our composition |
| `remotion/src/types.ts`           | Zod prop schema pattern                                   | Replace contents with **our** props (all the options) |
| `remotion/src/hooks/useCaptionPages.ts` | wraps `@remotion/captions` word→page chunking      | Copy ~as-is (this is the TikTok-style word grouping) |
| `setup.sh`, `install.sh`, `requirements.txt` | env + skill install                          | Copy and **trim deps** (see Delete) |

### 🔨 BUILD FRESH (this is the part that's actually *yours*)

| New file                              | What it is |
|---------------------------------------|------------|
| `SKILL.md`                            | A *simple* 3–4 step orchestrator (no scoring/approve table). See §6. |
| `remotion/src/CaptionedShort.tsx`     | **The core.** Full-frame `<OffthreadVideo>` + caption layer. **No `VideoFrame` crop/pan.** |
| `remotion/src/captions/styles.ts`     | **Style registry** — N preset styles as config objects (font, colors, stroke, shadow, pill, position, size, animation). This is how you get *unlimited* styles instead of 3. |
| `remotion/src/captions/CaptionLayer.tsx` | Reads a style config + the word pages, renders + highlights the active word |
| `remotion/src/overlays/HookOverlay.tsx` | Your frame-1 hook text (first ~3.5s) — feed it your hook line |
| `remotion/src/overlays/ProgressBar.tsx` | Optional, toggleable (off by default for the clean look) |
| `remotion/public/fonts/`              | **Your brand fonts** (`.woff2`/`.ttf`), `@font-face`d |
| `scripts/align.py` *(optional)*       | Forced alignment from your known script → zero number/name typos |
| `remotion/src/Stitch.tsx` *(Mode B only)* | `<Series>` of your 6–7 clips + narration audio, so assembly + captions happen in **one render** |

### ⛔ DELETE / never include (the clipper brain)

| From `claude-shorts`            | Why it's gone |
|---------------------------------|---------------|
| `scripts/detect_content.py`     | talking-head/screen/podcast classifier — irrelevant to animation |
| `scripts/compute_reframe.py`    | **face/cursor tracking + crop** — this is the thing that crops your frame |
| `scripts/snap_boundaries.py`    | cut-point snapping — you're not cutting |
| Segment scoring + `references/scoring-rubric.md` | the Analyze/Present/Approve "which clip" flow — you want the whole clip |
| `VideoFrame.tsx`'s crop-pan      | replaced by full-frame passthrough in `CaptionedShort.tsx` |
| `mediapipe`, `opencv-python` deps | only needed for face/cursor tracking — drop from `requirements.txt` (big install savings) |
| Bold/Bounce/Clean as the *only* styles | replaced by your own bigger registry |

---

## 4. Proposed skill structure

```
curiocade-captions/
├── SKILL.md                       # simple orchestrator (NEW)
├── CLAUDE.md                      # project notes (optional)
├── setup.sh                       # copied + trimmed
├── install.sh                     # copied
├── requirements.txt               # faster-whisper, torch  (NO mediapipe/opencv)
├── scripts/
│   ├── transcribe.py              # COPIED, trimmed
│   ├── align.py                   # NEW (optional forced alignment)
│   ├── export.sh                  # COPIED (YouTube preset)
│   └── detect_gpu.sh              # COPIED (optional)
└── remotion/
    ├── package.json               # remotion, @remotion/captions, react, zod
    ├── render.mjs                 # COPIED skeleton, retargeted
    ├── remotion.config.ts         # COPIED
    ├── public/fonts/              # YOUR fonts (NEW)
    └── src/
        ├── Root.tsx               # COPIED, registers our composition
        ├── types.ts               # NEW Zod props (all options)
        ├── CaptionedShort.tsx     # NEW — full-frame video + captions, NO crop
        ├── Stitch.tsx             # NEW (Mode B only)
        ├── hooks/
        │   └── useCaptionPages.ts # COPIED
        ├── captions/
        │   ├── CaptionLayer.tsx   # NEW
        │   └── styles.ts          # NEW — the style registry
        └── overlays/
            ├── HookOverlay.tsx    # NEW
            └── ProgressBar.tsx    # NEW (toggleable)
```

---

## 5. The style system (how you get "more fonts/colors/options")

It's all **Remotion = React**, so styling is fully open. The 3 fixed styles in
`claude-shorts` are a limit of *that repo*, not the tech.

**`styles.ts` — each style is just a config object:**
```ts
// shape only — fill with your real values
type CaptionStyle = {
  font: string;            // 'CurioSans', 'CurioMono', etc. (your fonts)
  fontSize: number;
  uppercase: boolean;
  baseColor: string;       // inactive words
  activeColor: string;     // the spoken/highlighted word  (your money-green / cosmic-blue)
  stroke?: { color: string; width: number };
  shadow?: string;
  pill?: { color: string; radius: number; padding: number }; // bg behind text
  position: 'lower-third' | 'center' | { y: number };
  maxWordsPerLine: number;
  maxLines: number;
  animation: 'pop' | 'fade' | 'slide' | 'none'; // add your own
};

export const STYLES: Record<string, CaptionStyle> = {
  cosmicClean: { /* calm fade, white, blue active word, lower-third */ },
  moneyBold:   { /* pop-in, uppercase, yellow/green active word */ },
  // add as many as you want — no limit
};
```

**Options exposed as props** (in `types.ts`, validated by Zod) so you can override
per video without editing components: `styleName`, `position`, `fontSize`,
`uppercase`, `maxWordsPerLine`, `maxLines`, `highlightActiveWord` (on/off),
`showPill` (on/off), `showProgressBar` (on/off), `hookText`, `hookDurationSec`.

**Fonts:** drop `.woff2` into `remotion/public/fonts/`, register with `@font-face`
(or `@remotion/fonts`). Now captions use your *real* brand font.

**Suggested starting styles (map to your niches):**
- `cosmicClean` — calm fade-in, white + soft shadow, cosmic-blue active word → science.
- `moneyBold` — pop-in spring, uppercase, green/yellow active word → money (the
  highlight makes the surprising number jump as it's spoken).
- Add `minimalKurz` (ultra-clean, no pill) as a neutral default.

---

## 6. `SKILL.md` design (the orchestrator — keep it simple)

Unlike `claude-shorts`' 10 steps, yours is ~4:

```
Trigger:  /caption <file>     (Mode A)
          /caption            then provide clips + narration (Mode B)

1. INPUT
   - Mode A: take the one mp4.
   - Mode B: collect 6–7 clips + narration → render Stitch.tsx into one video.
2. TRANSCRIBE
   - run scripts/transcribe.py → words.json
   - (optional) if a script .txt is provided, run align.py for exact words.
   - QUALITY GATE: show the transcript, confirm numbers/names vs the known script.
3. STYLE
   - ask for styleName + any option overrides (or read a default from config).
4. RENDER + EXPORT
   - render.mjs → CaptionedShort.tsx with the chosen props → mp4
   - scripts/export.sh → YouTube preset → final.mp4
   - output path + done.
```

No candidate table, no segment picking, no reframe prompts. Plain and fast.

---

## 7. The core render — why it never crops

`CaptionedShort.tsx` is deliberately dumb about the video:
```tsx
// concept, not final code
<AbsoluteFill>
  <OffthreadVideo src={inputVideo} />        {/* full frame, 1080×1920, untouched */}
  <CaptionLayer pages={pages} style={style} /> {/* captions on top */}
  {showProgressBar && <ProgressBar />}
  {hookText && <HookOverlay text={hookText} durationSec={hookDurationSec} />}
</AbsoluteFill>
```
Because there's no `VideoFrame` crop/pan and no reframe step, the source frame is
passed through exactly as Flow made it. The crop problem from `claude-shorts`
literally cannot happen — the code that did it isn't in the project.

---

## 8. Number accuracy — transcribe, then check against your script (DECIDED)

Your narration is **Flow's voice mixed with SFX**, so whisper transcribes the mixed
audio. That works well, but on a money channel a misheard number is fatal — and the
fix is built in, because you already write the exact script for every Short.

**The path (use this):** whisper auto-transcribes → compare `words.json` against your
written script → fix any wrong word/number → render. A 5-second check, perfect captions.

*Optional, only if you ever switch to separate **TTS** audio:* `align.py` forced
alignment — feed your known script text + the clean voice track to a forced aligner
(WhisperX / aeneas / gentle) so words come 100% from your text and only the timing
comes from the audio. Overkill for Flow's mixed voice; keep it in your back pocket.

---

## 9. Build order (do it in phases — each ends in something testable)

- **Phase 0 — sanity.** Clone `claude-shorts`, run `setup.sh`, render its demo once.
  Goal: confirm your GPU + Remotion + faster-whisper actually work end-to-end.
- **Phase 1 — scaffold.** Create `curiocade-captions/`, copy `transcribe.py`,
  `export.sh`, the Remotion skeleton (`render.mjs`, `remotion.config.ts`, `Root.tsx`,
  `useCaptionPages.ts`). Trim `requirements.txt` (drop mediapipe/opencv).
- **Phase 2 — passthrough render.** Write `CaptionedShort.tsx` with ONE hardcoded
  style. Render a real Short. **Confirm zero crop/zoom.** (This proves the whole idea.)
- **Phase 3 — your look.** Build `styles.ts` registry + add your fonts + your palette.
  Get `cosmicClean` and `moneyBold` looking right.
- **Phase 4 — options + skill.** Expose props in `types.ts`; write `SKILL.md`; wire
  `/caption <file>` → transcribe → render → export.
- **Phase 5 — optional.** Mode B (`Stitch.tsx`, assembly + captions in one render);
  `align.py` forced alignment.
- **Phase 6 — package.** Finish `setup.sh`/`install.sh`, run on a real Curiocade
  Short start to finish.

After Phase 2 you already have a working captioner. Phases 3+ are polish/scale.

---

## 10. Decisions (1–2 locked; 3 open)

1. **Input mode: ✅ A — one assembled video.** You assemble your 6–7 Flow clips into
   one mp4 and feed that in. (Mode B / `Stitch.tsx` not needed — skip it in Phase 5.)
2. **Narration source: ✅ Flow's own voice → auto-transcribe + verify.** Whisper pulls
   the words + timing straight from the video's audio; you check them against your
   written script and fix any number/name (see §8). No forced alignment needed.
3. **Brand palette + font(s): ⬜ still open.** Drop in your hex codes + font files and
   bake to your brand; otherwise scaffold with placeholders you swap in `styles.ts`.

---

## 11. Dependencies (final)

**Python** (`requirements.txt`): `faster-whisper`, `torch` (CUDA build).
*(No `mediapipe`, no `opencv-python` — those were only for face/cursor tracking.)*

**Node** (`package.json`): `remotion`, `@remotion/captions`, `react`, `react-dom`,
`zod`. (Optionally `@remotion/fonts`.)

**System:** FFmpeg (with NVENC), Node 18+, Python 3.10+, Claude Code CLI,
NVIDIA GPU.

---

## 12. Final step — delete the clone, install your own skill

Once you've copied the COPY set and your `curiocade-captions/` skill is built and
working, the cloned `claude-shorts` repo has done its job — it was only a **parts
bin** to copy from and read. Delete it:

```bash
rm -rf claude-shorts        # no longer needed once the parts are copied
```

What you keep and run is your **own** skill. Install it into Claude Code:

```bash
cd curiocade-captions
bash install.sh             # registers it to ~/.claude/skills/curiocade-captions
```

From then on it's a first-class Claude Code skill — invoke it with `/caption`.
**No dependency on `claude-shorts`, no clipper code, nothing that can crop your
frame.** It lives in your skills folder and changes only when *you* change it.

*(Keep the MIT attribution in the files you copied, as noted in §0 — that's the only
trace of `claude-shorts` that remains, and the license requires it.)*

---

### TL;DR
Clone `claude-shorts` first (§0) and read the real files. Copy: **`transcribe.py`,
`export.sh`, the Remotion skeleton + `useCaptionPages.ts`, the install scripts.**
Build fresh: **a simple `SKILL.md`, a full-frame `CaptionedShort.tsx` (no crop), a
`styles.ts` registry with your fonts + palette + unlimited styles, and the option
props.** Delete: **content detection, reframe/crop, boundary snapping, segment
scoring, and the mediapipe/opencv deps.** Build in phases — after Phase 2 you have a
working, never-crops captioner. **Then delete the clone** — your `curiocade-captions/`
skill installs into Claude Code (`/caption`) and runs entirely on its own.

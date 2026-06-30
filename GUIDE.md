# Caption Studio — The Easy Guide 🎬

A friendly, no-jargon walkthrough of **everything** this skill can do, and what
every button in the preview window means. Read top to bottom the first time;
after that, use it as a cheat sheet.

---

## 1. What this skill does (in one breath)

You give it a **finished vertical video**. It listens to the audio, figures out
**exactly when each word is said**, and burns **animated captions** onto the video
— the kind where the spoken word lights up. It never crops or zooms your video.
Out comes a ready-to-post `.mp4`.

```
your video  ➜  [Caption Studio]  ➜  same video + animated captions
```

---

## 2. The 3 things it does, in order

1. **Transcribe** — turns the talking into text with precise timings.
2. **Render** — draws the captions on top of your video, in the style you pick.
3. **Export** — saves the final video in YouTube Shorts quality.

That's it. No cropping, no "pick a clip", no complicated steps.

---

## 3. How to caption a video (the simple way)

In Claude Code, just say:

```
/caption-studio "C:\path\to\your video.mp4"
```

Then I (Claude) will:
1. Transcribe it and **show you the words** so you can fix any wrong number/name.
2. Ask which **style** you want (or open the live preview so you can see them).
3. Render + export, and hand you the final file.
4. Delete all the temporary junk automatically.

**You can also just talk to me normally:** "caption this video in the bold green
style with a progress bar" works too.

---

## 4. The live Style Preview (the browser window) 🖥️

This is the window in your screenshot. You open it to **try styles on your own
video before committing**. Launch it with:

```
node remotion/preview.mjs --video "your video.mp4" --captions "words.json"
```

…then open **http://localhost:3000**. Here's every part of that window:

### 🔵 Left side — "Compositions"
A list of the **caption styles** (10 to start: `cosmicClean`, `moneyBold`,
`minimal`, `boldYellow`, `karaokePill`, `neonGlow`, `subtitle`, `outline`,
`hotPink`, `softAmber`). **Click a name to instantly see your video in that
style.** This is the main way to compare looks. All styles place the captions in
the **same spot** (lower-third) — they differ in color, font, outline and
animation. (The "Assets" tab just lists files like your video — ignore it.)

> These 10 are just a starting menu — **you can have unlimited styles.** Ask me to
> add one (e.g. *"make a purple glow style"*) and it appears in this list.

### 🎬 Middle — the video preview
Your actual video with captions on top. Press **Spacebar** to play/pause and
watch the words light up as they're spoken.

### ▶️ Bottom bar — the playback buttons (left → right)

| Button | What it does |
|--------|--------------|
| **−  ●  +** (slider) | Zoom the **timeline** in/out (just the ruler, not your video). |
| **Fit ▾** | How big the video looks in the window. "Fit" = show the whole thing. |
| **1x ▾** | Playback **speed** (0.5x slow-mo, 2x fast, etc.). |
| **⏮** | Jump to the **start**. |
| **◀\|** | Step **back one frame** (tiny step). |
| **▶ / ⏸** | **Play / Pause** (or press Spacebar). |
| **\|▶** | Step **forward one frame**. |
| **⏭** | Jump to the **end**. |
| **🔁** | **Loop** — keep replaying automatically. |
| **🔊** | **Volume / mute** the preview sound. |
| **[**  and  **]** | Set a **start point** and **end point** to loop just one section. |
| **▣ ▢** (blue icons) | Preview display toggles (checkerboard background / fit). You won't need these. |
| **⛶** | **Fullscreen** the preview. |
| **Render** | Remotion's own render button. *Tip: don't use this — just tell me the style and I'll do the full export properly (with YouTube settings + cleanup).* |

### ⏱️ Bottom — the timeline
The strip showing your video frames + the purple **audio waveform**. The **red
line** is where you're currently looking. Click anywhere on it to jump there.
The numbers (e.g. `00:06.08` / `188`) are the current **time** and **frame**.

### ⚙️ Right side — "Inspector" (the options panel)
This is where you fine-tune. Each option is explained in the next section.

> **Important about the Inspector:** next to the optional settings there's a little
> checkbox labeled **"undefined"**. That means "use the style's default." **Tick it
> to turn that option ON and change it.** If a field says *"Union with more than 2
> options not editable"* (that's **position**), don't worry — just tell me where you
> want the captions and I'll set it. You don't have to do everything in this panel;
> the easiest path is: pick a style on the left, then tell me any tweaks in plain
> words.

---

## 5. Every option, explained with examples 🎛️

These are all the things you can change. You can set them in the Inspector, or
just **tell me in words** (much easier).

### `styleName` — the overall look
The big choice. 10 built in (and you can add unlimited more):

| Style | Look |
|-------|------|
| **`cosmicClean`** 🌌 | calm white, active word **blue**, gentle fade |
| **`moneyBold`** 💰 | BIG uppercase, active word **green**, pops |
| **`minimal`** | plain clean white, no highlight |
| **`boldYellow`** ⚡ | hype uppercase, thick outline, active word **yellow** |
| **`karaokePill`** 🎤 | words on a dark rounded **pill**, active word green |
| **`neonGlow`** 🌟 | glowing **cyan** neon, slides up |
| **`subtitle`** 💬 | small, calm, classic captions, no highlight |
| **`outline`** ⬛ | bold white with a heavy **black outline** |
| **`hotPink`** 💗 | playful uppercase, active word **hot pink** |
| **`softAmber`** 🔥 | gentle warm **amber** highlight, fades in |
| **`premiumGold`** 👑 | Montserrat ExtraBold, sentence case, the **key word** in gold ALL-CAPS, centered, subtle pop |

All of them keep the captions in the **same lower-third position**.

> Example: *"use boldYellow"* or *"make a new style like neonGlow but purple"*

### `animation` — how the active word moves
- **`pop`** — springs/scales in (energetic). 
- **`fade`** — gently fades in (calm).
- **`slide`** — slides up into place.
- **`none`** — no movement.

> Example: *"moneyBold but with fade instead of pop"*

### `fontSize` — how big the text is
A number. Bigger = bigger. (e.g. 64 is medium, 76 is large.)

> Example: *"make the text a bit smaller, like 60"*

### `uppercase` — ALL CAPS or not
On = SHOUTING CAPS. Off = normal Case.

> Example: *"turn caps off"*

### `position` — where captions sit
- **lower-third** — near the bottom (subtitle spot).
- **center** — middle of the screen.
- a custom height if you want something specific.

> Example: *"put the captions in the center"*

### `highlightActiveWord` — light up the spoken word
On = the current word changes color as it's said. Off = all words same color.

> Example: *"don't highlight, keep all words white"*

### `showPill` — background bubble behind text
On = a rounded shaded box behind the words (helps readability on busy video).
Off = just text with a shadow.

> Example: *"add a dark pill behind the captions"*

### `maxWordsPerLine` / `maxLines` — how many words show at once
Controls how the words are grouped on screen. Fewer words per line = bigger,
punchier bursts.

> Example: *"show max 3 words per line"*

### `combineMs` — how words are grouped over time
Words spoken within this many **milliseconds** get shown together as one "card."
Smaller number = words flip faster, one or two at a time. Bigger = longer phrases.

> Example: *"flip the words faster"* (I'd lower combineMs)

### `keyWords` — the gold payoff word (premiumGold style)
Name the **one important word** (or a few) per video. In the `premiumGold` style
those words render in fixed brand **gold + ALL-CAPS** with a bigger pop, while
everything else stays white. The tool can't guess your payoff word, so you tell it.

> Example: *"premiumGold, key word 'tenth'"* → "Only a **TENTH** is really there."

### `showProgressBar` — a progress line
On = a thin bar at the bottom that fills up as the video plays (tells viewers how
much is left). Off by default for a clean look.

> Example: *"add a progress bar"*

### `hookText` + `hookDurationSec` — opening title
Type a punchy opening line (like **"YOU WON'T BELIEVE THIS"**) and it appears big
at the very start. `hookDurationSec` = how many seconds it stays (default 3.5).

> Example: *"add a hook that says 'WATCH TILL THE END' for the first 3 seconds"*

---

## 6. Making it YOUR brand 🎨

Right now the colors and font are **placeholders** (a free font called Inter +
sample colors). To make it truly yours, give me either of these and I'll bake them
in (they'll then show in the preview too):

- **Your colors** — just send hex codes, e.g. *"active word should be #00E0A4,
  base text white."*
- **Your font** — send me a `.woff2` or `.ttf` file and the name.

You can also make **brand-new styles** (unlimited!) — e.g. *"make a style called
'scienceGlow' with a soft blue glow and rounded font."*

---

## 7. Where your files go, and temp cleanup 🧹

- The **final video** is saved next to your input, named like
  `yourvideo-captioned.mp4`. **This is the only file kept.**
- The transcript and the in-between render are written to a **temp folder and
  deleted automatically** after a successful export.
- The preview copies your video in to show it; that copy is **removed when you
  close the preview** (Ctrl+C in the terminal).

So you never end up with junk files lying around.

---

## 8. Quick fixes 🔧

| Problem | Fix |
|---------|-----|
| A **number or name is wrong** in the captions | Tell me the right word — I edit it and re-render. |
| Captions feel **too fast / slow** | Ask me to change `combineMs`. |
| Text is **too big / small** | Ask me to change `fontSize`. |
| It used the **CPU** and felt slow | Normal without CUDA installed; still works fine for short videos. |
| Preview shows **no captions** | Make sure it was launched with `--captions words.json` (I handle this for you). |

---

## 9. Cheat sheet 📋

```
Caption a video:     /caption-studio "video.mp4"
Try styles live:     node remotion/preview.mjs --video "video.mp4" --captions "words.json"
Pick a style:        click cosmicClean / moneyBold / minimal on the left
Play/pause:          Spacebar
Tweak anything:      just tell me in plain words ("bold green, caps off, add progress bar")
Final file:          saved as  <yourvideo>-captioned.mp4
```

**Easiest workflow of all:** give me your video, tell me roughly the vibe you
want, and I'll handle the rest. 🦝

// Render CaptionedShort to an mp4.
//
// Usage:
//   node render.mjs --video /abs/path/input.mp4 --captions /abs/path/words.json \
//                   --output /abs/path/out.mp4 [--style moneyBold] [--hook "Text"] \
//                   [--progress] [--fps 30]
//
// Bundles once, resolves composition metadata, renders with the H.264 codec.

import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import fs from "node:fs";
import { bundle } from "@remotion/bundler";
import { selectComposition, renderMedia } from "@remotion/renderer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const { values } = parseArgs({
  options: {
    video: { type: "string" },
    captions: { type: "string" },
    output: { type: "string" },
    style: { type: "string", default: "curioFacts" },
    keywords: { type: "string", default: "" },
    hook: { type: "string", default: "" },
    "hook-seconds": { type: "string" }, // omit → auto-timed from the transcript (see autoHookSeconds)
    progress: { type: "boolean", default: false },
    fps: { type: "string", default: "30" },
  },
});

function fail(msg) {
  console.error(`error: ${msg}`);
  process.exit(1);
}

if (!values.video) fail("--video is required");
if (!values.captions) fail("--captions is required");
if (!values.output) fail("--output is required");

const videoPath = path.resolve(values.video);
const captionsPath = path.resolve(values.captions);
const outputPath = path.resolve(values.output);

if (!fs.existsSync(videoPath)) fail(`video not found: ${videoPath}`);
if (!fs.existsSync(captionsPath)) fail(`captions not found: ${captionsPath}`);

const transcript = JSON.parse(fs.readFileSync(captionsPath, "utf-8"));
const captions = transcript.captions ?? [];
const fps = Number(values.fps) || 30;
const durationInSeconds =
  transcript.duration ||
  (captions.length ? captions[captions.length - 1].endMs / 1000 : 0);

if (!durationInSeconds) fail("could not determine duration from captions JSON");

/**
 * Auto-time the hook overlay from the transcript: keep it up until the first
 * natural pause in the narration (first inter-word gap > 350ms), so it never cuts
 * off mid-thought or overstays. Clamped to a sane 2–4s. Overridable via --hook-seconds.
 */
function autoHookSeconds(caps) {
  if (!caps || caps.length === 0) return 3.0;
  let endMs = caps[0].endMs;
  for (let i = 1; i < caps.length; i++) {
    if (caps[i].startMs - caps[i - 1].endMs > 350) {
      endMs = caps[i - 1].endMs;
      break;
    }
    endMs = caps[i].endMs;
  }
  return Math.min(4, Math.max(2, endMs / 1000));
}

const hookSeconds =
  values["hook-seconds"] != null
    ? Number(values["hook-seconds"])
    : values.hook
    ? autoHookSeconds(captions)
    : 3.5;

const inputProps = {
  // publicDir below is set to the video's folder, so the component loads it via staticFile(basename).
  videoSrc: path.basename(videoPath),
  captions,
  durationInSeconds,
  fps,
  styleName: values.style,
  keyWords: values.keywords ?? "", // contextual payoff words Claude picks per script (numbers auto-emphasise)
  combineMs: 400, // ~1–2 words per page → punchy near word-by-word (matches curioFacts single-line)
  showProgressBar: Boolean(values.progress),
  hookText: values.hook ?? "",
  hookDurationSec: hookSeconds, // auto-timed from transcript unless --hook-seconds is passed
};

console.log(`[render] bundling…`);
const serveUrl = await bundle({
  entryPoint: path.resolve(__dirname, "src/index.ts"),
  // Let the input video be reachable by the headless browser during render.
  publicDir: path.dirname(videoPath),
});

console.log(`[render] resolving composition…`);
const composition = await selectComposition({
  serveUrl,
  id: "CaptionedShort",
  inputProps,
});

console.log(
  `[render] ${composition.durationInFrames} frames @ ${composition.fps}fps -> ${outputPath}`
);
fs.mkdirSync(path.dirname(outputPath), { recursive: true });

const started = Date.now();
await renderMedia({
  composition,
  serveUrl,
  codec: "h264",
  crf: 18,
  outputLocation: outputPath,
  inputProps,
  chromiumOptions: { gl: "angle" },
  onProgress: ({ progress }) => {
    process.stdout.write(`\r[render] ${(progress * 100).toFixed(0)}%   `);
  },
});

const secs = ((Date.now() - started) / 1000).toFixed(1);
const sizeMb = (fs.statSync(outputPath).size / 1e6).toFixed(1);
console.log(`\n[render] done in ${secs}s — ${sizeMb} MB -> ${outputPath}`);

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
    style: { type: "string", default: "cosmicClean" },
    hook: { type: "string", default: "" },
    "hook-seconds": { type: "string", default: "3.5" },
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

const inputProps = {
  // publicDir below is set to the video's folder, so the component loads it via staticFile(basename).
  videoSrc: path.basename(videoPath),
  captions,
  durationInSeconds,
  fps,
  styleName: values.style,
  combineMs: 800,
  showProgressBar: Boolean(values.progress),
  hookText: values.hook ?? "",
  hookDurationSec: Number(values["hook-seconds"]) || 3.5,
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

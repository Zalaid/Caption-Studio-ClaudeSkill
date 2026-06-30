// Open Remotion Studio (a live browser preview) to COMPARE caption styles on
// YOUR video. Each built-in style appears as its own item in the left sidebar,
// already loaded with your video + captions — just click between them.
//
// Usage:
//   node preview.mjs --video /abs/input.mp4 --captions /abs/words.json
//
// Opens http://localhost:3000. Pick the style you like, then render it for real.
// Temp files it stages are removed automatically when you stop it (Ctrl+C).

import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { parseArgs } from "node:util";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const { values } = parseArgs({
  options: {
    video: { type: "string" },
    captions: { type: "string" },
    port: { type: "string", default: "3000" },
  },
});

function fail(m) {
  console.error(`error: ${m}`);
  process.exit(1);
}
if (!values.video) fail("--video is required");
if (!values.captions) fail("--captions is required");

const videoPath = path.resolve(values.video);
const captionsPath = path.resolve(values.captions);
if (!fs.existsSync(videoPath)) fail(`video not found: ${videoPath}`);
if (!fs.existsSync(captionsPath)) fail(`captions not found: ${captionsPath}`);

const publicDir = path.resolve(__dirname, "public");
fs.mkdirSync(publicDir, { recursive: true });

// Studio (browser) loads local media via staticFile, so copy the video into public/.
const previewName = "preview-source" + path.extname(videoPath);
const previewCopy = path.join(publicDir, previewName);
fs.copyFileSync(videoPath, previewCopy);

const transcript = JSON.parse(fs.readFileSync(captionsPath, "utf-8"));
const captions = transcript.captions ?? [];
const durationInSeconds =
  transcript.duration || (captions.length ? captions[captions.length - 1].endMs / 1000 : 0);

// PreviewRoot.tsx imports this file; one composition per style is built from it.
const dataFile = path.resolve(__dirname, "src/.preview-data.json");
fs.writeFileSync(
  dataFile,
  JSON.stringify({ videoSrc: previewName, captions, durationInSeconds, fps: 30 }, null, 2)
);

const cleanup = () => {
  for (const f of [previewCopy, dataFile]) {
    try {
      if (fs.existsSync(f)) fs.unlinkSync(f);
    } catch {}
  }
};
process.on("exit", cleanup);
process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));

console.log("[preview] Studio starting — open the printed URL, then click each style in the left sidebar.");
console.log(`[preview] ${captions.length} caption words loaded from your video.`);

const args = ["remotion", "studio", "src/preview.ts", `--port=${values.port}`];
const child = spawn("npx", args, { cwd: __dirname, stdio: "inherit", shell: true });
child.on("exit", (code) => process.exit(code ?? 0));

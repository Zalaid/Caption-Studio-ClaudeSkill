// Open Remotion Studio (a live browser preview) with YOUR video + captions
// loaded, so you can flip styles/options in the side panel and watch fonts,
// colors and animations update instantly. Pick a style, then render for real.
//
// Usage:
//   node preview.mjs --video /abs/input.mp4 --captions /abs/words.json [--style moneyBold]
//
// Opens http://localhost:3000 — use the right-hand "Props" panel to try styles.
// Temp files it copies in are removed automatically when you stop it (Ctrl+C).

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
    style: { type: "string", default: "cosmicClean" },
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

const props = {
  videoSrc: previewName,
  captions,
  durationInSeconds,
  fps: 30,
  styleName: values.style,
  combineMs: 800,
  showProgressBar: false,
  hookText: "",
  hookDurationSec: 3.5,
};

const propsFile = path.resolve(__dirname, ".preview-props.json");
fs.writeFileSync(propsFile, JSON.stringify(props, null, 2));

// Clean up the copied media + props file when Studio is stopped.
const cleanup = () => {
  for (const f of [previewCopy, propsFile]) {
    try {
      if (fs.existsSync(f)) fs.unlinkSync(f);
    } catch {}
  }
};
process.on("exit", cleanup);
process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));

console.log("[preview] launching Remotion Studio — open the printed URL, then use the Props panel.");
console.log(`[preview] starting style: ${values.style}`);

const args = ["remotion", "studio", "src/index.ts", `--props=${propsFile}`, `--port=${values.port}`];
const child = spawn("npx", args, { cwd: __dirname, stdio: "inherit", shell: true });
child.on("exit", (code) => process.exit(code ?? 0));

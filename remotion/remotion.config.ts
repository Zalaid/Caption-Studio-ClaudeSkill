import { Config } from "@remotion/cli/config";

// Render settings used by `remotion studio` / `remotion render`.
// render.mjs sets its own values via the @remotion/renderer API.
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setConcurrency(null); // auto

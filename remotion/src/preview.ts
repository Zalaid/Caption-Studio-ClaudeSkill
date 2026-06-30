import { registerRoot } from "remotion";
import { PreviewRoot } from "./PreviewRoot";

// Entry point used only by preview.mjs (style-comparison Studio).
registerRoot(PreviewRoot);

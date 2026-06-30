import { FONTS } from "../styles/fonts";
import type { CaptionAnimation, CaptionPosition } from "../types";

/**
 * A caption style is just a config object. Add as many as you want — there is no
 * limit. Per-video props (styleName + overrides) are merged on top of these.
 */
export type CaptionStyle = {
  font: string;
  fontSize: number;
  fontWeight: number;
  uppercase: boolean;
  letterSpacing: number;
  baseColor: string; // inactive words
  activeColor: string; // the spoken / highlighted word
  stroke?: { color: string; width: number };
  shadow?: string; // CSS text-shadow value
  pill?: { color: string; radius: number; paddingX: number; paddingY: number };
  position: CaptionPosition;
  maxWordsPerLine: number;
  maxLines: number;
  highlightActiveWord: boolean;
  animation: CaptionAnimation;
};

// ---------------------------------------------------------------------------
// TODO (brand): replace the placeholder hex codes below with your real palette.
// These three are starting points — duplicate and tweak to grow the registry.
// ---------------------------------------------------------------------------

export const STYLES: Record<string, CaptionStyle> = {
  // Calm, clean, lower-third. Good default for science / explainer content.
  cosmicClean: {
    font: FONTS.sans,
    fontSize: 64,
    fontWeight: 700,
    uppercase: false,
    letterSpacing: 0,
    baseColor: "#FFFFFF",
    activeColor: "#4EA8FF", // TODO: brand "cosmic blue"
    shadow: "0px 4px 18px rgba(0,0,0,0.55)",
    position: "lower-third",
    maxWordsPerLine: 4,
    maxLines: 2,
    highlightActiveWord: true,
    animation: "fade",
  },

  // Punchy, uppercase, pops the active word. Good for money / hook-driven content.
  moneyBold: {
    font: FONTS.display,
    fontSize: 76,
    fontWeight: 800,
    uppercase: true,
    letterSpacing: 0.5,
    baseColor: "#FFFFFF",
    activeColor: "#2BD96B", // TODO: brand "money green"
    stroke: { color: "#0A0A0A", width: 8 },
    shadow: "0px 6px 22px rgba(0,0,0,0.5)",
    position: "center",
    maxWordsPerLine: 3,
    maxLines: 2,
    highlightActiveWord: true,
    animation: "pop",
  },

  // Ultra-minimal, no pill, no highlight. Neutral fallback.
  minimal: {
    font: FONTS.sans,
    fontSize: 60,
    fontWeight: 600,
    uppercase: false,
    letterSpacing: 0,
    baseColor: "#FFFFFF",
    activeColor: "#FFFFFF",
    shadow: "0px 3px 14px rgba(0,0,0,0.5)",
    position: "lower-third",
    maxWordsPerLine: 5,
    maxLines: 2,
    highlightActiveWord: false,
    animation: "none",
  },
};

export const DEFAULT_STYLE = "cosmicClean";

export function getStyle(name: string): CaptionStyle {
  return STYLES[name] ?? STYLES[DEFAULT_STYLE];
}

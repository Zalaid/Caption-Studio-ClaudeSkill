import { FONTS } from "../styles/fonts";
import type { CaptionAnimation, CaptionPosition } from "../types";

/**
 * A caption style is just a config object. Add as many as you want — there is no
 * limit. Per-video props (styleName + overrides) are merged on top of these.
 *
 * To add a style: copy an entry, rename the key, tweak the values — then add the
 * same key to the `styleName` enum in ../types.ts so it shows up everywhere.
 */
export type CaptionStyle = {
  font: string;
  fontSize: number;
  fontWeight: number;
  uppercase: boolean;
  letterSpacing: number;
  baseColor: string; // inactive words
  activeColor: string; // the spoken / highlighted word
  keyColor?: string; // fixed brand color for designated key words (see keyWords prop)
  stroke?: { color: string; width: number };
  shadow?: string; // CSS text-shadow value (also used to fake a "glow")
  pill?: { color: string; radius: number; paddingX: number; paddingY: number };
  position: CaptionPosition;
  maxWordsPerLine: number;
  maxLines: number;
  highlightActiveWord: boolean;
  animation: CaptionAnimation;
};

// ---------------------------------------------------------------------------
// TODO (brand): swap the placeholder hex codes below for your real palette, and
// FONTS.* for your real fonts. Everything here is starter material — copy freely.
// ---------------------------------------------------------------------------

export const STYLES: Record<string, CaptionStyle> = {
  // 1. Calm, clean, lower-third. Good default for science / explainer content.
  cosmicClean: {
    font: FONTS.sans,
    fontSize: 64,
    fontWeight: 700,
    uppercase: false,
    letterSpacing: 0,
    baseColor: "#FFFFFF",
    activeColor: "#4EA8FF",
    shadow: "0px 4px 18px rgba(0,0,0,0.55)",
    position: "lower-third",
    maxWordsPerLine: 4,
    maxLines: 2,
    highlightActiveWord: true,
    animation: "fade",
  },

  // 2. Punchy, uppercase, pops the active word. Money / hook-driven content.
  moneyBold: {
    font: FONTS.display,
    fontSize: 76,
    fontWeight: 800,
    uppercase: true,
    letterSpacing: 0.5,
    baseColor: "#FFFFFF",
    activeColor: "#2BD96B",
    stroke: { color: "#0A0A0A", width: 8 },
    shadow: "0px 6px 22px rgba(0,0,0,0.5)",
    position: "lower-third",
    maxWordsPerLine: 3,
    maxLines: 2,
    highlightActiveWord: true,
    animation: "pop",
  },

  // 3. Ultra-minimal, no highlight. Neutral fallback.
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

  // 4. Big bold yellow — MrBeast-style hype. Thick outline, active word yellow.
  boldYellow: {
    font: FONTS.display,
    fontSize: 82,
    fontWeight: 800,
    uppercase: true,
    letterSpacing: 0.5,
    baseColor: "#FFFFFF",
    activeColor: "#FFD400",
    stroke: { color: "#000000", width: 10 },
    shadow: "0px 6px 20px rgba(0,0,0,0.6)",
    position: "lower-third",
    maxWordsPerLine: 3,
    maxLines: 2,
    highlightActiveWord: true,
    animation: "pop",
  },

  // 5. Karaoke pill — words sit on a dark rounded bar, active word green.
  karaokePill: {
    font: FONTS.sans,
    fontSize: 62,
    fontWeight: 700,
    uppercase: false,
    letterSpacing: 0,
    baseColor: "#FFFFFF",
    activeColor: "#39E08B",
    pill: { color: "rgba(0,0,0,0.6)", radius: 22, paddingX: 30, paddingY: 16 },
    position: "lower-third",
    maxWordsPerLine: 4,
    maxLines: 2,
    highlightActiveWord: true,
    animation: "fade",
  },

  // 6. Neon glow — cyan glow via shadow, active word cyan. Slides up.
  neonGlow: {
    font: FONTS.display,
    fontSize: 70,
    fontWeight: 800,
    uppercase: true,
    letterSpacing: 1,
    baseColor: "#FFFFFF",
    activeColor: "#27E7FF",
    shadow: "0px 0px 18px rgba(39,231,255,0.9), 0px 0px 36px rgba(39,231,255,0.6)",
    position: "lower-third",
    maxWordsPerLine: 3,
    maxLines: 2,
    highlightActiveWord: true,
    animation: "slide",
  },

  // 7. Classic subtitle — small, calm, no highlight, like normal captions.
  subtitle: {
    font: FONTS.sans,
    fontSize: 50,
    fontWeight: 600,
    uppercase: false,
    letterSpacing: 0,
    baseColor: "#FFFFFF",
    activeColor: "#FFFFFF",
    shadow: "0px 2px 10px rgba(0,0,0,0.7)",
    position: "lower-third",
    maxWordsPerLine: 7,
    maxLines: 2,
    highlightActiveWord: false,
    animation: "none",
  },

  // 8. Thick outline — bold white with a heavy black outline. Reads on anything.
  outline: {
    font: FONTS.display,
    fontSize: 74,
    fontWeight: 800,
    uppercase: true,
    letterSpacing: 0.5,
    baseColor: "#FFFFFF",
    activeColor: "#FFFFFF",
    stroke: { color: "#000000", width: 12 },
    shadow: "0px 4px 16px rgba(0,0,0,0.5)",
    position: "lower-third",
    maxWordsPerLine: 3,
    maxLines: 2,
    highlightActiveWord: false,
    animation: "pop",
  },

  // 9. Hot pink — playful, uppercase, active word hot pink, pops.
  hotPink: {
    font: FONTS.display,
    fontSize: 76,
    fontWeight: 800,
    uppercase: true,
    letterSpacing: 0.5,
    baseColor: "#FFFFFF",
    activeColor: "#FF2D9B",
    stroke: { color: "#1A1A1A", width: 8 },
    shadow: "0px 6px 22px rgba(0,0,0,0.5)",
    position: "lower-third",
    maxWordsPerLine: 3,
    maxLines: 2,
    highlightActiveWord: true,
    animation: "pop",
  },

  // 11. Premium Gold — brand spec: Montserrat ExtraBold, sentence case with the
  // ONE key word in ALL-CAPS + fixed gold, white elsewhere, subtle pop, centered.
  premiumGold: {
    font: FONTS.premium,
    fontSize: 140, // ~8% of a 1920px-tall frame
    fontWeight: 800,
    uppercase: false, // sentence case; only key words go ALL-CAPS
    letterSpacing: 0,
    baseColor: "#FFFFFF",
    activeColor: "#FFFFFF", // active word stays white (subtle pop only)
    keyColor: "#F5C518", // fixed brand gold for the key word
    stroke: { color: "#0A0A0A", width: 2 }, // thin, clean — not a cartoon outline
    shadow: "0px 4px 18px rgba(0,0,0,0.45)", // soft drop shadow
    position: "lower-third", // anchored just above the Shorts UI bar
    maxWordsPerLine: 3,
    maxLines: 2,
    highlightActiveWord: false,
    animation: "softPop",
  },

  // 12. Curio Facts — the research-backed winner for facts / curiosity Shorts.
  // Distilled from 20 high-view Shorts (RealLifeLore, InfographicsShow, Kurzgesagt,
  // ColdFusion, SciShow): white Montserrat ExtraBold, SENTENCE case (what the big
  // channels actually do for the body — caps is only for the hook), 1–3 words on a
  // SINGLE line, thick black outline that reads on any footage, centered lower-third,
  // word-by-word pop. The ONE payoff word/number turns yellow — set it via the
  // `keyWords` prop. Pair with a big ALL-CAPS `hookText` for the first ~3 seconds.
  curioFacts: {
    font: FONTS.premium, // Montserrat ExtraBold, fallback Inter
    fontSize: 140, // ~7.3% of a 1920px frame — the viral-facts band (RealLifeLore / InfographicsShow run 7–9%)
    fontWeight: 800,
    uppercase: false, // sentence case body; only the key word / hook go caps
    letterSpacing: 0,
    baseColor: "#FFFFFF",
    activeColor: "#FFFFFF", // no karaoke colour-sweep — words simply pop in
    keyColor: "#FFD400", // the one payoff word/number goes brand yellow
    stroke: { color: "#000000", width: 10 }, // thick outline — legible over maps / b-roll
    shadow: "0px 5px 20px rgba(0,0,0,0.55)", // soft drop shadow underneath
    position: "lower-third", // ~75% down, clear of the Shorts UI bar
    maxWordsPerLine: 2, // big text stays on one line — the punchy 1–2 word viral look
    maxLines: 1, // single line = the punchy 1–2 word look
    highlightActiveWord: false,
    animation: "pop", // snappy word-by-word reveal
  },

  // 10. Soft amber — gentle, warm highlight, fades in. Cozy / storytelling.
  softAmber: {
    font: FONTS.sans,
    fontSize: 64,
    fontWeight: 700,
    uppercase: false,
    letterSpacing: 0,
    baseColor: "#FFFFFF",
    activeColor: "#FFB347",
    shadow: "0px 4px 18px rgba(0,0,0,0.55)",
    position: "lower-third",
    maxWordsPerLine: 4,
    maxLines: 2,
    highlightActiveWord: true,
    animation: "fade",
  },
};

export const DEFAULT_STYLE = "curioFacts";

export function getStyle(name: string): CaptionStyle {
  return STYLES[name] ?? STYLES[DEFAULT_STYLE];
}

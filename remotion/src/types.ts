import { z } from "zod";

/** A single word with millisecond timing — matches transcribe.py's `captions` array. */
export const captionSchema = z.object({
  text: z.string(),
  startMs: z.number(),
  endMs: z.number(),
});
export type Caption = z.infer<typeof captionSchema>;

export const positionSchema = z.union([
  z.literal("lower-third"),
  z.literal("center"),
  z.object({ y: z.number() }), // absolute Y in pixels from the top
]);
export type CaptionPosition = z.infer<typeof positionSchema>;

export const animationSchema = z.enum(["pop", "softPop", "fade", "slide", "none"]);
export type CaptionAnimation = z.infer<typeof animationSchema>;

/**
 * Props for the CaptionedShort composition.
 * Everything except `videoSrc`, `captions` and `durationInSeconds` is optional —
 * the named style supplies defaults, and any field set here overrides the style.
 */
export const captionedShortSchema = z.object({
  // Required inputs
  videoSrc: z.string(), // absolute path or URL to the finished 1080x1920 video
  captions: z.array(captionSchema).default([]),
  durationInSeconds: z.number().default(0),
  fps: z.number().default(30),

  // Style selection. Keep this list in sync with the keys in captions/styles.ts —
  // using an enum makes Remotion Studio render a dropdown so you can flip styles
  // live in the browser.
  styleName: z
    .enum([
      "cosmicClean",
      "moneyBold",
      "minimal",
      "boldYellow",
      "karaokePill",
      "neonGlow",
      "subtitle",
      "outline",
      "hotPink",
      "softAmber",
      "premiumGold",
    ])
    .default("cosmicClean"),

  // One or more "key words" (comma/space separated). In styles that define a key
  // color (e.g. premiumGold), these words render in the brand color + ALL-CAPS with
  // a bigger pop — the editorial payoff word. Other styles ignore this.
  keyWords: z.string().default(""),

  // Per-video overrides (optional — leave undefined to use the style's value)
  position: positionSchema.optional(),
  fontSize: z.number().optional(),
  uppercase: z.boolean().optional(),
  maxWordsPerLine: z.number().optional(),
  maxLines: z.number().optional(),
  highlightActiveWord: z.boolean().optional(),
  showPill: z.boolean().optional(),
  animation: animationSchema.optional(),

  // Caption grouping: words within this many ms are grouped onto one page.
  combineMs: z.number().default(800),

  // Overlays
  showProgressBar: z.boolean().default(false),
  hookText: z.string().default(""),
  hookDurationSec: z.number().default(3.5),
});

export type CaptionedShortProps = z.infer<typeof captionedShortSchema>;

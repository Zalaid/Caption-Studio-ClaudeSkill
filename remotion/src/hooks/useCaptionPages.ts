import { useMemo } from "react";
import { createTikTokStyleCaptions } from "@remotion/captions";
import type { Caption } from "../types";

/**
 * Groups word-level captions into "pages" (the small bursts of words shown on
 * screen at once) using @remotion/captions. Words spoken within `combineMs` of
 * each other land on the same page.
 *
 * Returns pages: { text, startMs, durationMs, tokens: [{ text, fromMs, toMs }] }
 */
export const useCaptionPages = (captions: Caption[], combineMs = 800) => {
  return useMemo(() => {
    if (!captions || captions.length === 0) return [];

    const remotionCaptions = captions.map((c) => ({
      text: c.text.startsWith(" ") ? c.text : ` ${c.text}`,
      startMs: c.startMs,
      endMs: c.endMs,
      timestampMs: null as number | null,
      confidence: null as number | null,
    }));

    const { pages } = createTikTokStyleCaptions({
      captions: remotionCaptions,
      combineTokensWithinMilliseconds: combineMs,
    });

    return pages;
  }, [captions, combineMs]);
};

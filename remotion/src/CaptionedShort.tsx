import React, { useMemo } from "react";
import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";
import { CaptionLayer, normalizeWord } from "./captions/CaptionLayer";
import { getStyle, type CaptionStyle } from "./captions/styles";
import { useCaptionPages } from "./hooks/useCaptionPages";
import { HookOverlay } from "./overlays/HookOverlay";
import { ProgressBar } from "./overlays/ProgressBar";
import type { CaptionedShortProps } from "./types";

const DEFAULT_PILL = { color: "rgba(0,0,0,0.55)", radius: 18, paddingX: 28, paddingY: 14 };

/**
 * Merge per-video prop overrides on top of the named style. Anything left
 * undefined falls back to the style's value.
 */
function resolveStyle(base: CaptionStyle, props: CaptionedShortProps): CaptionStyle {
  const s: CaptionStyle = { ...base };
  if (props.position !== undefined) s.position = props.position;
  if (props.fontSize !== undefined) s.fontSize = props.fontSize;
  if (props.uppercase !== undefined) s.uppercase = props.uppercase;
  if (props.maxWordsPerLine !== undefined) s.maxWordsPerLine = props.maxWordsPerLine;
  if (props.maxLines !== undefined) s.maxLines = props.maxLines;
  if (props.highlightActiveWord !== undefined) s.highlightActiveWord = props.highlightActiveWord;
  if (props.animation !== undefined) s.animation = props.animation;
  if (props.showPill !== undefined) {
    s.pill = props.showPill ? base.pill ?? DEFAULT_PILL : undefined;
  }
  return s;
}

export const CaptionedShort: React.FC<CaptionedShortProps> = (props) => {
  const { videoSrc, captions, combineMs, showProgressBar, hookText, hookDurationSec } = props;

  const style = useMemo(() => resolveStyle(getStyle(props.styleName), props), [props]);
  const pages = useCaptionPages(captions, combineMs);
  const keyWords = useMemo(
    () => (props.keyWords || "").split(/[,\s]+/).map(normalizeWord).filter(Boolean),
    [props.keyWords]
  );

  const src = videoSrc.startsWith("http") ? videoSrc : staticFile(videoSrc);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* Full frame, untouched. No crop, no pan, no reframe. */}
      <OffthreadVideo src={src} />

      <CaptionLayer pages={pages} style={style} keyWords={keyWords} />

      {showProgressBar && <ProgressBar />}

      {hookText ? <HookOverlay text={hookText} durationSec={hookDurationSec} font={style.font} /> : null}
    </AbsoluteFill>
  );
};

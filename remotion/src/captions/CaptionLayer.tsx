import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { CaptionStyle } from "./styles";
import type { CaptionPosition } from "../types";

type Page = {
  text: string;
  startMs: number;
  durationMs: number;
  tokens: { text: string; fromMs: number; toMs: number }[];
};

type Props = {
  pages: Page[];
  style: CaptionStyle;
  keyWords?: string[]; // normalized (see normalizeWord)
};

/** Lowercase + strip punctuation/whitespace so "VANISHES." matches "vanishes". */
export function normalizeWord(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function positionStyle(position: CaptionPosition): React.CSSProperties {
  if (position === "center") {
    return { justifyContent: "center", paddingBottom: 0 };
  }
  if (position === "lower-third") {
    return { justifyContent: "flex-end", paddingBottom: 320 };
  }
  return { justifyContent: "flex-start", paddingTop: position.y };
}

function chunk<T>(arr: T[], size: number): T[][] {
  if (!size || size < 1) return [arr];
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

const Word: React.FC<{
  token: { text: string; fromMs: number; toMs: number };
  active: boolean;
  isKey: boolean;
  style: CaptionStyle;
  fps: number;
  currentMs: number;
}> = ({ token, active, isKey, style, fps, currentMs }) => {
  const frame = useCurrentFrame();
  const sinceStart = frame - (token.fromMs / 1000) * fps;
  const anim = style.animation;

  let transform = "none";
  let opacity = 1;
  const peak = isKey ? 1.12 : 1.05; // key word pops a little bigger

  if (anim === "pop" && active) {
    const s = spring({ frame: sinceStart, fps, config: { damping: 12, stiffness: 180 } });
    const scale = interpolate(s, [0, 1], [0.7, isKey ? 1.14 : 1.1], { extrapolateRight: "clamp" });
    transform = `scale(${scale})`;
  } else if (anim === "softPop") {
    // Subtle, no bounce: ease up to the peak while the word is active.
    const scale = active
      ? interpolate(sinceStart, [0, 5], [1, peak], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
      : 1;
    transform = `scale(${scale})`;
  } else if (anim === "slide" && active) {
    const y = interpolate(sinceStart, [0, 6], [18, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    transform = `translateY(${y}px)`;
  } else if (anim === "fade") {
    opacity = active
      ? 1
      : interpolate(currentMs, [token.fromMs - 120, token.fromMs], [0.55, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
  }

  // Color: a designated key word (in a style that defines keyColor) flips to the
  // brand color once it's spoken and stays there. Otherwise, optional active-word
  // highlight, else the base color.
  const treatAsKey = isKey && Boolean(style.keyColor);
  let color = style.baseColor;
  if (treatAsKey && currentMs >= token.fromMs) {
    color = style.keyColor as string;
  } else if (style.highlightActiveWord && active) {
    color = style.activeColor;
  }

  const upper = treatAsKey || style.uppercase;

  return (
    <span
      style={{
        display: "inline-block",
        color,
        transform,
        opacity,
        transition: "color 90ms linear",
        WebkitTextStroke: style.stroke ? `${style.stroke.width}px ${style.stroke.color}` : undefined,
        paintOrder: "stroke fill",
      }}
    >
      {upper ? token.text.toUpperCase() : token.text}
    </span>
  );
};

export const CaptionLayer: React.FC<Props> = ({ pages, style, keyWords = [] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentMs = (frame / fps) * 1000;

  const page = pages.find((p) => currentMs >= p.startMs && currentMs < p.startMs + p.durationMs);
  if (!page) return null;

  const maxLines = style.maxLines && style.maxLines > 0 ? style.maxLines : Infinity;
  const lines = chunk(page.tokens, style.maxWordsPerLine).slice(0, maxLines);

  const textBlock = (
    <div
      style={{
        maxWidth: 980,
        textAlign: "center",
        fontFamily: style.font,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        letterSpacing: style.letterSpacing,
        lineHeight: 1.15,
        textShadow: style.shadow,
        ...(style.pill
          ? {
              backgroundColor: style.pill.color,
              borderRadius: style.pill.radius,
              padding: `${style.pill.paddingY}px ${style.pill.paddingX}px`,
            }
          : {}),
      }}
    >
      {lines.map((lineTokens, li) => (
        <div key={li} style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 0.28em" }}>
          {lineTokens.map((token, ti) => {
            const active = currentMs >= token.fromMs && currentMs < token.toMs;
            const isKey = keyWords.includes(normalizeWord(token.text));
            return (
              <Word
                key={`${li}-${ti}`}
                token={token}
                active={active}
                isKey={isKey}
                style={style}
                fps={fps}
                currentMs={currentMs}
              />
            );
          })}
        </div>
      ))}
    </div>
  );

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingLeft: 50,
        paddingRight: 50,
        ...positionStyle(style.position),
      }}
    >
      {textBlock}
    </AbsoluteFill>
  );
};

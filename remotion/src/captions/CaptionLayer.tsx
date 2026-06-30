import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { CaptionStyle } from "./styles";
import type { CaptionAnimation, CaptionPosition } from "../types";

type Page = {
  text: string;
  startMs: number;
  durationMs: number;
  tokens: { text: string; fromMs: number; toMs: number }[];
};

type Props = {
  pages: Page[];
  style: CaptionStyle;
};

function positionStyle(position: CaptionPosition): React.CSSProperties {
  if (position === "center") {
    return { justifyContent: "center", paddingBottom: 0 };
  }
  if (position === "lower-third") {
    return { justifyContent: "flex-end", paddingBottom: 320 };
  }
  // absolute Y from the top
  return { justifyContent: "flex-start", paddingTop: position.y };
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

const Word: React.FC<{
  token: { text: string; fromMs: number; toMs: number };
  active: boolean;
  style: CaptionStyle;
  animation: CaptionAnimation;
  fps: number;
  currentMs: number;
}> = ({ token, active, style, animation, fps, currentMs }) => {
  const frame = useCurrentFrame();

  // Progress since this word started being spoken (for entrance animations).
  const wordStartFrame = (token.fromMs / 1000) * fps;
  const sinceStart = frame - wordStartFrame;

  let transform = "none";
  let opacity = 1;

  if (animation === "pop" && active) {
    const s = spring({ frame: sinceStart, fps, config: { damping: 12, stiffness: 180 } });
    const scale = interpolate(s, [0, 1], [0.7, 1.12], { extrapolateRight: "clamp" });
    transform = `scale(${Math.min(scale, 1.12)})`;
  } else if (animation === "slide" && active) {
    const y = interpolate(sinceStart, [0, 6], [18, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    transform = `translateY(${y}px)`;
  } else if (animation === "fade") {
    opacity = active
      ? 1
      : interpolate(currentMs, [token.fromMs - 120, token.fromMs], [0.55, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
  }

  const color = style.highlightActiveWord && active ? style.activeColor : style.baseColor;

  return (
    <span
      style={{
        display: "inline-block",
        color,
        transform,
        opacity,
        transition: "color 80ms linear",
        WebkitTextStroke: style.stroke ? `${style.stroke.width}px ${style.stroke.color}` : undefined,
        paintOrder: "stroke fill",
      }}
    >
      {style.uppercase ? token.text.toUpperCase() : token.text}
    </span>
  );
};

export const CaptionLayer: React.FC<Props> = ({ pages, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentMs = (frame / fps) * 1000;

  const page = pages.find((p) => currentMs >= p.startMs && currentMs < p.startMs + p.durationMs);
  if (!page) return null;

  const lines = chunk(page.tokens, style.maxWordsPerLine).slice(0, style.maxLines);

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
            return (
              <Word
                key={`${li}-${ti}`}
                token={token}
                active={active}
                style={style}
                animation={style.animation}
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

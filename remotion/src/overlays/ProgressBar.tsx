import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Thin bottom progress bar. Off by default (showProgressBar prop) to keep the
 * clean look; toggle on per video.
 */
export const ProgressBar: React.FC<{ color?: string; height?: number }> = ({
  color = "#FFFFFF",
  height = 8,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const pct = Math.min(1, frame / Math.max(1, durationInFrames - 1));

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end" }}>
      <div style={{ width: "100%", height, backgroundColor: "rgba(255,255,255,0.18)" }}>
        <div style={{ width: `${pct * 100}%`, height: "100%", backgroundColor: color }} />
      </div>
    </AbsoluteFill>
  );
};

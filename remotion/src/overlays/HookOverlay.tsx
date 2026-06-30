import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

/**
 * Frame-one hook line. Shows for the first `durationSec`, then fades out.
 * Feed it the opening line of the Short.
 */
export const HookOverlay: React.FC<{
  text: string;
  durationSec: number;
  font: string;
}> = ({ text, durationSec, font }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const endFrame = durationSec * fps;
  if (frame > endFrame + fps) return null; // fully gone

  const enter = spring({ frame, fps, config: { damping: 14, stiffness: 160 } });
  const scale = interpolate(enter, [0, 1], [0.8, 1], { extrapolateRight: "clamp" });
  const exitOpacity = interpolate(frame, [endFrame, endFrame + fps * 0.5], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 60 }}>
      <div
        style={{
          opacity: enter * exitOpacity,
          transform: `scale(${scale})`,
          fontFamily: font,
          fontSize: 88,
          fontWeight: 900,
          color: "#FFFFFF",
          textAlign: "center",
          lineHeight: 1.1,
          textShadow: "0px 8px 30px rgba(0,0,0,0.6)",
          WebkitTextStroke: "3px rgba(0,0,0,0.4)",
          paintOrder: "stroke fill",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

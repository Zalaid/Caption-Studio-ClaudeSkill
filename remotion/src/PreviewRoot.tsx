import React from "react";
import { Composition } from "remotion";
import { CaptionedShort } from "./CaptionedShort";
import { captionedShortSchema, type CaptionedShortProps } from "./types";
import { STYLES } from "./captions/styles";
import data from "./.preview-data.json";

// Preview-only Root: registers ONE composition per style, all loaded with your
// real video + captions. Open it via `node preview.mjs` and click each style in
// the left sidebar to compare looks. (The normal render uses Root.tsx instead.)

const WIDTH = 1080;
const HEIGHT = 1920;

type PreviewData = {
  videoSrc: string;
  captions: { text: string; startMs: number; endMs: number }[];
  durationInSeconds: number;
  fps: number;
};

export const PreviewRoot: React.FC = () => {
  const base = data as PreviewData;
  const fps = base.fps || 30;
  const frames = Math.max(1, Math.ceil((base.durationInSeconds || 0) * fps));

  return (
    <>
      {Object.keys(STYLES).map((name) => (
        <Composition
          key={name}
          id={name}
          component={CaptionedShort}
          schema={captionedShortSchema}
          width={WIDTH}
          height={HEIGHT}
          fps={fps}
          durationInFrames={frames}
          defaultProps={{
            videoSrc: base.videoSrc,
            captions: base.captions,
            durationInSeconds: base.durationInSeconds,
            fps,
            styleName: name as CaptionedShortProps["styleName"],
            combineMs: 800,
            showProgressBar: false,
            hookText: "",
            hookDurationSec: 3.5,
          }}
        />
      ))}
    </>
  );
};

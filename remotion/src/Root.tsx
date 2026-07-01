import React from "react";
import { Composition } from "remotion";
import { CaptionedShort } from "./CaptionedShort";
import { captionedShortSchema } from "./types";

const WIDTH = 1080;
const HEIGHT = 1920;

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="CaptionedShort"
      component={CaptionedShort}
      schema={captionedShortSchema}
      width={WIDTH}
      height={HEIGHT}
      // Real values come from calculateMetadata; these are studio fallbacks.
      fps={30}
      durationInFrames={300}
      defaultProps={{"videoSrc":"","captions":[],"durationInSeconds":5,"fps":30,"styleName":"curioFacts" as const,"keyWords":"","combineMs":300,"showProgressBar":false,"hookText":"","hookDurationSec":3.5,"maxWordsPerLine":2,"position":"lower-third" as const,"fontSize":140,"uppercase":false,"maxLines":1,"highlightActiveWord":false,"animation":"pop" as const}}
      calculateMetadata={({ props }) => {
        const fps = props.fps || 30;
        const seconds = props.durationInSeconds || 0;
        const durationInFrames = Math.max(1, Math.ceil(seconds * fps));
        return { durationInFrames, fps, width: WIDTH, height: HEIGHT };
      }}
    />
  );
};

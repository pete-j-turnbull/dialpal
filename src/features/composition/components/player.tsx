import { useCallback } from "react";
import { Player as RemotionPlayer, RenderPoster } from "@remotion/player";
import { Composition } from "@packages/render-engine/components/composition";

import { AbsoluteFill } from "remotion";

import { useComposition } from "../context";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  includeOverlay?: boolean;
  fullScreen?: boolean;
};

const Spinner = (props: Props) => {
  const { className, includeOverlay } = props;

  const spinner = (
    <svg
      className={cn(
        includeOverlay ? "" : className,
        "animate-spin -ml-1 mr-3 h-10 w-10 text-primary"
      )}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );

  return includeOverlay ? (
    <div
      className={cn(
        className,
        "inset-0 flex justify-center items-center z-50 bg-tint-inverted/50",
        {
          fixed: props.fullScreen,
          absolute: !props.fullScreen,
        }
      )}
    >
      {spinner}
    </div>
  ) : (
    spinner
  );
};

export const Player = (props: {
  className?: string;
  style?: React.CSSProperties;
}) => {
  const { className, style } = props;
  const { durationInFrames, playerRef, composition } = useComposition();

  const renderPoster: RenderPoster = useCallback(({ isBuffering }) => {
    if (isBuffering) {
      return (
        <AbsoluteFill
          style={{ justifyContent: "center", alignItems: "center" }}
        >
          <Spinner />
        </AbsoluteFill>
      );
    }

    return null;
  }, []);

  return (
    <RemotionPlayer
      ref={playerRef}
      component={Composition}
      acknowledgeRemotionLicense
      durationInFrames={durationInFrames}
      compositionWidth={composition.width}
      compositionHeight={composition.height}
      style={style}
      fps={composition.fps}
      controls={false}
      showPosterWhenBuffering
      renderPoster={renderPoster}
      inputProps={composition}
      className={className}
    />
  );
};

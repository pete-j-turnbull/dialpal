import { createContext, PropsWithChildren, useContext, useMemo } from "react";
import type { CompositionData } from "@packages/render-engine/types";
import {
  PlayerDataProvider,
  usePlayerActions,
  usePlayerData,
  usePlayerRef,
} from "./remotion";
import { msToFrames } from "@packages/render-engine/helpers";

type ContextType = {
  composition: CompositionData;
};

const Context = createContext<ContextType>({} as ContextType);

type CompositionProviderProps = PropsWithChildren<{
  composition: CompositionData;
}>;

export const CompositionProvider = (props: CompositionProviderProps) => {
  const { composition } = props;

  const durationInFrames = useMemo(
    () => Math.max(msToFrames(composition.duration, composition.fps), 1),
    [composition.duration, composition.fps]
  );

  const contextValue = useMemo<ContextType>(
    () => ({ composition }),
    [composition]
  );

  return (
    <PlayerDataProvider
      fps={composition.fps}
      durationInFrames={durationInFrames}
    >
      <Context.Provider value={contextValue}>{props.children}</Context.Provider>
    </PlayerDataProvider>
  );
};

export const useComposition = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error("useComposition must be used within a CompositionProvider");
  }

  const playerRef = usePlayerRef();
  const { durationInFrames, isPlaying, frame, playtime, duration } =
    usePlayerData();
  const { play, pause, seekTo } = usePlayerActions();

  return {
    ...context,
    playerRef,
    durationInFrames,
    isPlaying,
    frame,
    playtime,
    duration,
    play,
    pause,
    seekTo,
  };
};

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useRef,
  useSyncExternalStore,
} from "react";
import { CallbackListener, PlayerRef } from "@remotion/player";
import { framesToMs } from "@packages/render-engine/helpers";

type PlayerDataContextType = {
  playerRef: React.RefObject<PlayerRef | null>;
  fps: number;
  durationInFrames: number;
};

const PlayerDataContext = createContext<PlayerDataContextType>(
  {} as PlayerDataContextType
);

export const PlayerDataProvider = (
  props: PropsWithChildren<{
    fps: number;
    durationInFrames: number;
  }>
) => {
  const { children, fps, durationInFrames } = props;

  const playerRef = useRef<PlayerRef>(null);

  return (
    <PlayerDataContext.Provider
      value={{
        playerRef,
        fps,
        durationInFrames,
      }}
    >
      {children}
    </PlayerDataContext.Provider>
  );
};

export const usePlayerData = () => {
  const context = useContext(PlayerDataContext);

  if (!context) {
    throw new Error("usePlayerData must be used within a PlayerDataProvider");
  }

  const { playerRef, fps, durationInFrames } = context;

  const isPlaying = useIsPlaying(playerRef);
  const frame = useCurrentPlayerFrame(playerRef);

  const playtime = framesToMs(frame, fps);
  const duration = framesToMs(durationInFrames, fps);

  return {
    isPlaying,
    durationInFrames,
    frame,
    playtime,
    duration,
  };
};

export const usePlayerRef = () => {
  const context = useContext(PlayerDataContext);

  if (!context) {
    throw new Error("usePlayerRef must be used within a PlayerDataProvider");
  }

  return context.playerRef;
};

export const usePlayerActions = () => {
  const context = useContext(PlayerDataContext);

  if (!context) {
    throw new Error(
      "usePlayerActions must be used within a PlayerDataProvider"
    );
  }

  const seekTo = useCallback(
    (frame: number) => {
      context.playerRef.current?.seekTo(frame);
    },
    [context.playerRef]
  );

  // const onVolumeChange = useCallback(
  //   (volume: number) => {
  //     context.playerRef.current?.setVolume(volume / 100);
  //     context.setVolume(volume);
  //   },
  //   [context.playerRef],
  // );

  return {
    play: () => context.playerRef.current?.play(),
    pause: () => context.playerRef.current?.pause(),
    seekTo,
  };
};

export const useCurrentPlayerFrame = (
  ref: React.RefObject<PlayerRef | null>
) => {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const { current } = ref;
      if (!current) {
        return () => undefined;
      }
      const updater: CallbackListener<"frameupdate"> = () => {
        onStoreChange();
      };
      current.addEventListener("frameupdate", updater);
      return () => {
        current.removeEventListener("frameupdate", updater);
      };
    },
    [ref]
  );

  const data = useSyncExternalStore<number>(
    subscribe,
    () => ref.current?.getCurrentFrame() ?? 0
  );

  return data;
};

export const useIsPlaying = (playerRef: React.RefObject<PlayerRef | null>) => {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const { current } = playerRef;
      if (!current) {
        return () => undefined;
      }

      const onPlay = () => onStoreChange();
      const onPause = () => onStoreChange();

      current.addEventListener("play", onPlay);
      current.addEventListener("pause", onPause);

      return () => {
        current.removeEventListener("play", onPlay);
        current.removeEventListener("pause", onPause);
      };
    },
    [playerRef]
  );

  const isPlaying = useSyncExternalStore(
    subscribe,
    () => playerRef.current?.isPlaying() ?? false
  );

  return isPlaying;
};

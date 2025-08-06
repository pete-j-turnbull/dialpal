import { useCallback, useMemo, useReducer } from "react";
import {
  calculateSceneDuration,
  validateVideoForScene,
} from "../helpers/video-editing";
import { type Token } from "@packages/video-templates";
import { type FileVideo } from "@convex/schema/common";

export type VideoTrim = {
  start: number;
  end: number;
};

export type VideoCrop = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

export type MediaEditMode = "upload" | "edit";

export type MediaEditState = {
  mode: MediaEditMode;
  video: FileVideo | null;
  trim: VideoTrim;
  speed: number;
  crop: VideoCrop | null;
  isValid: boolean;
  error: string | null;
};

type MediaEditAction =
  | { type: "SET_MODE"; payload: MediaEditMode }
  | { type: "SET_VIDEO"; payload: FileVideo | null }
  | { type: "SET_TRIM"; payload: VideoTrim }
  | { type: "SET_SPEED"; payload: number }
  | { type: "SET_CROP"; payload: VideoCrop | null }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "RESET" };

const initialState: MediaEditState = {
  mode: "upload",
  video: null,
  trim: { start: 0, end: 0 },
  speed: 1,
  crop: null,
  isValid: false,
  error: null,
};

const mediaEditReducer = (
  state: MediaEditState,
  action: MediaEditAction
): MediaEditState => {
  switch (action.type) {
    case "SET_MODE":
      return { ...state, mode: action.payload };

    case "SET_VIDEO":
      return {
        ...state,
        video: action.payload,
        mode: action.payload ? "edit" : "upload",
        error: null,
      };

    case "SET_TRIM":
      return { ...state, trim: action.payload };

    case "SET_SPEED":
      return { ...state, speed: action.payload };

    case "SET_CROP":
      return { ...state, crop: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload, isValid: false };

    case "RESET":
      return initialState;

    default:
      return state;
  }
};

type UseMediaEditStateOptions = {
  initialVideo?: FileVideo | null;
  initialTrim?: VideoTrim;
  initialSpeed?: number;
  initialCrop?: VideoCrop;
  tokens: Token[];
  sceneStartIndex: number;
  sceneEndIndex: number;
};

export const useMediaEditState = (options: UseMediaEditStateOptions) => {
  const {
    initialVideo,
    initialTrim,
    initialSpeed = 1,
    initialCrop,
    tokens,
    sceneStartIndex,
    sceneEndIndex,
  } = options;

  // Calculate scene duration
  const sceneDuration = useMemo(
    () => calculateSceneDuration(tokens, sceneStartIndex, sceneEndIndex),
    [tokens, sceneStartIndex, sceneEndIndex]
  );

  // Initialize state with provided values
  const [state, dispatch] = useReducer(mediaEditReducer, {
    mode: initialVideo ? "edit" : "upload",
    video: initialVideo || null,
    trim: initialTrim || { start: 0, end: sceneDuration },
    speed: initialSpeed,
    crop: initialCrop || null,
    isValid: Boolean(initialVideo),
    error: null,
  });

  // Validate current state
  const validation = useMemo(() => {
    if (!state.video) {
      return { isValid: false, error: null };
    }

    const videoValidation = validateVideoForScene(state.video, sceneDuration);
    if (!videoValidation.isValid) {
      return videoValidation;
    }

    // Check if trim range is valid
    const trimDuration = state.trim.end - state.trim.start;
    const speedAdjustedDuration = sceneDuration * state.speed;

    if (Math.abs(trimDuration - speedAdjustedDuration) > 100) {
      // Allow 100ms tolerance
      return {
        isValid: false,
        error: "Trim duration doesn't match required scene duration",
      };
    }

    return { isValid: true, error: null };
  }, [state.video, state.trim, state.speed, sceneDuration]);

  // Actions
  const setMode = useCallback((mode: MediaEditMode) => {
    dispatch({ type: "SET_MODE", payload: mode });
  }, []);

  const setVideo = useCallback((video: FileVideo | null) => {
    dispatch({ type: "SET_VIDEO", payload: video });
  }, []);

  const setTrim = useCallback((trim: VideoTrim) => {
    dispatch({ type: "SET_TRIM", payload: trim });
  }, []);

  const setSpeed = useCallback((speed: number) => {
    dispatch({ type: "SET_SPEED", payload: speed });
  }, []);

  const setCrop = useCallback((crop: VideoCrop | null) => {
    dispatch({ type: "SET_CROP", payload: crop });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: "SET_ERROR", payload: error });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  // Combined setters for convenience
  const setSpeedAndTrim = useCallback((speed: number, trim: VideoTrim) => {
    dispatch({ type: "SET_SPEED", payload: speed });
    dispatch({ type: "SET_TRIM", payload: trim });
  }, []);

  return {
    // State
    ...state,
    isValid: validation.isValid,
    error: validation.error,
    sceneDuration,

    // Actions
    setMode,
    setVideo,
    setTrim,
    setSpeed,
    setCrop,
    setError,
    reset,
    setSpeedAndTrim,
  };
};

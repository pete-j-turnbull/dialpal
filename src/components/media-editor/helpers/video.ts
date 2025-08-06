/**
 * Format milliseconds to MM:SS format
 */
export const formatVideoTime = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

/**
 * Format speed for display
 */
export const formatVideoSpeed = (speed: number): string => {
  if (speed === 1) return "1x";
  if (speed < 1) return `${speed}x`;
  return `${speed}x`;
};

/**
 * Clamp a value between min and max
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Standard speed options for video playback
 */
export const SPEED_OPTIONS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4] as const;

/**
 * Filter speed options to only include valid ones based on constraints
 */
export const getValidSpeedOptions = (maxAllowedSpeed: number): number[] => {
  return SPEED_OPTIONS.filter((speed) => speed <= maxAllowedSpeed);
};

/**
 * Calculate maximum allowed speed based on available video content
 */
export const calculateMaxAllowedSpeed = (
  videoDuration: number,
  trimStart: number,
  sceneDuration: number,
): number => {
  // Maximum content we can use from current position to end of video
  const availableContentFromStart = videoDuration - trimStart;
  // Maximum content we can use if we start from beginning
  const maxAvailableContent = videoDuration;

  // Calculate max speed that still allows us to maintain the scene duration
  const maxSpeedFromCurrent = availableContentFromStart / sceneDuration;
  const maxSpeedFromBeginning = maxAvailableContent / sceneDuration;

  return Math.max(maxSpeedFromCurrent, maxSpeedFromBeginning);
};

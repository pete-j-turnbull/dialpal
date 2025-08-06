import { type FileVideo } from "@convex/schema/common";
import { type Token } from "@packages/video-templates";

/**
 * Calculate scene duration from tokens
 */
export const calculateSceneDuration = (
  tokens: Token[],
  startIndex: number,
  endIndex: number
): number => {
  if (!tokens || tokens.length === 0) return 0;
  if (startIndex >= tokens.length || endIndex >= tokens.length) return 0;

  const startToken = tokens[startIndex];
  const endToken = tokens[endIndex];

  if (!startToken || !endToken) return 0;

  return endToken.end - startToken.start;
};

/**
 * Validate if a video file is suitable for a scene
 */
export const validateVideoForScene = (
  video: FileVideo,
  requiredDuration: number
): { isValid: boolean; error?: string } => {
  if (!video || !video.metadata) {
    return { isValid: false, error: "Invalid video file" };
  }

  if (video.metadata.duration < requiredDuration) {
    const requiredSeconds = Math.ceil(requiredDuration / 1000);
    const availableSeconds = Math.ceil(video.metadata.duration / 1000) - 1;
    return {
      isValid: false,
      error: `Video is too short. Required: ${requiredSeconds}s, Available: ${availableSeconds}s`,
    };
  }

  return { isValid: true };
};

/**
 * Calculate maximum allowed speed based on video duration and scene requirements
 */
export const calculateMaxAllowedSpeed = (
  videoDuration: number,
  sceneDuration: number,
  trimStart: number = 0
): number => {
  const availableContentFromStart = videoDuration - trimStart;
  const maxAvailableContent = videoDuration;

  const maxSpeedFromCurrent = availableContentFromStart / sceneDuration;
  const maxSpeedFromBeginning = maxAvailableContent / sceneDuration;

  return Math.max(maxSpeedFromCurrent, maxSpeedFromBeginning);
};

/**
 * Calculate new trim bounds when speed changes
 */
export const calculateTrimForSpeed = (
  speed: number,
  sceneDuration: number,
  videoDuration: number,
  currentTrimStart: number,
  currentTrimEnd: number
): { start: number; end: number } => {
  const newSourceDuration = sceneDuration / speed;
  const isAtVideoEnd = currentTrimEnd >= videoDuration;

  let newStart = currentTrimStart;
  let newEnd = currentTrimEnd;

  if (isAtVideoEnd) {
    // If we're at the end, adjust start position backward
    newEnd = videoDuration;
    newStart = Math.max(0, videoDuration - newSourceDuration);
  } else {
    // Try to expand from current start position
    newEnd = currentTrimStart + newSourceDuration;

    // If that would exceed video bounds, adjust start position
    if (newEnd > videoDuration) {
      newEnd = videoDuration;
      newStart = Math.max(0, videoDuration - newSourceDuration);
    }
  }

  return { start: newStart, end: newEnd };
};

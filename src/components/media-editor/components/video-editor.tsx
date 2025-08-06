import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  calculateMaxAllowedSpeed,
  getValidSpeedOptions,
} from "../helpers/video";
import type { CropData, VideoEditorProps } from "../types";
import { VideoPlayer } from "./video-player";
import { VideoSpeedControl } from "./video-speed-control";
import { VideoTimeline } from "./video-timeline";
import { cn } from "@/lib/utils";

export const VideoEditor = ({
  videoUrl,
  videoDuration,
  sceneDuration,
  trimStart,
  trimEnd,
  onTrimChange,
  onSpeedChange,
  onSpeedAndTrimChange,
  initialSpeed = 1,
  onCropChange,
  initialCrop = { x: 0, y: 0, width: 100, height: 100 },
  className,
}: VideoEditorProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(trimStart);
  const [playbackSpeed, setPlaybackSpeed] = useState(initialSpeed);
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState<CropData>(initialCrop);

  // Calculate maximum allowed speed based on available video content
  const maxAllowedSpeed = useMemo(
    () => calculateMaxAllowedSpeed(videoDuration, trimStart, sceneDuration),
    [videoDuration, trimStart, sceneDuration]
  );

  // Get valid speed options
  const validSpeedOptions = useMemo(
    () => getValidSpeedOptions(maxAllowedSpeed),
    [maxAllowedSpeed]
  );

  // Handle speed change
  const handleSpeedChange = useCallback(
    (value: number[]) => {
      const newSpeedIndex = value[0];
      const newSpeed = validSpeedOptions[newSpeedIndex];
      setPlaybackSpeed(newSpeed);

      // Calculate new trim duration to maintain same output duration
      const newSourceDuration = sceneDuration * newSpeed;

      let newStart = trimStart;
      let newEnd = trimEnd;

      // Check if we're currently at the end of the video
      const isAtVideoEnd = trimEnd >= videoDuration;

      if (isAtVideoEnd) {
        // If we're at the end, adjust start position backward
        newEnd = videoDuration;
        newStart = Math.max(0, videoDuration - newSourceDuration);
      } else {
        // If we're not at the end, try to expand from current start position
        newEnd = trimStart + newSourceDuration;

        // If that would exceed video bounds, adjust start position
        if (newEnd > videoDuration) {
          newEnd = videoDuration;
          newStart = Math.max(0, videoDuration - newSourceDuration);
        }
      }

      // Update video playback rate and position
      if (videoRef.current) {
        videoRef.current.playbackRate = newSpeed;
        videoRef.current.currentTime = newStart / 1000;
      }

      // Use combined callback if available, otherwise use separate callbacks
      if (onSpeedAndTrimChange) {
        onSpeedAndTrimChange(newSpeed, newStart, newEnd);
      } else {
        onTrimChange(newStart, newEnd);
        onSpeedChange?.(newSpeed);
      }
    },
    [
      validSpeedOptions,
      sceneDuration,
      trimStart,
      trimEnd,
      videoDuration,
      onTrimChange,
      onSpeedChange,
      onSpeedAndTrimChange,
    ]
  );

  // Handle timeline drag
  const handleTimelineDrag = useCallback(
    (clientX: number) => {
      const timeline = document.querySelector("[data-timeline]");
      if (!timeline) return;

      const bounds = timeline.getBoundingClientRect();
      const x = Math.min(Math.max(clientX - bounds.left, 0), bounds.width);
      const percent = x / bounds.width;

      // Calculate new start position
      let newStart = Math.round(percent * videoDuration);

      // Calculate the speed-adjusted duration
      const speedAdjustedDuration = sceneDuration * playbackSpeed;

      // Ensure the selection doesn't exceed video bounds
      if (newStart + speedAdjustedDuration > videoDuration) {
        newStart = videoDuration - speedAdjustedDuration;
      }

      const newEnd = newStart + speedAdjustedDuration;
      onTrimChange(newStart, newEnd);

      // Update video position
      if (videoRef.current) {
        videoRef.current.currentTime = newStart / 1000;
      }
    },
    [videoDuration, sceneDuration, playbackSpeed, onTrimChange]
  );

  // Play/pause functionality
  const togglePlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      // Start from trim start if outside trim range
      if (
        video.currentTime < trimStart / 1000 ||
        video.currentTime >= trimEnd / 1000
      ) {
        video.currentTime = trimStart / 1000;
      }
      video.playbackRate = playbackSpeed;
      video.play();
      setIsPlaying(true);
    }
  }, [isPlaying, trimStart, trimEnd, playbackSpeed]);

  // Handle crop changes
  const handleCropChange = useCallback(
    (newCrop: CropData) => {
      setCrop(newCrop);
      onCropChange?.(newCrop);
    },
    [onCropChange]
  );

  // Mouse event handlers for timeline dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleTimelineDrag(e.clientX);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleTimelineDrag]);

  // Update current time from video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime * 1000);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, []);

  // Sync video with trim position and playback speed
  useEffect(() => {
    if (videoRef.current && !isPlaying) {
      videoRef.current.currentTime = trimStart / 1000;
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [trimStart, isPlaying, playbackSpeed]);

  // Pause when reaching trim end
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isPlaying) return;

    const checkTime = () => {
      if (video.currentTime >= trimEnd / 1000) {
        video.pause();
        setIsPlaying(false);
        video.currentTime = trimStart / 1000;
      }
    };

    const interval = setInterval(checkTime, 100);
    return () => clearInterval(interval);
  }, [isPlaying, trimEnd, trimStart]);

  // Auto-adjust speed if current speed becomes invalid
  useEffect(() => {
    if (!validSpeedOptions.includes(playbackSpeed)) {
      // Find the closest valid speed
      const closestSpeed = validSpeedOptions.reduce((prev, curr) =>
        Math.abs(curr - playbackSpeed) < Math.abs(prev - playbackSpeed)
          ? curr
          : prev
      );
      setPlaybackSpeed(closestSpeed);

      if (videoRef.current) {
        videoRef.current.playbackRate = closestSpeed;
      }
    }
  }, [validSpeedOptions, playbackSpeed]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Video Preview */}
      <VideoPlayer
        ref={videoRef}
        videoUrl={videoUrl}
        currentTime={currentTime}
        videoDuration={videoDuration}
        playbackSpeed={playbackSpeed}
        isPlaying={isPlaying}
        isCropping={isCropping}
        crop={crop}
        onPlayPause={togglePlayback}
        onCropToggle={() => setIsCropping(!isCropping)}
        onCropChange={handleCropChange}
      />

      {/* Speed Control */}
      <VideoSpeedControl
        playbackSpeed={playbackSpeed}
        maxAllowedSpeed={maxAllowedSpeed}
        onSpeedChange={handleSpeedChange}
        className="space-y-2"
      />

      {/* Timeline */}
      <div data-timeline>
        <VideoTimeline
          videoDuration={videoDuration}
          trimStart={trimStart}
          trimEnd={trimEnd}
          currentTime={currentTime}
          isPlaying={isPlaying}
          onTimelineDrag={handleTimelineDrag}
          onMouseDown={() => setIsDragging(true)}
        />
      </div>
    </div>
  );
};

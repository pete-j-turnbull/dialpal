import { useCallback, useEffect, useRef, useState } from "react";

type VideoPlaybackOptions = {
  trimStart: number;
  trimEnd: number;
  playbackSpeed: number;
  onTimeUpdate?: (currentTime: number) => void;
};

export const useVideoPlayback = (options: VideoPlaybackOptions) => {
  const { trimStart, trimEnd, playbackSpeed, onTimeUpdate } = options;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(trimStart);

  // Update current time from video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const time = video.currentTime * 1000;
      setCurrentTime(time);
      onTimeUpdate?.(time);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, [onTimeUpdate]);

  // Sync video with trim position and playback speed
  useEffect(() => {
    if (videoRef.current && !isPlaying) {
      videoRef.current.currentTime = trimStart / 1000;
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [trimStart, isPlaying, playbackSpeed]);

  // Auto-pause when reaching trim end
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

  // Seek to specific time
  const seekTo = useCallback(
    (time: number) => {
      const video = videoRef.current;
      if (!video) return;

      // Clamp time to trim bounds
      const clampedTime = Math.max(trimStart, Math.min(time, trimEnd));
      video.currentTime = clampedTime / 1000;
      setCurrentTime(clampedTime);
    },
    [trimStart, trimEnd],
  );

  // Update playback speed
  const setPlaybackSpeed = useCallback((speed: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = speed;
  }, []);

  return {
    videoRef,
    isPlaying,
    currentTime,
    togglePlayback,
    seekTo,
    setPlaybackSpeed,
  };
};

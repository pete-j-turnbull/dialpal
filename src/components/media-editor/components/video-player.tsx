import { forwardRef } from "react";
import { Crop, Pause, Play } from "lucide-react";
import { formatVideoSpeed, formatVideoTime } from "../helpers/video";
import type { CropData } from "../types";
import { CropOverlay } from "./crop-overlay";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type VideoPlayerProps = {
  videoUrl: string;
  currentTime: number;
  videoDuration: number;
  playbackSpeed: number;
  isPlaying: boolean;
  isCropping: boolean;
  crop: CropData;
  onPlayPause: () => void;
  onCropToggle: () => void;
  onCropChange: (crop: CropData) => void;
  className?: string;
};

export const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  (
    {
      videoUrl,
      currentTime,
      videoDuration,
      playbackSpeed,
      isPlaying,
      isCropping,
      crop,
      onPlayPause,
      onCropToggle,
      onCropChange,
      className,
    },
    ref
  ) => {
    return (
      <div
        className={cn(
          "relative aspect-video overflow-hidden rounded-lg bg-black",
          className
        )}
      >
        <div className="relative h-full w-full">
          <video
            ref={ref}
            src={videoUrl}
            className="h-full w-full object-contain"
            preload="metadata"
          />

          {/* Crop Overlay */}
          <CropOverlay
            crop={crop}
            onCropChange={onCropChange}
            isActive={isCropping}
          />

          {/* Play/Pause Overlay */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="pointer-events-auto h-16 w-16 rounded-full bg-black/50 text-white hover:bg-black/70"
              onClick={onPlayPause}
            >
              {isPlaying ? (
                <Pause className="h-8 w-8" />
              ) : (
                <Play className="ml-1 h-8 w-8" />
              )}
            </Button>
          </div>

          {/* Time Display */}
          <div className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
            {formatVideoTime(currentTime)} / {formatVideoTime(videoDuration)}
          </div>

          {/* Speed Display */}
          <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
            {formatVideoSpeed(playbackSpeed)}
          </div>

          {/* Crop Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-8 w-8 rounded bg-black/70 text-white hover:bg-black/80"
            onClick={onCropToggle}
          >
            <Crop className={cn("h-4 w-4", isCropping && "text-blue-400")} />
          </Button>
        </div>
      </div>
    );
  }
);

VideoPlayer.displayName = "VideoPlayer";

import { forwardRef } from "react";
import { Pause, Play } from "lucide-react";
import { formatVideoSpeed, formatVideoTime } from "../helpers/video";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type VideoPreviewProps = {
  videoUrl: string;
  isPlaying: boolean;
  currentTime: number;
  videoDuration: number;
  playbackSpeed: number;
  onTogglePlayback: () => void;
  className?: string;
};

export const VideoPreview = forwardRef<HTMLVideoElement, VideoPreviewProps>(
  (
    {
      videoUrl,
      isPlaying,
      currentTime,
      videoDuration,
      playbackSpeed,
      onTogglePlayback,
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
        <video
          ref={ref}
          src={videoUrl}
          className="h-full w-full object-contain"
          preload="metadata"
        />

        {/* Play/Pause Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-16 w-16 rounded-full bg-black/50 text-white hover:bg-black/70"
            onClick={onTogglePlayback}
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
      </div>
    );
  }
);

VideoPreview.displayName = "VideoPreview";

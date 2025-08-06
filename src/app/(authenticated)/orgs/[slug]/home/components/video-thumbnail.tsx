import { useCallback } from "react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Play, Scissors, RotateCw } from "lucide-react";
import { SoftGradientLive } from "./soft-gradient-live";
import { Badge } from "@/components/ui/badge";
import { ExportStatus, RenderedVideo } from "@convex/schema/rendered_video";
import { Button } from "@/components/ui/button";
import { Id } from "@convex/_generated/dataModel";

export type Props = {
  renderedVideo: RenderedVideo;
  className?: string;
  onWatch: (videoId: Id<"rendered_videos">) => void;
  onRetry?: (videoId: Id<"rendered_videos">) => void;
  isRetrying?: boolean;
};

type StatusBadgeProps = {
  status?: ExportStatus;
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  return (
    <Badge
      variant="default"
      className={cn(
        "absolute right-2 top-2 z-10 flex select-none items-center gap-1.5 border-none bg-gray-900/50"
      )}
    >
      <div
        className={cn(
          "h-2 w-2 rounded-full",
          status === ExportStatus.Failed
            ? "bg-red-500"
            : status === ExportStatus.Ready
            ? "bg-green-500"
            : "bg-yellow-400"
        )}
      />
      <span
        className="text-slate-50"
        style={{ textShadow: "0px 1px 2px rgba(0, 0, 0, 0.25)" }}
      >
        {!status
          ? "Draft"
          : status === ExportStatus.Exporting
          ? "Exporting"
          : status === ExportStatus.Ready
          ? "Exported"
          : "Failed"}
      </span>
    </Badge>
  );
};

const formatDuration = (ms: number) => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
};

const getDuration = (renderedVideo: RenderedVideo) => {
  if (renderedVideo.exportFile) {
    return renderedVideo.exportFile.metadata.duration;
  } else {
    return renderedVideo.composition.duration;
  }
};

const HoverOverlay = (props: {
  renderedVideo: RenderedVideo;
  className?: string;
  onWatchClick: (videoId: Id<"rendered_videos">) => void;
  onEditClick?: (videoId: Id<"rendered_videos">) => void;
  onRetryClick?: (videoId: Id<"rendered_videos">) => void;
  isRetrying?: boolean;
}) => {
  const {
    renderedVideo,
    className,
    onEditClick,
    onWatchClick,
    onRetryClick,
    isRetrying,
  } = props;

  // const duration = getDuration(project);

  const canWatch = renderedVideo.exportStatus === ExportStatus.Ready;
  const canRetry = renderedVideo.exportStatus === ExportStatus.Failed;
  // const canEdit = duration > 0;
  const canEdit = false;

  const handleWatchClick = useCallback(() => {
    onWatchClick(renderedVideo._id);
  }, [onWatchClick, renderedVideo._id]);

  const handleRetryClick = useCallback(() => {
    onRetryClick?.(renderedVideo._id);
  }, [onRetryClick, renderedVideo._id]);

  return (
    <div
      className={cn(
        "duration-250 flex h-full w-full items-center justify-center gap-0.5 transition-all",
        className
      )}
    >
      {canWatch ? (
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-none bg-black/50 font-semibold text-white ring-0 hover:bg-black hover:text-white"
          onClick={handleWatchClick}
        >
          <Play className="h-4 w-4" />
          Watch
        </Button>
      ) : null}

      {canRetry ? (
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-none bg-black/50 font-semibold text-white ring-0 hover:bg-black hover:text-white"
          onClick={handleRetryClick}
          disabled={isRetrying}
        >
          <RotateCw className={cn("h-4 w-4", isRetrying && "animate-spin")} />
          {isRetrying ? "Retrying..." : "Retry"}
        </Button>
      ) : null}

      {canEdit ? (
        <Button
          variant="outline"
          size={canWatch ? "icon" : "sm"}
          className="h-8 gap-1.5 border-none bg-black/50 font-semibold text-white ring-0 hover:bg-black hover:text-white"
          onClick={(e) => {
            e.stopPropagation();
            onEditClick?.(renderedVideo._id);
          }}
        >
          {canWatch ? (
            <Scissors className="h-4 w-4" />
          ) : (
            <>
              <Scissors className="h-4 w-4" />
              Edit
            </>
          )}
        </Button>
      ) : null}
    </div>
  );
};

export const VideoThumbnail = (props: Props) => {
  const { renderedVideo, className, onWatch, onRetry, isRetrying } = props;

  const exportStatus = renderedVideo.exportStatus;
  const duration = getDuration(renderedVideo);

  const handleThumbnailClick = useCallback(() => {
    if (exportStatus === ExportStatus.Ready) {
      onWatch(renderedVideo._id);
    } else {
      // do nothing
    }
  }, [exportStatus, onWatch, renderedVideo._id]);

  return (
    <div className={cn("w-full max-w-xs space-y-2", className)}>
      <div
        className="group relative aspect-video cursor-pointer overflow-hidden rounded-md transition-all hover:shadow-xl"
        onClick={handleThumbnailClick}
      >
        {/* Status badge */}
        <StatusBadge status={exportStatus} />

        {/* Thumbnail image (or placeholder) */}
        <div className="relative h-full w-full select-none">
          <SoftGradientLive
            seed={renderedVideo._id}
            className="absolute inset-0 left-0 top-0 h-full w-full"
            blobs={5}
            variance={0.75}
          />

          <span className="text-muted-foreground/90 absolute inset-0 flex h-full w-full items-center justify-center text-sm font-medium">
            No Preview Available
          </span>

          <HoverOverlay
            className="absolute inset-0 opacity-0 group-hover:opacity-100"
            renderedVideo={renderedVideo}
            onWatchClick={onWatch}
            onRetryClick={onRetry}
            isRetrying={isRetrying}
          />

          {/* Duration indicator */}
          <div className="absolute bottom-2 right-2 rounded bg-gray-900/50 px-2">
            <span
              className="text-xs font-medium text-slate-50"
              style={{ textShadow: "0px 1px 2px rgba(0, 0, 0, 0.25)" }}
            >
              {formatDuration(duration)}
            </span>
          </div>
        </div>
      </div>

      {/* Video title and metadata */}
      <div className="space-y-1">
        <h3 className="font-medium leading-tight">Untitled</h3>
        <p className="text-xs text-slate-500">
          Edited by you,{" "}
          {formatDistanceToNow(
            new Date(renderedVideo._creationTime as unknown as string),
            { addSuffix: true }
          )}
        </p>
      </div>
    </div>
  );
};

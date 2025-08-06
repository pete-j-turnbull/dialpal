import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Music, Pause, Play, Video, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { File as ConvexFile, FileType } from "@convex/schema/common";

type Props = {
  file: ConvexFile;
  onRemove?: () => void;
  className?: string;
};

export const FilePreview = ({ file, onRemove, className }: Props) => {
  const preview = useMemo(() => {
    switch (file.type) {
      case FileType.Image:
        return <ImagePreview file={file} />;
      case FileType.Video:
        return <VideoPreview file={file} />;
      case FileType.Audio:
        return <AudioPreview file={file} />;
      default:
        return null;
    }
  }, [file]);

  return (
    <div
      className={cn(
        "relative rounded-lg border bg-white p-4 shadow-sm",
        className
      )}
    >
      {onRemove && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-8 w-8"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      <div className="space-y-2">
        {preview}

        <div className="mt-2 text-sm text-gray-600">
          <p className="truncate font-medium">{file.filename}</p>
          {/* <p className="text-xs text-gray-500">
            {(file.sizeBytes / (1024 * 1024)).toFixed(2)} MB
          </p> */}
        </div>
      </div>
    </div>
  );
};

// Image Preview Component
const ImagePreview = ({ file }: { file: ConvexFile }) => {
  if (file.type !== FileType.Image) return null;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-md bg-gray-100">
      <img
        src={file.url}
        alt={file.filename}
        className="h-full w-full object-contain"
      />
    </div>
  );
};

// Video Preview Component
const VideoPreview = ({ file }: { file: ConvexFile }) => {
  if (file.type !== FileType.Video) return null;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-md bg-black">
      <video
        src={file.url}
        className="h-full w-full object-contain"
        controls
        preload="metadata"
      />
      <div className="absolute bottom-2 left-2 rounded bg-black/50 px-2 py-1 text-xs text-white">
        {formatDuration(file.metadata.duration)}
      </div>
    </div>
  );
};

// Audio Preview Component
const AudioPreview = ({ file }: { file: ConvexFile }) => {
  if (file.type !== FileType.Audio) return null;

  return (
    <div className="space-y-3">
      <div className="flex h-32 w-full items-center justify-center rounded-md bg-gradient-to-br from-purple-100 to-pink-100">
        <Music className="h-12 w-12 text-purple-600" />
      </div>

      <audio src={file.url} controls className="w-full" preload="metadata" />

      <div className="text-xs text-gray-500">
        Duration: {formatDuration(file.metadata.duration)}
      </div>
    </div>
  );
};

// Helper function to format duration
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

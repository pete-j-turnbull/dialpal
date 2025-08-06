import { useCallback } from "react";
import { type File as ConvexFile } from "@convex/schema/common";
import { useMediaEditState, VideoTrim } from "../hooks/use-media-edit-state";
import {
  convertCropPercentageToPixels,
  convertCropPixelsToPercentage,
  CropDataPercentage,
} from "../helpers/crop";
import { validateVideoForScene } from "../helpers/video-editing";
import { VideoEditor } from "./video-editor";
import { toast } from "sonner";
import { type SceneBroll } from "@packages/video-templates/thought-leadership-916"; // TODO: generalize
import { type Token } from "@packages/video-templates";
import { FileType, FileVideo } from "@convex/schema/common";
import { TypographyLarge } from "@/components/typography/large";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FILE_CONTENT_TYPES } from "@/features/upload/const";
import { Dropzone } from "@/features/upload/components/dropzone";
import { useUploadState } from "@/features/upload/context";
import { Modal } from "@/components/modal";

type Props = {
  isOpen: boolean;
  scene: SceneBroll;
  tokens: Token[];
  onMediaChange: (
    sceneId: string,
    changes: {
      file?: FileVideo;
      trim?: VideoTrim;
      speed?: number;
      crop?: { left: number; right: number; top: number; bottom: number };
    }
  ) => void;
  onClose: () => void;
};

const SIZE_LIMIT_MB = 250;

export const MediaEditModal = ({
  isOpen,
  scene,
  tokens,
  onMediaChange,
  onClose,
}: Props) => {
  const { progress, isUploading } = useUploadState();

  // Initialize media edit state
  const mediaEditState = useMediaEditState({
    initialVideo: scene.file || null,
    initialTrim: scene.videoTrim,
    initialSpeed: scene.videoSpeed || 1,
    initialCrop: scene.videoCrop,
    tokens,
    sceneStartIndex: scene.startIndex,
    sceneEndIndex: scene.endIndex,
  });

  console.log("scene", scene);

  const handleModalClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleUploadClick = useCallback(() => {
    mediaEditState.setMode("upload");
  }, [mediaEditState]);

  const handleTrimChange = useCallback(
    (start: number, end: number) => {
      const trim: VideoTrim = { start, end };
      mediaEditState.setTrim(trim);

      // Auto-save when trim values change
      onMediaChange(scene.id, { trim });
    },
    [mediaEditState, onMediaChange, scene.id]
  );

  const handleUploadSuccess = useCallback(
    (file: ConvexFile) => {
      if (file.type !== FileType.Video) {
        toast.error("Please upload a video file");
        return;
      }

      const videoFile = file as FileVideo;

      // Validate the video BEFORE setting it
      const validation = validateVideoForScene(
        videoFile,
        mediaEditState.sceneDuration
      );

      if (!validation.isValid) {
        toast.error(validation.error || "Video validation failed");
        return; // Don't set the video or proceed with upload
      }

      // Only set the video if validation passes
      mediaEditState.setVideo(videoFile);

      // Initialize trim values for valid video
      const initialTrim = {
        start: 0,
        end: Math.min(
          mediaEditState.sceneDuration,
          videoFile.metadata.duration
        ),
      };

      mediaEditState.setTrim(initialTrim);

      // Auto-save the new file
      onMediaChange(scene.id, {
        file: videoFile,
        trim: initialTrim,
        speed: mediaEditState.speed,
      });
    },
    [mediaEditState, onMediaChange, scene.id]
  );

  const handleUploadError = useCallback((error: Error) => {
    toast.error(`Upload failed: ${error.message}`);
  }, []);

  const handleSpeedAndTrimChange = useCallback(
    (speed: number, start: number, end: number) => {
      const trim: VideoTrim = { start, end };
      mediaEditState.setSpeedAndTrim(speed, trim);

      // Auto-save the changes
      onMediaChange(scene.id, { speed, trim });
    },
    [mediaEditState, onMediaChange, scene.id]
  );

  const handleCropChange = useCallback(
    (cropPercentage: CropDataPercentage) => {
      if (!mediaEditState.video) return;

      // Convert percentage to pixels
      const cropPixels = convertCropPercentageToPixels(
        cropPercentage,
        mediaEditState.video.metadata.width,
        mediaEditState.video.metadata.height
      );

      mediaEditState.setCrop(cropPixels);

      // Auto-save the crop
      onMediaChange(scene.id, { crop: cropPixels });
    },
    [mediaEditState, onMediaChange, scene.id]
  );

  const handleBackClick = useCallback(() => {
    mediaEditState.setMode("edit");
  }, [mediaEditState]);

  const handleDoneClick = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Modal open={isOpen} onClose={handleModalClose} wide>
      <div className="flex flex-col overflow-y-scroll">
        <div className="mt-2 flex items-center justify-between border-b px-6 py-4">
          <TypographyLarge>Edit media</TypographyLarge>
          <div className="mr-4 flex items-center gap-2">
            {mediaEditState.mode === "edit" && (
              <Button size="sm" variant="outline" onClick={handleUploadClick}>
                Replace media
              </Button>
            )}
            {mediaEditState.mode === "upload" && (
              <Button size="sm" variant="outline" onClick={handleBackClick}>
                Back
              </Button>
            )}
            <Button size="sm" onClick={handleDoneClick} disabled={isUploading}>
              Done
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {/* Error Display */}
          {mediaEditState.error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-700">{mediaEditState.error}</p>
            </div>
          )}

          {mediaEditState.mode === "edit" && mediaEditState.video ? (
            <VideoEditor
              videoUrl={mediaEditState.video.url}
              videoDuration={mediaEditState.video.metadata.duration}
              sceneDuration={mediaEditState.sceneDuration}
              trimStart={mediaEditState.trim.start}
              trimEnd={mediaEditState.trim.end}
              onTrimChange={handleTrimChange}
              onSpeedAndTrimChange={handleSpeedAndTrimChange}
              initialSpeed={mediaEditState.speed}
              onCropChange={handleCropChange}
              initialCrop={
                mediaEditState.crop
                  ? convertCropPixelsToPercentage(
                      mediaEditState.crop,
                      mediaEditState.video.metadata.width,
                      mediaEditState.video.metadata.height
                    )
                  : undefined
              }
              className="h-full"
            />
          ) : (
            <div className="flex h-[300px] items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-gray-50">
              <Dropzone
                className="flex h-full w-full flex-col items-center justify-center"
                options={{
                  acceptedContentTypes: FILE_CONTENT_TYPES[FileType.Video],
                  maxFileSize: SIZE_LIMIT_MB,
                  maxNumberOfFiles: 1,
                }}
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="w-64">
                      <Progress value={progress} className="h-2" />
                    </div>
                    <div className="text-sm text-gray-600">
                      Uploading... {Math.round(progress)}%
                    </div>
                  </div>
                ) : (
                  <div className="select-none text-center text-sm text-gray-500">
                    Drag and drop a video file here
                  </div>
                )}
              </Dropzone>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

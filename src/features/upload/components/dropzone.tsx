import { PropsWithChildren, useCallback, useRef, useState } from "react";
import { type File as ConvexFile } from "@convex/schema/common";

import { useUpload, useUploadState } from "../context";
import { UploadOptions } from "../types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Props = PropsWithChildren<{
  options: UploadOptions;
  className?: string;
  onUploadSuccess?: (file: ConvexFile) => void;
  onUploadError?: (error: Error) => void;
}>;

export const Dropzone = ({
  options,
  children,
  className,
  onUploadSuccess,
  onUploadError,
}: Props) => {
  const dropzoneRef = useRef(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);

  const handleUploadSuccess = useCallback(
    (file: ConvexFile) => {
      console.log("handleUploadSuccess", file);
      onUploadSuccess?.(file);
    },
    [onUploadSuccess]
  );

  const handleUploadError = useCallback(
    (error: Error) => {
      toast.error(error.message);
      onUploadError?.(error);
    },
    [onUploadError]
  );

  const { uppy, cancelUpload } = useUpload({
    options,
    onUploadSuccess: handleUploadSuccess,
    onUploadError: handleUploadError,
  });
  const { isUploading } = useUploadState();

  const addFilesToUppy = useCallback(
    (files: FileList | File[]) => {
      Array.from(files).forEach((file) => {
        try {
          uppy.addFile({
            name: file.name,
            type: file.type,
            data: file,
            source: "drop",
          });
        } catch (error) {
          // Uppy might reject files based on restrictions
          console.error("Error adding file:", error);
          if (error instanceof Error) {
            toast.error(error.message);
          }
        }
      });
    },
    [uppy]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Only set dragging to false if we're leaving the dropzone entirely
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (
      x <= rect.left ||
      x >= rect.right ||
      y <= rect.top ||
      y >= rect.bottom
    ) {
      setIsDragging(false);
    }
  }, []);
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (isUploading) return;

      const { files } = e.dataTransfer;
      if (files && files.length > 0) {
        addFilesToUppy(files);
      }
    },
    [addFilesToUppy, isUploading]
  );

  const handleFileInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        addFilesToUppy(files);
      }
      // Reset the input value to allow selecting the same file again
      event.target.value = "";
    },
    [addFilesToUppy]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        disabled={isUploading}
        onChange={handleFileInputChange}
        accept={options.acceptedContentTypes?.join(",")}
        multiple={
          options.maxNumberOfFiles ? options.maxNumberOfFiles > 1 : false
        }
      />
      <div
        ref={dropzoneRef}
        id="dropzone"
        className={cn(
          className,
          isDragging && "border-primary bg-primary/5" // Visual feedback when dragging
        )}
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{ cursor: isUploading ? "not-allowed" : "pointer" }}
      >
        {children}
      </div>
    </>
  );
};

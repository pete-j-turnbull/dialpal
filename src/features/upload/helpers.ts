import {
  FileType,
  ContentType,
  File as ConvexFile,
} from "@convex/schema/common";
import { FILE_CONTENT_TYPES, CONTENT_TYPE_LABELS } from "./const";

export const getHelpTextForFileTypes = (
  types: FileType[],
  sizeLimit?: number
) => {
  const mimeTypes = types.flatMap((type) => FILE_CONTENT_TYPES[type]);
  const mimeTypeLabels = mimeTypes.map(
    (mimeType) => CONTENT_TYPE_LABELS[mimeType]
  );
  const sizeLimitText = sizeLimit ? `up to ${sizeLimit / 1024 / 1024}MB` : "";

  if (mimeTypeLabels.length === 1) {
    return `(${mimeTypeLabels[0]} ${sizeLimitText})`;
  }
  if (mimeTypeLabels.length === 2) {
    return `(${mimeTypeLabels[0]} or ${mimeTypeLabels[1]} ${sizeLimitText})`;
  }
  return `(${mimeTypeLabels.slice(0, -1).join(", ")} and ${
    mimeTypeLabels[mimeTypeLabels.length - 1]
  } ${sizeLimitText})`;
};

export const getFileTypeFromRawFile = (rawFile: File): FileType => {
  if (rawFile.type.startsWith("image/")) {
    return FileType.Image;
  } else if (rawFile.type.startsWith("video/")) {
    return FileType.Video;
  } else if (rawFile.type.startsWith("audio/")) {
    return FileType.Audio;
  } else {
    throw new Error("Unsupported file type");
  }
};

/**
 * Maps a raw MIME type to a ContentType enum value.
 * Throws an error if the MIME type is not supported.
 */
export const getContentTypeFromMimeType = (mimeType: string): ContentType => {
  // Normalize common MIME type variations
  const normalizedType = mimeType.toLowerCase();

  switch (normalizedType) {
    // Video types
    case "video/mp4":
      return ContentType.VideoMp4;
    case "video/webm":
      return ContentType.VideoWebm;
    case "video/quicktime":
    case "video/mov": // Common alternative for QuickTime
      return ContentType.VideoMov;

    // Image types
    case "image/gif":
      return ContentType.ImageGif;
    case "image/jpeg":
    case "image/jpg": // Common alternative
      return ContentType.ImageJpeg;
    case "image/png":
      return ContentType.ImagePng;
    case "image/webp":
      return ContentType.ImageWebp;

    // Audio types
    case "audio/mpeg":
    case "audio/mp3": // Common alternative
      return ContentType.AudioMp3;
    case "audio/x-m4a":
    case "audio/m4a": // Alternative without x- prefix
      return ContentType.AudioM4a;
    case "audio/wav":
    case "audio/wave": // Alternative
    case "audio/x-wav": // Alternative with x- prefix
      return ContentType.Wav;

    default:
      throw new Error(`Unsupported content type: ${mimeType}`);
  }
};

export const getConvexFileFromRawFile = (
  rawFile: File
): Pick<ConvexFile, "filename" | "contentType" | "type"> => {
  const fileType = getFileTypeFromRawFile(rawFile);
  const contentType = getContentTypeFromMimeType(rawFile.type);

  return {
    filename: rawFile.name,
    contentType,
    type: fileType,
  };
};

/**
 * Get complete file metadata including dimensions and duration (async).
 * This loads the media to extract width/height for images/videos and duration for audio/video.
 */
export const getFileDetailsFromRawFile = async (
  rawFile: File
): Promise<
  Pick<ConvexFile, "filename" | "contentType" | "type" | "metadata">
> => {
  const fileType = getFileTypeFromRawFile(rawFile);
  const contentType = getContentTypeFromMimeType(rawFile.type);
  const url = URL.createObjectURL(rawFile);

  try {
    if (fileType === FileType.Image) {
      const img = new Image();
      const loaded = new Promise<{ width: number; height: number }>(
        (resolve, reject) => {
          img.onload = () =>
            resolve({ width: img.naturalWidth, height: img.naturalHeight });
          img.onerror = reject;
        }
      );
      img.src = url;
      const metadata = await loaded;

      return {
        filename: rawFile.name,
        contentType,
        type: fileType,
        metadata,
      };
    } else if (fileType === FileType.Video) {
      const video = document.createElement("video");
      const loaded = new Promise<{
        width: number;
        height: number;
        duration: number;
      }>((resolve, reject) => {
        video.onloadedmetadata = () => {
          resolve({
            width: video.videoWidth,
            height: video.videoHeight,
            duration: video.duration,
          });
        };
        video.onerror = reject;
      });
      video.src = url;
      const metadata = await loaded;

      return {
        filename: rawFile.name,
        contentType,
        type: fileType,
        metadata,
      };
    } else if (fileType === FileType.Audio) {
      const audio = document.createElement("audio");
      const loaded = new Promise<{ duration: number }>((resolve, reject) => {
        audio.onloadedmetadata = () => {
          resolve({ duration: audio.duration });
        };
        audio.onerror = reject;
      });
      audio.src = url;
      const metadata = await loaded;

      return {
        filename: rawFile.name,
        contentType,
        type: fileType,
        metadata,
      };
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }
  } finally {
    URL.revokeObjectURL(url);
  }
};

export const getKeyFromUrl = (url: string): string => {
  const urlObj = new URL(url);
  return urlObj.pathname.slice(1);
};

export const extractKeyFromR2Url = (rawUrl: string): string => {
  try {
    const url = new URL(rawUrl);
    // Remove leading slash from pathname
    return url.pathname.slice(1);
  } catch (error) {
    // Fallback if URL parsing fails
    const match = rawUrl.match(/\.r2\.cloudflarestorage\.com\/(.+)$/);
    return match ? match[1] : "";
  }
};

/**
 * Infer content type from file extension
 */
const inferContentTypeFromUrl = (url: string): ContentType => {
  const pathname = new URL(url).pathname;
  const extension = pathname.split(".").pop()?.toLowerCase();

  switch (extension) {
    // Video types
    case "mp4":
      return ContentType.VideoMp4;
    case "webm":
      return ContentType.VideoWebm;
    case "mov":
    case "qt":
      return ContentType.VideoMov;

    // Image types
    case "gif":
      return ContentType.ImageGif;
    case "jpg":
    case "jpeg":
      return ContentType.ImageJpeg;
    case "png":
      return ContentType.ImagePng;
    case "webp":
      return ContentType.ImageWebp;

    // Audio types
    case "mp3":
      return ContentType.AudioMp3;
    case "m4a":
      return ContentType.AudioM4a;
    case "wav":
      return ContentType.Wav;

    default:
      throw new Error(
        `Unable to infer content type from extension: ${extension}`
      );
  }
};

/**
 * Get file type from content type
 */
const getFileTypeFromContentType = (contentType: ContentType): FileType => {
  if (
    [
      ContentType.ImageGif,
      ContentType.ImageJpeg,
      ContentType.ImagePng,
      ContentType.ImageWebp,
    ].includes(contentType)
  ) {
    return FileType.Image;
  } else if (
    [
      ContentType.VideoMp4,
      ContentType.VideoWebm,
      ContentType.VideoMov,
    ].includes(contentType)
  ) {
    return FileType.Video;
  } else if (
    [ContentType.AudioMp3, ContentType.AudioM4a, ContentType.Wav].includes(
      contentType
    )
  ) {
    return FileType.Audio;
  } else {
    throw new Error(`Unsupported content type: ${contentType}`);
  }
};

/**
 * Get complete file metadata from a URL (works in browser).
 * This loads the media to extract width/height for images/videos and duration for audio/video.
 *
 * @param fileUrl - The URL of the file to analyze
 * @param options - Optional configuration
 * @param options.contentType - Explicitly provide content type if known (otherwise it will be inferred from extension)
 * @param options.filename - Explicitly provide filename if desired (otherwise it will be extracted from URL)
 */
export const getFileDetailsFromUrl = async (
  fileUrl: string,
  options?: {
    contentType?: ContentType;
    filename?: string;
  }
): Promise<
  Pick<ConvexFile, "filename" | "contentType" | "type" | "metadata">
> => {
  // Extract filename from URL if not provided
  const filename = options?.filename || fileUrl.split("/").pop() || "unknown";

  // Get content type - use provided one or infer from URL
  const contentType = options?.contentType || inferContentTypeFromUrl(fileUrl);
  const fileType = getFileTypeFromContentType(contentType);

  try {
    if (fileType === FileType.Image) {
      const img = new Image();
      img.crossOrigin = "anonymous"; // Enable CORS
      const loaded = new Promise<{ width: number; height: number }>(
        (resolve, reject) => {
          img.onload = () =>
            resolve({ width: img.naturalWidth, height: img.naturalHeight });
          img.onerror = reject;
        }
      );
      img.src = fileUrl;
      const metadata = await loaded;

      return {
        filename,
        contentType,
        type: fileType,
        metadata,
      };
    } else if (fileType === FileType.Video) {
      const video = document.createElement("video");
      video.crossOrigin = "anonymous"; // Enable CORS
      const loaded = new Promise<{
        width: number;
        height: number;
        duration: number;
      }>((resolve, reject) => {
        video.onloadedmetadata = () => {
          resolve({
            width: Math.round(video.videoWidth),
            height: Math.round(video.videoHeight),
            duration: Math.round(video.duration * 1000),
          });
        };
        video.onerror = reject;
      });
      video.src = fileUrl;
      const metadata = await loaded;

      return {
        filename,
        contentType,
        type: fileType,
        metadata,
      };
    } else if (fileType === FileType.Audio) {
      const audio = document.createElement("audio");
      audio.crossOrigin = "anonymous"; // Enable CORS
      const loaded = new Promise<{ duration: number }>((resolve, reject) => {
        audio.onloadedmetadata = () => {
          resolve({ duration: Math.round(audio.duration * 1000) });
        };
        audio.onerror = reject;
      });
      audio.src = fileUrl;
      const metadata = await loaded;

      return {
        filename,
        contentType,
        type: fileType,
        metadata,
      };
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }
  } catch (error) {
    // Re-throw with more context
    throw new Error(
      `Failed to load file details from URL: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

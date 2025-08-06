import { ContentType, FileType } from "@convex/schema/common";

export const CONTENT_TYPE_EXTENSIONS: Record<ContentType, string[]> = {
  [ContentType.ImagePng]: [".png"],
  [ContentType.ImageJpeg]: [".jpg", ".jpeg"],
  [ContentType.ImageGif]: [".gif"],
  [ContentType.VideoMp4]: [".mp4"],
  [ContentType.VideoMov]: [".mov"],
  [ContentType.AudioM4a]: [".m4a"],
  [ContentType.AudioMp3]: [".mp3"],
  [ContentType.Wav]: [".wav"],
  [ContentType.VideoWebm]: [".webm"],
  [ContentType.ImageWebp]: [".webp"],
};

export const FILE_CONTENT_TYPES: Record<FileType, ContentType[]> = {
  [FileType.Image]: [
    ContentType.ImagePng,
    ContentType.ImageJpeg,
    ContentType.ImageGif,
  ],
  [FileType.Video]: [
    ContentType.VideoMp4,
    ContentType.VideoMov,
    ContentType.VideoWebm,
  ],
  [FileType.Audio]: [
    ContentType.AudioMp3,
    ContentType.AudioM4a,
    ContentType.Wav,
  ],
};

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  [ContentType.ImagePng]: "PNG",
  [ContentType.ImageJpeg]: "JPEG",
  [ContentType.ImageGif]: "GIF",
  [ContentType.VideoMp4]: "MP4",
  [ContentType.VideoMov]: "MOV",
  [ContentType.VideoWebm]: "WEBM",
  [ContentType.AudioMp3]: "MP3",
  [ContentType.AudioM4a]: "M4A",
  [ContentType.Wav]: "WAV",
  [ContentType.ImageWebp]: "WEBP",
};

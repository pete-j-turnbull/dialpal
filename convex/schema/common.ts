import { Infer, v } from "convex/values";

export enum FileType {
  Image = "image",
  Video = "video",
  Audio = "audio",
}

export enum ContentType {
  VideoMp4 = "video/mp4",
  VideoWebm = "video/webm",
  VideoMov = "video/quicktime",
  ImageGif = "image/gif",
  ImageJpeg = "image/jpeg",
  ImagePng = "image/png",
  ImageWebp = "image/webp",
  AudioMp3 = "audio/mpeg",
  AudioM4a = "audio/x-m4a",
  Wav = "audio/wav",
}

const baseFileFields = {
  id: v.string(),
  filename: v.string(),
  contentType: v.string(),
  url: v.string(),
};

export const fileImageMetadataSchema = v.object({
  width: v.number(),
  height: v.number(),
});

export const fileVideoMetadataSchema = v.object({
  width: v.number(),
  height: v.number(),
  duration: v.number(),
});

export const fileAudioMetadataSchema = v.object({
  duration: v.number(),
});

export const fileImageSchema = v.object({
  ...baseFileFields,
  type: v.literal(FileType.Image),
  metadata: fileImageMetadataSchema,
});

export const fileVideoSchema = v.object({
  ...baseFileFields,
  type: v.literal(FileType.Video),
  metadata: fileVideoMetadataSchema,
});

export const fileAudioSchema = v.object({
  ...baseFileFields,
  type: v.literal(FileType.Audio),
  metadata: fileAudioMetadataSchema,
});

export const fileSchema = v.union(
  fileImageSchema,
  fileVideoSchema,
  fileAudioSchema
);

export type File = Infer<typeof fileSchema>;
export type FileImage = Infer<typeof fileImageSchema>;
export type FileVideo = Infer<typeof fileVideoSchema>;
export type FileAudio = Infer<typeof fileAudioSchema>;

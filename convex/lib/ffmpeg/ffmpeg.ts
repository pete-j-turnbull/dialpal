"use node";

import { promises as fs } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import ffmpeg from "fluent-ffmpeg";
import { FileType } from "@convex/schema/common";

type FileMetadata<T extends FileType> = T extends FileType.Image
  ? {
      width: number;
      height: number;
    }
  : T extends FileType.Video
  ? {
      width: number;
      height: number;
      duration: number;
    }
  : T extends FileType.Audio
  ? {
      duration: number;
    }
  : never;

export class Ffmpeg {
  public async getMetadata<T extends FileType = FileType>(
    urlOrFilePath: string
  ): Promise<FileMetadata<T>> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(urlOrFilePath, (err, metadata) => {
        if (err) {
          reject(err);
          return;
        }

        const formatName = metadata.format.format_name?.toLowerCase() || "";

        // Check for image formats first
        if (
          formatName.includes("image") ||
          formatName.includes("png") ||
          formatName.includes("jpeg") ||
          formatName.includes("jpg") ||
          formatName.includes("gif") ||
          formatName.includes("mjpeg") ||
          formatName.includes("image2") ||
          formatName.includes("webp") ||
          formatName.includes("bmp") ||
          formatName.includes("tiff") ||
          formatName.includes("svg")
        ) {
          // Image metadata
          const imageStream = metadata.streams[0];
          const imageMetadata = {
            width: imageStream?.width || 0,
            height: imageStream?.height || 0,
          };
          resolve(imageMetadata as FileMetadata<T>);
          return;
        }

        // Find the first video or audio stream
        const videoStream = metadata.streams.find(
          (s) => s.codec_type === "video"
        );
        const audioStream = metadata.streams.find(
          (s) => s.codec_type === "audio"
        );

        if (videoStream) {
          // Video metadata
          const videoMetadata = {
            width: videoStream.width || 0,
            height: videoStream.height || 0,
            duration: Math.floor((metadata.format.duration || 0) * 1000),
          };
          resolve(videoMetadata as FileMetadata<T>);
        } else if (audioStream && !videoStream) {
          // Audio-only metadata
          const audioMetadata = {
            duration: Math.floor((metadata.format.duration || 0) * 1000),
          };
          resolve(audioMetadata as FileMetadata<T>);
        } else {
          reject(new Error("Unable to determine file type from metadata"));
        }
      });
    });
  }

  public async reverseAndJoinVideo(videoUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // Generate a unique temporary file path
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const outputFileName = `reversed_video_${timestamp}_${randomSuffix}.mp4`;
      const outputPath = join(tmpdir(), outputFileName);

      ffmpeg(videoUrl)
        // 1️⃣ filters: duplicate → reverse → concat
        .complexFilter([
          "[0:v]split[v0][v1]",
          "[v1]reverse,setsar=1[rv]",
          "[v0][rv]concat=n=2:v=1[out]",
        ])
        // 2️⃣ keep video-only
        .noAudio() // equivalent to `-an`
        // 3️⃣ encode once, web-friendly MP4
        .outputOptions([
          "-map",
          "[out]", // pick the composed stream
          "-c:v",
          "libx264", // encode (required after concat in-graph)
          "-crf",
          "18",
          "-preset",
          "veryfast",
          "-movflags",
          "frag_keyframe+empty_moov+faststart", // make MP4 streamable
        ])
        .format("mp4") // specify output format
        .on("error", async (err) => {
          console.error("FFmpeg error:", err);
          // Try to clean up the output file if it exists
          try {
            await fs.unlink(outputPath);
          } catch {
            // Ignore cleanup errors
          }
          reject(err);
        })
        .on("stderr", (stderrLine) => {
          console.log("FFmpeg:", stderrLine);
        })
        .on("end", async () => {
          console.log("FFmpeg: Processing finished successfully");

          try {
            // Verify the file exists and is valid
            const stats = await fs.stat(outputPath);

            if (stats.size === 0) {
              await fs.unlink(outputPath);
              reject(new Error("FFmpeg produced an empty file"));
              return;
            }

            // Basic MP4 validation - check for MP4 file signature
            const fileHandle = await fs.open(outputPath, "r");
            const buffer = Buffer.alloc(8);
            await fileHandle.read(buffer, 0, 8, 0);
            await fileHandle.close();

            const ftypSignature = buffer.slice(4, 8).toString("ascii");
            if (
              !ftypSignature.startsWith("ftyp") &&
              !ftypSignature.startsWith("mdat")
            ) {
              console.error("Invalid MP4 signature detected:", ftypSignature);
              await fs.unlink(outputPath);
              reject(
                new Error("FFmpeg produced an invalid MP4 file (bad signature)")
              );
              return;
            }

            console.log(
              `FFmpeg: Successfully generated video at ${outputPath} (${stats.size} bytes)`
            );
            resolve(outputPath);
          } catch (error) {
            reject(error);
          }
        })
        .save(outputPath); // Write directly to file instead of piping to stream
    });
  }
}

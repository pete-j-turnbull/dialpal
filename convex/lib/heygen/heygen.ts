/* eslint-disable @typescript-eslint/no-explicit-any */
import { requireEnv } from "../../../env";
import {
  API_BASE_V1,
  API_BASE_V2,
  avatarSchema,
  HeygenVideoStatus,
} from "./const";
import type { Avatar } from "./types";

// we remove a frame off the video so our renderer doesn't have to worry about rendering more frames than there is of video
const ONE_FRAME_MS = 1000 / 30;

export class Heygen {
  private apiKey?: string;

  private ensureApiKey(): string {
    if (!this.apiKey) {
      const env = requireEnv("heygen");
      this.apiKey = Buffer.from(env.heygen.apiKey).toString("base64");
    }

    return this.apiKey;
  }

  public async getAvatars(): Promise<Avatar[]> {
    const apiKey = this.ensureApiKey();
    const response = await fetch(`${API_BASE_V2}/avatars`, {
      headers: {
        "X-Api-Key": apiKey,
      },
    });

    const { error, data } = await response.json();

    if (error) {
      const err = error as Error;
      throw new Error(err.message);
    }

    const { avatars } = data;

    // Create a Map to store unique avatars by their ID
    const uniqueAvatars = new Map<string, Avatar>();

    avatars.forEach((avatar: any) => {
      const parsedAvatar = avatarSchema.parse({
        id: avatar.avatar_id,
        name: avatar.avatar_name,
        previewImageUrl: avatar.preview_image_url,
        previewVideoUrl: avatar.preview_video_url,
      });

      // Only add the avatar if it's not already in the Map
      if (!uniqueAvatars.has(parsedAvatar.id)) {
        uniqueAvatars.set(parsedAvatar.id, parsedAvatar);
      }
    });

    // Convert the Map values back to an array
    return Array.from(uniqueAvatars.values());
  }

  public async getVideo(videoId: string): Promise<
    | {
        success: true;
        data: {
          status: HeygenVideoStatus;
          videoUrl?: string;
          duration?: number;
          errorDetails?: {
            code: number;
            detail: string;
            message: string;
          };
        };
      }
    | {
        success: false;
        error: string;
      }
  > {
    const apiKey = this.ensureApiKey();
    const response = await fetch(
      `${API_BASE_V1}/video_status.get?video_id=${videoId}`,
      {
        headers: {
          "X-Api-Key": apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status !== 200) {
      console.warn(
        `Heygen.getVideo() - Unhealthy ${response.status} response from heygen`,
        {
          videoId,
          responseBody: await response.text().catch(() => ""),
        }
      );
    }

    const { code, data } = await response.json().catch(() => {});

    if (code !== 100) {
      return {
        success: false,
        error: "Unknown API error",
      };
    }

    if (!Object.values(HeygenVideoStatus).includes(data.status)) {
      console.warn(
        `Heygen.getVideo() - Unknown video status ${data.status} from heygen`,
        {
          videoId,
          status: data.status,
          data,
        }
      );
      return {
        success: false,
        error: "Unknown video status",
      };
    }

    const status = data.status as HeygenVideoStatus;
    const _videoUrl = data.video_url as string | undefined;
    const duration = data.duration as number | undefined;
    // only set error details if the video failed
    const errorDetails = data.error as
      | {
          code: number;
          detail: string;
          message: string;
        }
      | undefined;

    // const videoUrl = await this.r2.uploadDataFromUrl(_videoUrl!, "video/mp4");

    return {
      success: true,
      data: {
        status,
        videoUrl: _videoUrl,
        duration: duration
          ? Math.round(duration * 1000 - ONE_FRAME_MS)
          : undefined,
        errorDetails,
      },
    };
  }

  public async generateVideo(args: {
    avatarId: string;
    audioFileUrl: string;
    aspectRatio: string;
  }): Promise<
    | {
        success: true;
        heygenVideoId: string;
      }
    | {
        success: false;
        error: string;
      }
  > {
    const { avatarId, audioFileUrl } = args;

    const apiKey = this.ensureApiKey();
    const response = await fetch(`${API_BASE_V2}/video/generate`, {
      headers: {
        "X-Api-Key": apiKey,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        video_inputs: [
          {
            character: {
              type: "avatar",
              avatar_id: avatarId,
              avatar_style: "normal",
            },
            voice: {
              type: "audio",
              audio_url: audioFileUrl,
            },
            background: {
              type: "color",
              value: "#008000",
            },
          },
        ],
        dimension:
          args.aspectRatio === "16:9"
            ? {
                width: 1920,
                height: 1080,
              }
            : {
                width: 1080,
                height: 1920,
              },
      }),
    });

    const { data, error } = await response.json().catch(() => {
      return {
        data: null,
        error: "Parsing response failed",
      };
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      heygenVideoId: data.video_id as string,
    };
  }
}

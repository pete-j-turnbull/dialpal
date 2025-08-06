import z from "zod";

export const API_BASE_V1 = "https://api.heygen.com/v1";
export const API_BASE_V2 = "https://api.heygen.com/v2";

export const avatarSchema = z.object({
  id: z.string(),
  name: z.string(),
  previewImageUrl: z.string(),
  previewVideoUrl: z.string(),
});

export enum HeygenVideoStatus {
  Waiting = "waiting",
  Pending = "pending",
  Processing = "processing",
  Completed = "completed",
  Failed = "failed",
}

export enum HeygenGetVideoError {
  NotFound = "not_found",
  Failed = "failed",
}

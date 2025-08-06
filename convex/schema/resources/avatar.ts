import { defineTable } from "convex/server";
import { v } from "convex/values";
import { Doc } from "@convex/_generated/dataModel";
import { FileImage, fileImageSchema } from "../common";
import { workspaceIdSchema } from "../workspace";

export enum AvatarStatus {
  Ready = "ready",
  Processing = "processing",
  Error = "error",
}

export const avatarSchema = v.object({
  name: v.string(),
  workspaceId: workspaceIdSchema,
  heygenAvatarId: v.string(),
  elevenLabsVoiceId: v.string(),
  aspect: v.union(v.literal("16:9"), v.literal("9:16")),
  status: v.union(
    v.literal(AvatarStatus.Ready),
    v.literal(AvatarStatus.Processing),
    v.literal(AvatarStatus.Error)
  ),
  preview: v.optional(fileImageSchema),
  error: v.optional(v.union(v.string(), v.null())),
});

export type Avatar = Doc<"avatars">;
export type ReadyAvatar = Avatar & {
  status: AvatarStatus.Ready;
  preview: FileImage;
};

export const avatarTable = defineTable(avatarSchema).index("by_workspace", [
  "workspaceId",
]);

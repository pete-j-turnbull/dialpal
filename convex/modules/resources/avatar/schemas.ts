import { fileImageSchema } from "@convex/schema/common";
import { AvatarStatus } from "@convex/schema/resources/avatar";
import { workspaceIdSchema } from "@convex/schema/workspace";
import { v } from "convex/values";

export const createArgsSchema = v.object({
  workspaceId: workspaceIdSchema,
  name: v.string(),
  heygenAvatarId: v.string(),
  elevenLabsVoiceId: v.string(),
  aspect: v.union(v.literal("16:9"), v.literal("9:16")),
});

export const updateArgsSchema = v.object({
  name: v.optional(v.string()),
  elevenLabsVoiceId: v.optional(v.string()),
  status: v.optional(
    v.union(
      v.literal(AvatarStatus.Processing),
      v.literal(AvatarStatus.Ready),
      v.literal(AvatarStatus.Error)
    )
  ),
  preview: v.optional(fileImageSchema),
  error: v.optional(v.union(v.string(), v.null())),
});

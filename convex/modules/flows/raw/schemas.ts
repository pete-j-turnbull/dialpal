import { v } from "convex/values";
import { workspaceIdSchema } from "@convex/schema/workspace";

export const createArgsSchema = v.object({
  workspaceId: workspaceIdSchema,
  script: v.string(),
  avatarId: v.id("avatars"),
});

export const updateArgsSchema = v.object({
  avatarId: v.optional(v.id("avatars")),
  script: v.optional(v.string()),
  title: v.optional(v.string()),
  voiceGenerationHash: v.optional(v.string()),
  voiceGenerating: v.optional(v.boolean()),
  videoGenerating: v.optional(v.boolean()),
  templatedVideo: v.optional(v.any()),
  output: v.optional(v.string()),
});

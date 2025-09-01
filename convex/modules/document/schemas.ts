import { diffOpSchema, documentPlatformSchema } from "@convex/schema/document";
import { v } from "convex/values";

export const syncArgsSchema = v.object({
  userId: v.id("users"),
  ts: v.number(),
  externalId: v.string(),
  platform: documentPlatformSchema,
  title: v.optional(v.string()),
  oldHash: v.optional(v.string()),
  newHash: v.string(),
  ops: v.array(diffOpSchema),
});

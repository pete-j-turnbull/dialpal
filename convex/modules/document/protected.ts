import { protectedQuery, protectedMutation } from "@convex/functions";
import * as module from "@convex/modules/document";
import { diffOpSchema } from "@convex/schema/document";
import { documentPlatformSchema } from "@convex/schema/document";
import { v } from "convex/values";

export const getOperationsSinceCheckpoint = protectedQuery({
  args: {
    platform: documentPlatformSchema,
    externalId: v.string(),
    checkpointHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId } = ctx;

    return await module.getOperationsSinceCheckpoint(ctx, { ...args, userId });
  },
});

export const sync = protectedMutation({
  args: {
    platform: documentPlatformSchema,
    externalId: v.string(),
    title: v.optional(v.string()),
    oldHash: v.optional(v.string()),
    newHash: v.string(),
    ts: v.number(),
    ops: v.array(diffOpSchema),
  },
  handler: async (ctx, args) => {
    const { userId } = ctx;

    return await module.sync(ctx, { ...args, userId });
  },
});

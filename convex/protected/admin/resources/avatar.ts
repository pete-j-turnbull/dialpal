import { rootQuery, rootMutation } from "@convex/functions";
import * as module from "@convex/modules/resources/avatar";
import { updateArgsSchema } from "@convex/modules/resources/avatar/schemas";
import { workspaceIdSchema } from "@convex/schema/workspace";
import { v } from "convex/values";

export const get = rootQuery({
  args: { id: v.id("avatars") },
  handler: async (ctx, args) => {
    return await module.get(ctx, args);
  },
});

export const listByWorkspace = rootQuery({
  args: { workspaceId: workspaceIdSchema },
  handler: async (ctx, args) => {
    return await module.listByWorkspace(ctx, args);
  },
});

export const create = rootMutation({
  args: {
    data: v.object({
      workspaceId: workspaceIdSchema,
      name: v.string(),
      heygenAvatarId: v.string(),
      elevenLabsVoiceId: v.string(),
      aspect: v.union(v.literal("16:9"), v.literal("9:16")),
    }),
  },
  handler: async (ctx, args) => {
    return await module.create(ctx, args);
  },
});

export const update = rootMutation({
  args: {
    id: v.id("avatars"),
    data: updateArgsSchema,
  },
  handler: async (ctx, args) => {
    const avatar = await module.get(ctx, {
      id: args.id,
    });

    if (!avatar) throw new Error("Avatar not found");

    return await module.update(ctx, args);
  },
});

export const retry = rootMutation({
  args: { id: v.id("avatars") },
  handler: async (ctx, args) => {
    const avatar = await module.get(ctx, {
      id: args.id,
    });

    if (!avatar) throw new Error("Avatar not found");

    return await module.retryProcessing(ctx, args);
  },
});

export const remove = rootMutation({
  args: {
    id: v.id("avatars"),
  },
  handler: async (ctx, args) => {
    const avatar = await module.get(ctx, {
      id: args.id,
    });

    if (!avatar) throw new Error("Avatar not found");

    return await module.remove(ctx, args);
  },
});

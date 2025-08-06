import { protectedMutation, protectedQuery } from "@convex/functions";
import * as module from "@convex/modules/resources/avatar";
import { updateArgsSchema } from "@convex/modules/resources/avatar/schemas";
import { v } from "convex/values";

export const get = protectedQuery({
  args: { id: v.id("avatars") },
  handler: async (ctx, args) => {
    const { organizationId, userId } = ctx;

    const workspaceId = organizationId ?? userId;

    const avatar = await module.get(ctx, args);
    return avatar?.workspaceId === workspaceId ? avatar : null;
  },
});

export const list = protectedQuery({
  handler: async (ctx) => {
    const { organizationId, userId } = ctx;

    const workspaceId = organizationId ?? userId;

    return await module.listByWorkspace(ctx, {
      workspaceId,
    });
  },
});

export const create = protectedMutation({
  args: {
    data: v.object({
      name: v.string(),
      heygenAvatarId: v.string(),
      elevenLabsVoiceId: v.string(),
      aspect: v.union(v.literal("16:9"), v.literal("9:16")),
    }),
  },
  handler: async (ctx, args) => {
    const { organizationId, userId } = ctx;

    const workspaceId = organizationId ?? userId;

    return await module.create(ctx, {
      data: {
        ...args.data,
        workspaceId,
      },
    });
  },
});

export const update = protectedMutation({
  args: {
    id: v.id("avatars"),
    data: updateArgsSchema,
  },
  handler: async (ctx, args) => {
    const { organizationId, userId } = ctx;

    const workspaceId = organizationId ?? userId;

    const avatar = await module.get(ctx, {
      id: args.id,
    });

    if (!avatar) throw new Error("Avatar not found");
    if (avatar.workspaceId !== workspaceId) throw new Error("Avatar not found");

    return await module.update(ctx, args);
  },
});

export const remove = protectedMutation({
  args: {
    id: v.id("avatars"),
  },
  handler: async (ctx, args) => {
    const { organizationId, userId } = ctx;

    const workspaceId = organizationId ?? userId;

    const avatar = await module.get(ctx, {
      id: args.id,
    });

    if (!avatar) throw new Error("Avatar not found");
    if (avatar.workspaceId !== workspaceId) throw new Error("Avatar not found");

    return await module.remove(ctx, args);
  },
});

import { protectedMutation, protectedQuery } from "@convex/functions";
import * as module from "@convex/modules/rendered_video";
import { v } from "convex/values";

export const get = protectedQuery({
  args: { id: v.id("rendered_videos") },
  handler: async (ctx, args) => {
    const { organizationId, userId } = ctx;

    const workspaceId = organizationId ?? userId;

    const renderedVideo = await module.get(ctx, args);
    return renderedVideo?.workspaceId === workspaceId ? renderedVideo : null;
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

export const remove = protectedMutation({
  args: {
    id: v.id("rendered_videos"),
  },
  handler: async (ctx, args) => {
    const { organizationId, userId } = ctx;

    const workspaceId = organizationId ?? userId;

    const renderedVideo = await module.get(ctx, {
      id: args.id,
    });

    if (!renderedVideo || renderedVideo.workspaceId !== workspaceId)
      throw new Error("Rendered video not found");

    return await module.remove(ctx, args);
  },
});

export const retry = protectedMutation({
  args: {
    id: v.id("rendered_videos"),
  },
  handler: async (ctx, args) => {
    const { organizationId, userId } = ctx;

    const workspaceId = organizationId ?? userId;

    const renderedVideo = await module.get(ctx, {
      id: args.id,
    });

    if (!renderedVideo || renderedVideo.workspaceId !== workspaceId)
      throw new Error("Rendered video not found");

    return await module.retry(ctx, args);
  },
});

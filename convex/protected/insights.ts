import { protectedMutation, protectedQuery } from "@convex/functions";
import * as module from "@convex/modules/insights";
import { updateContentPillarArgsSchema } from "@convex/modules/insights/schemas";
import { v } from "convex/values";

export const listContentPillars = protectedQuery({
  handler: async (ctx) => {
    const { organizationId, userId } = ctx;

    const workspaceId = organizationId ?? userId;

    return await module.listContentPillarsByWorkspace(ctx, { workspaceId });
  },
});

export const updateContentPillar = protectedMutation({
  args: {
    id: v.id("content_pillars"),
    data: updateContentPillarArgsSchema,
  },
  handler: async (ctx, args) => {
    const { organizationId, userId } = ctx;
    const { id, data } = args;

    const workspaceId = organizationId ?? userId;

    const contentPillar = await module.getContentPillar(ctx, {
      id,
    });

    if (!contentPillar || contentPillar.workspaceId !== workspaceId)
      throw new Error("Content pillar not found");

    return await module.updateContentPillar(ctx, {
      id,
      data,
    });
  },
});

export const generateContentPillars = protectedMutation({
  handler: async (ctx) => {
    const { organizationId, userId } = ctx;

    const workspaceId = organizationId ?? userId;

    return await module.generateContentPillarsForWorkspace(ctx, {
      workspaceId,
    });
  },
});

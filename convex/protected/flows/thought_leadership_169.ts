import { protectedMutation, protectedQuery } from "@convex/functions";
import * as module from "@convex/modules/flows/thought_leadership_169";
import { FlowThoughtLeadership169 } from "@convex/schema/flows";
import { v } from "convex/values";

export const get = protectedQuery({
  args: { id: v.id("flows") },
  handler: async (ctx, args): Promise<FlowThoughtLeadership169 | null> => {
    const { organizationId, userId } = ctx;

    const workspaceId = organizationId ?? userId;

    const flow = await module.get(ctx, args);
    return flow?.workspaceId === workspaceId ? flow : null;
  },
});

export const create = protectedMutation({
  args: {
    data: v.object({
      script: v.string(),
      avatarId: v.id("avatars"),
      productDatasetId: v.optional(v.id("product_datasets")),
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
    id: v.id("flows"),
    data: v.object({
      avatarId: v.optional(v.id("avatars")),
      script: v.optional(v.string()),
      title: v.optional(v.string()),
      templatedVideo: v.optional(v.any()),
    }),
  },
  handler: async (ctx, args) => {
    const { organizationId, userId } = ctx;

    const workspaceId = organizationId ?? userId;

    const flow = await module.get(ctx, args);
    if (flow?.workspaceId !== workspaceId) throw new Error("Flow not found");

    return await module.update(ctx, args);
  },
});

export const generateVoice = protectedMutation({
  args: { id: v.id("flows") },
  handler: async (ctx, args) => {
    const { organizationId, userId } = ctx;

    const workspaceId = organizationId ?? userId;

    const flow = await module.get(ctx, args);
    if (flow?.workspaceId !== workspaceId) throw new Error("Flow not found");

    return await module.generateVoice(ctx, args);
  },
});

export const generateVideo = protectedMutation({
  args: { id: v.id("flows") },
  handler: async (ctx, args) => {
    const { organizationId, userId } = ctx;

    const workspaceId = organizationId ?? userId;

    const flow = await module.get(ctx, args);
    if (flow?.workspaceId !== workspaceId) throw new Error("Flow not found");

    return await module.generateVideo(ctx, args);
  },
});

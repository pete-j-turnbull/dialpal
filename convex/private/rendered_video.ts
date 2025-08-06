import { privateQuery, privateMutation } from "@convex/functions";
import * as module from "@convex/modules/rendered_video";
import {
  createArgsSchema,
  updateArgsSchema,
} from "@convex/modules/rendered_video/schemas";

import { v } from "convex/values";

export const get = privateQuery({
  args: { id: v.id("rendered_videos") },
  handler: async (ctx, args) => {
    return await module.get(ctx, args);
  },
});

export const create = privateMutation({
  args: {
    data: createArgsSchema,
  },
  handler: async (ctx, args) => {
    return await module.create(ctx, args);
  },
});

export const update = privateMutation({
  args: {
    id: v.id("rendered_videos"),
    data: updateArgsSchema,
  },
  handler: async (ctx, args) => {
    return await module.update(ctx, args);
  },
});

export const remove = privateMutation({
  args: {
    id: v.id("rendered_videos"),
  },
  handler: async (ctx, args) => {
    return await module.remove(ctx, args);
  },
});

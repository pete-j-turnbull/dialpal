import { privateQuery, privateMutation } from "@convex/functions";
import * as module from "@convex/modules/resources/avatar";
import { updateArgsSchema } from "@convex/modules/resources/avatar/schemas";
import { v } from "convex/values";

export const get = privateQuery({
  args: { id: v.id("avatars") },
  handler: async (ctx, args) => {
    return await module.get(ctx, args);
  },
});

export const update = privateMutation({
  args: {
    id: v.id("avatars"),
    data: updateArgsSchema,
  },
  handler: async (ctx, args) => {
    return await module.update(ctx, args);
  },
});

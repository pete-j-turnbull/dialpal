import { internalQuery } from "@convex/functions";
import { v } from "convex/values";
import * as module from ".";

export const get = internalQuery({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await module.get(ctx, args);
  },
});

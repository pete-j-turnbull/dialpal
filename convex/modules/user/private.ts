import { privateQuery } from "@convex/functions";
import * as module from "@convex/modules/user";
import { v } from "convex/values";

export const get = privateQuery({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await module.get(ctx, args);
  },
});

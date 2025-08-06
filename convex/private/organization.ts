import { privateQuery } from "@convex/functions";
import * as module from "@convex/modules/organization";
import { v } from "convex/values";

export const get = privateQuery({
  args: { id: v.id("organizations") },
  handler: async (ctx, args) => {
    return await module.get(ctx, args);
  },
});

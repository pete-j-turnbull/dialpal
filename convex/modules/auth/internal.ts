import { internalMutation, internalQuery } from "@convex/functions";
import { UserJSON } from "@clerk/backend";
import { v, Validator } from "convex/values";
import * as module from "@convex/modules/auth";
import { requireEnv } from "../../../env";

export const upsertUser = internalMutation({
  args: { data: v.any() as Validator<UserJSON> }, // no runtime validation, trust Clerk
  async handler(ctx, { data }) {
    const { convex } = requireEnv("convex");

    const deployment = data.public_metadata?.deployment;
    if (deployment && deployment !== convex.deployment) return;

    const attributes = {
      clerkId: data.id,
      email: data.email_addresses[0].email_address,
    };

    const user = await module.getUserFromClerkId(ctx, data.id);

    if (!user) {
      await ctx.db.insert("users", attributes);
    } else {
      await ctx.db.patch(user._id, attributes);
    }
  },
});

export const deleteUser = internalMutation({
  args: { clerkId: v.string() },
  async handler(ctx, { clerkId }) {
    const user = await module.getUserFromClerkId(ctx, clerkId);

    if (user) {
      await ctx.db.delete(user._id);
    }
  },
});

export const resolveContext = internalQuery({
  args: {
    clerkUserId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return module.resolveContext(ctx, args);
  },
});

export const get = internalQuery({
  args: {
    id: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await module.get(ctx, args);
  },
});

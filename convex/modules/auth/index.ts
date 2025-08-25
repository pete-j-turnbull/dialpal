import { Id } from "@convex/_generated/dataModel";
import { type MutationCtx, type QueryCtx } from "@convex/functions";
import { ConvexError } from "convex/values";

export async function resolveContext(
  ctx: QueryCtx | MutationCtx,
  args: {
    clerkUserId?: string;
  }
) {
  const { clerkUserId } = args;

  if (!clerkUserId) throw new ConvexError("Not authenticated");

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkUserId))
    .first();
  if (!user) throw new ConvexError("Not authenticated");

  return {
    userId: user._id,
  };
}

export async function get(ctx: QueryCtx, args: { id: Id<"users"> }) {
  const { id } = args;
  return await ctx.db.get(id);
}

export async function getUserFromClerkId(ctx: QueryCtx, clerkId: string) {
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
    .unique();

  return user;
}

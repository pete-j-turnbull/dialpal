import { Id } from "@convex/_generated/dataModel";
import {
  internalQuery,
  type MutationCtx,
  type QueryCtx,
} from "@convex/functions";
import { ConvexError, v } from "convex/values";

export async function resolveContext(
  ctx: QueryCtx | MutationCtx,
  args: {
    clerkOrgId?: string;
    clerkUserId?: string;
    isRoot: boolean;
  }
) {
  const { clerkOrgId, clerkUserId, isRoot } = args;

  if (!clerkUserId) throw new ConvexError("Not authenticated");

  if (clerkOrgId) {
    const organizationMembership = await ctx.db
      .query("organization_memberships")
      .withIndex("by_clerk_organization_and_user", (q) =>
        q.eq("clerkOrgId", clerkOrgId).eq("clerkUserId", clerkUserId)
      )
      .first();

    if (organizationMembership) {
      return {
        organizationId: organizationMembership.organizationId,
        userId: organizationMembership.userId,
        isRoot,
      };
    }
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkUserId))
    .first();
  if (!user) throw new ConvexError("Not authenticated");

  return {
    userId: user._id,
    isRoot,
  };
}

export async function get(ctx: QueryCtx, args: { id: Id<"users"> }) {
  const { id } = args;
  return await ctx.db.get(id);
}

// insertUser
// updateUser

export async function getUserFromClerkId(ctx: QueryCtx, clerkId: string) {
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
    .unique();

  return user;
}

/** Internal API */

export const _resolveContext = internalQuery({
  args: {
    clerkOrgId: v.optional(v.string()),
    clerkUserId: v.optional(v.string()),
    isRoot: v.boolean(),
  },
  handler: async (ctx, args) => {
    return resolveContext(ctx, args);
  },
});

export const _get = internalQuery({
  args: {
    id: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await get(ctx, args);
  },
});

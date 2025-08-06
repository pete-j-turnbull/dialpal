import { type Id } from "@convex/_generated/dataModel";
import {
  internalQuery,
  internalMutation,
  internalAction,
  type MutationCtx,
  type QueryCtx,
} from "@convex/functions";
import { WorkspaceId, workspaceIdSchema } from "@convex/schema/workspace";
import { Infer, v } from "convex/values";
import { createArgsSchema, updateArgsSchema } from "./schemas";
import { AvatarStatus } from "@convex/schema/resources/avatar";
import { internal } from "@convex/_generated/api";
import { trigger } from "@convex/lib/trigger";
import { ProcessAvatarTask } from "./trigger";
import { retrier } from "@convex/components";

export async function get(ctx: QueryCtx, args: { id: Id<"avatars"> }) {
  const { id } = args;
  return await ctx.db.get(id);
}

export async function listByWorkspace(
  ctx: QueryCtx,
  args: { workspaceId: WorkspaceId }
) {
  const { workspaceId } = args;
  return await ctx.db
    .query("avatars")
    .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
    .collect();
}

export async function create(
  ctx: MutationCtx,
  args: { data: Infer<typeof createArgsSchema> }
) {
  const { data } = args;

  const avatarId = await ctx.db.insert("avatars", {
    ...data,
    status: AvatarStatus.Processing,
  });

  await retrier.run(
    ctx,
    internal.modules.resources.avatar.index._processAction,
    { id: avatarId },
    { maxFailures: 2 }
  );

  return avatarId;
}

export async function update(
  ctx: MutationCtx,
  args: { id: Id<"avatars">; data: Infer<typeof updateArgsSchema> }
) {
  const { id, data } = args;
  return await ctx.db.patch(id, data);
}

export async function retryProcessing(
  ctx: MutationCtx,
  args: { id: Id<"avatars"> }
) {
  const { id } = args;

  await ctx.db.patch(id, { status: AvatarStatus.Processing });
  await retrier.run(
    ctx,
    internal.modules.resources.avatar.index._processAction,
    { id },
    { maxFailures: 2 }
  );
}

export async function remove(ctx: MutationCtx, args: { id: Id<"avatars"> }) {
  const { id } = args;
  return await ctx.db.delete(id);
}

/** Internal API */

// Internal query to get a single avatar by ID
export const _get = internalQuery({
  args: { id: v.id("avatars") },
  handler: async (ctx, args) => {
    return await get(ctx, args);
  },
});

// Internal query to list avatars by workspace
export const _listByWorkspace = internalQuery({
  args: { workspaceId: workspaceIdSchema },
  handler: async (ctx, args) => {
    return await listByWorkspace(ctx, args);
  },
});

// Internal mutation to create an avatar
export const _create = internalMutation({
  args: { data: createArgsSchema },
  handler: async (ctx, args) => {
    return await create(ctx, args);
  },
});

// Internal mutation to update an avatar
export const _update = internalMutation({
  args: {
    id: v.id("avatars"),
    data: updateArgsSchema,
  },
  handler: async (ctx, args) => {
    return await update(ctx, args);
  },
});

// Internal mutation to remove an avatar
export const _remove = internalMutation({
  args: { id: v.id("avatars") },
  handler: async (ctx, args) => {
    return await remove(ctx, args);
  },
});

export const _processAction = internalAction({
  args: { id: v.id("avatars") },
  handler: async (ctx, args) => {
    const { id } = args;

    await trigger.runTask<ProcessAvatarTask>(
      "resources/avatar/process-avatar",
      {
        avatarId: id,
      }
    );
  },
});

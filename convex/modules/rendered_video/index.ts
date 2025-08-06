import { type Id } from "@convex/_generated/dataModel";
import {
  internalQuery,
  internalMutation,
  internalAction,
  type MutationCtx,
  type QueryCtx,
} from "@convex/functions";
import { Infer, v } from "convex/values";
import { internal } from "@convex/_generated/api";
import { trigger } from "@convex/lib/trigger";
import { ExportRenderedVideoTask } from "./trigger";
import { retrier } from "@convex/components";
import { createArgsSchema, updateArgsSchema } from "./schemas";
import { ExportStatus } from "@convex/schema/rendered_video";
import { WorkspaceId, workspaceIdSchema } from "@convex/schema/workspace";

export async function get(ctx: QueryCtx, args: { id: Id<"rendered_videos"> }) {
  const { id } = args;
  return await ctx.db.get(id);
}

export async function listByWorkspace(
  ctx: QueryCtx,
  args: { workspaceId: WorkspaceId }
) {
  const { workspaceId } = args;

  return await ctx.db
    .query("rendered_videos")
    .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
    .collect();
}

export async function create(
  ctx: MutationCtx,
  args: { data: Infer<typeof createArgsSchema> }
) {
  const { data } = args;

  const renderedVideoId = await ctx.db.insert("rendered_videos", {
    ...data,
    exportStatus: ExportStatus.Exporting,
  });

  await retrier.run(
    ctx,
    internal.modules.rendered_video.index._export,
    { id: renderedVideoId },
    { maxFailures: 2 }
  );

  return renderedVideoId;
}

export async function update(
  ctx: MutationCtx,
  args: {
    id: Id<"rendered_videos">;
    data: Infer<typeof updateArgsSchema>;
  }
) {
  const { id, data } = args;
  return await ctx.db.patch(id, data);
}

export async function retry(
  ctx: MutationCtx,
  args: { id: Id<"rendered_videos"> }
) {
  const { id } = args;

  const video = await ctx.db.get(id);
  if (!video) throw new Error("Rendered video not found");

  // Only allow retry for failed videos
  if (video.exportStatus !== ExportStatus.Failed) {
    throw new Error("Can only retry failed video generations");
  }

  // Reset status to Exporting and clear error
  await ctx.db.patch(id, {
    exportStatus: ExportStatus.Exporting,
    exportError: undefined,
  });

  // Re-run the export action with retrier
  await retrier.run(
    ctx,
    internal.modules.rendered_video.index._export,
    { id },
    { maxFailures: 2 }
  );

  return id;
}

export async function remove(
  ctx: MutationCtx,
  args: { id: Id<"rendered_videos"> }
) {
  const { id } = args;
  return await ctx.db.delete(id);
}

/** Internal API */

// Internal query to get a single rendered video by ID
export const _get = internalQuery({
  args: { id: v.id("rendered_videos") },
  handler: async (ctx, args) => {
    return await get(ctx, args);
  },
});

export const _listByWorkspace = internalQuery({
  args: {
    workspaceId: workspaceIdSchema,
  },
  handler: async (ctx, args) => {
    return await listByWorkspace(ctx, args);
  },
});

// Internal mutation to create a rendered video
export const _create = internalMutation({
  args: { data: createArgsSchema },
  handler: async (ctx, args) => {
    return await create(ctx, args);
  },
});

// Internal mutation to update a rendered video
export const _update = internalMutation({
  args: {
    id: v.id("rendered_videos"),
    data: updateArgsSchema,
  },
  handler: async (ctx, args) => {
    return await update(ctx, args);
  },
});

export const _remove = internalMutation({
  args: { id: v.id("rendered_videos") },
  handler: async (ctx, args) => {
    return await remove(ctx, args);
  },
});

// Internal mutation to retry a failed video export
export const _retry = internalMutation({
  args: { id: v.id("rendered_videos") },
  handler: async (ctx, args) => {
    return await retry(ctx, args);
  },
});

export const _export = internalAction({
  args: { id: v.id("rendered_videos") },
  handler: async (ctx, args) => {
    const { id } = args;

    await trigger.runTask<ExportRenderedVideoTask>("rendered_video/export", {
      id,
    });
  },
});

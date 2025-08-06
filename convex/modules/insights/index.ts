import { Id } from "@convex/_generated/dataModel";
import {
  internalAction,
  internalQuery,
  MutationCtx,
  type QueryCtx,
} from "@convex/functions";
import { WorkspaceId, workspaceIdSchema } from "@convex/schema/workspace";
import {
  createContentPillarArgsSchema,
  updateContentPillarArgsSchema,
} from "./schemas";
import { Infer } from "convex/values";
import { retrier } from "@convex/components";
import { trigger } from "@convex/lib/trigger";
import { type GenerateContentPillarsTask } from "./trigger";
import { internal } from "@convex/_generated/api";
import * as workspaceModule from "@convex/modules/workspace";

export async function getContentPillar(
  ctx: QueryCtx,
  args: {
    id: Id<"content_pillars">;
  }
) {
  const { id } = args;

  return await ctx.db.get(id);
}

export async function listContentPillarsByWorkspace(
  ctx: QueryCtx,
  args: {
    workspaceId: WorkspaceId;
  }
) {
  const { workspaceId } = args;

  return await ctx.db
    .query("content_pillars")
    .withIndex("by_workspace_id", (q) => q.eq("workspaceId", workspaceId))
    .collect();
}

export async function createContentPillar(
  ctx: MutationCtx,
  args: {
    workspaceId: WorkspaceId;
    data: Infer<typeof createContentPillarArgsSchema>;
  }
) {
  const { workspaceId, data } = args;

  return await ctx.db.insert("content_pillars", {
    ...data,
    workspaceId,
  });
}

export async function updateContentPillar(
  ctx: MutationCtx,
  args: {
    id: Id<"content_pillars">;
    data: Infer<typeof updateContentPillarArgsSchema>;
  }
) {
  const { id, data } = args;

  const contentPillar = await ctx.db.get(id);
  if (!contentPillar) throw new Error("Not found");

  let atLeastOneIdeaUpdated = false;

  const updatedIdeas = contentPillar.ideas.map((idea) => {
    const ideaUpdate = data.ideas?.find((i) => i.id === idea.id);
    if (!ideaUpdate) return idea;

    atLeastOneIdeaUpdated = true;
    return { ...idea, status: ideaUpdate.status };
  });

  return await ctx.db.patch(id, {
    status: data.status,
    ideas: atLeastOneIdeaUpdated ? updatedIdeas : undefined,
  });
}

export async function generateContentPillarsForWorkspace(
  ctx: MutationCtx,
  args: { workspaceId: WorkspaceId }
) {
  const { workspaceId } = args;

  await workspaceModule.update(ctx, {
    id: workspaceId,
    data: {
      isGeneratingContentPillars: true,
    },
  });

  await retrier.run(
    ctx,
    internal.modules.insights.index._generateContentPillarsForWorkspace,
    { workspaceId },
    { maxFailures: 2 }
  );
}

/** Internal API */

export const _listContentPillarsByWorkspace = internalQuery({
  args: { workspaceId: workspaceIdSchema },
  handler: async (ctx, args) => {
    return listContentPillarsByWorkspace(ctx, args);
  },
});

export const _generateContentPillarsForWorkspace = internalAction({
  args: { workspaceId: workspaceIdSchema },
  handler: async (ctx, args) => {
    const { workspaceId } = args;

    await trigger.runTask<GenerateContentPillarsTask>(
      "insights/generate-content-pillars",
      { workspaceId }
    );
  },
});

import {
  internalMutation,
  internalQuery,
  MutationCtx,
  type QueryCtx,
} from "@convex/functions";
import {
  Workspace,
  WorkspaceId,
  workspaceIdSchema,
} from "@convex/schema/workspace";
import { Infer, v } from "convex/values";
import { updateArgsSchema } from "./schemas";

export async function get(
  ctx: QueryCtx,
  args: { id: WorkspaceId }
): Promise<Workspace> {
  const { id } = args;

  const orgOrUser = await ctx.db.get(id);
  if (!orgOrUser) throw new Error("Workspace not found");

  return {
    id,
    phoneticCorrections: orgOrUser.phoneticCorrections,
    creatorDNA: orgOrUser.creatorDNA,
    isGeneratingContentPillars: orgOrUser.isGeneratingContentPillars,
  };
}

export async function update(
  ctx: MutationCtx,
  args: {
    id: WorkspaceId;
    data: Infer<typeof updateArgsSchema>;
  }
) {
  const { id, data } = args;

  await ctx.db.patch(id, data);
}

/** Internal API */

export const _get = internalQuery({
  args: { id: workspaceIdSchema },
  handler: async (ctx, args) => {
    return await get(ctx, args);
  },
});

export const _update = internalMutation({
  args: {
    id: workspaceIdSchema,
    data: updateArgsSchema,
  },
  handler: async (ctx, args) => {
    return await update(ctx, args);
  },
});

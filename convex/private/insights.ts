import { privateMutation, privateQuery } from "@convex/functions";
import * as module from "@convex/modules/insights";
import { createContentPillarArgsSchema } from "@convex/modules/insights/schemas";
import { workspaceIdSchema } from "@convex/schema/workspace";
import { v } from "convex/values";

export const listContentPillarsByWorkspace = privateQuery({
  args: { workspaceId: workspaceIdSchema },
  handler: async (ctx, args) => {
    return await module.listContentPillarsByWorkspace(ctx, args);
  },
});

export const createContentPillars = privateMutation({
  args: {
    workspaceId: workspaceIdSchema,
    data: v.array(createContentPillarArgsSchema),
  },
  handler: async (ctx, args) => {
    const { workspaceId, data } = args;

    await Promise.all(
      data.map((d) =>
        module.createContentPillar(ctx, {
          workspaceId,
          data: d,
        })
      )
    );
  },
});

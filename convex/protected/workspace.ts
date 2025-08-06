import { protectedMutation, protectedQuery } from "@convex/functions";
import * as module from "@convex/modules/workspace";
import { updateArgsSchema } from "@convex/modules/workspace/schemas";

export const get = protectedQuery({
  handler: async (ctx) => {
    const { organizationId, userId } = ctx;

    const workspaceId = organizationId ?? userId;

    return await module.get(ctx, { id: workspaceId });
  },
});

export const update = protectedMutation({
  args: {
    data: updateArgsSchema,
  },
  handler: async (ctx, args) => {
    const { organizationId, userId } = ctx;

    const workspaceId = organizationId ?? userId;

    return await module.update(ctx, {
      id: workspaceId,
      data: args.data,
    });
  },
});

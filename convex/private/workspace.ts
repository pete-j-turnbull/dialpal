import { privateQuery, privateMutation } from "@convex/functions";
import * as module from "@convex/modules/workspace";
import { updateArgsSchema } from "@convex/modules/workspace/schemas";
import { workspaceIdSchema } from "@convex/schema/workspace";

export const get = privateQuery({
  args: { id: workspaceIdSchema },
  handler: async (ctx, args) => {
    return await module.get(ctx, args);
  },
});

export const update = privateMutation({
  args: {
    id: workspaceIdSchema,
    data: updateArgsSchema,
  },
  handler: async (ctx, args) => {
    return await module.update(ctx, args);
  },
});

import { protectedQuery } from "@convex/functions";
import * as module from "@convex/modules/user";

export const me = protectedQuery({
  handler: async (ctx) => {
    const { userId } = ctx;

    return await module.get(ctx, { id: userId });
  },
});

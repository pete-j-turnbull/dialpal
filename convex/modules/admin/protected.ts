import { rootAction } from "@convex/functions";
import * as organizationModule from "@convex/modules/organization";
import { v } from "convex/values";

export const create = rootAction({
  args: {
    data: v.object({ name: v.string() }),
  },
  handler: async (ctx, args) => {
    const { userId } = ctx;
    const { data } = args;

    return await organizationModule.createAction(ctx, {
      data: {
        name: data.name,
        createdBy: userId,
      },
    });
  },
});

export const createInvitation = rootAction({
  args: {
    organizationId: v.id("organizations"),
    data: v.object({ emailAddress: v.string() }),
  },
  handler: async (ctx, args) => {
    return await organizationModule.createInvitationAction(ctx, args);
  },
});

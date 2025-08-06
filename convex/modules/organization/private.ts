import { privateAction, privateQuery } from "@convex/functions";
import * as module from "@convex/modules/organization";
import { v } from "convex/values";

export const get = privateQuery({
  args: { id: v.id("organizations") },
  handler: async (ctx, args) => {
    return await module.get(ctx, args);
  },
});

export const create = privateAction({
  args: {
    data: v.object({ name: v.string(), createdBy: v.optional(v.id("users")) }),
  },
  handler: async (ctx, args) => {
    return await module.createAction(ctx, args);
  },
});

export const createInvitation = privateAction({
  args: {
    organizationId: v.id("organizations"),
    data: v.object({ emailAddress: v.string() }),
  },
  handler: async (ctx, args) => {
    return await module.createInvitationAction(ctx, args);
  },
});

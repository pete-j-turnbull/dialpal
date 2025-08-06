import {
  internalAction,
  internalMutation,
  internalQuery,
} from "@convex/functions";
import { v } from "convex/values";
import {
  insertArgsSchema,
  insertInvitationArgsSchema,
  updateInvitationArgsSchema,
} from "./schemas";
import * as module from "./index";

export const get = internalQuery({
  args: { id: v.id("organizations") },
  handler: async (ctx, args) => {
    return module.get(ctx, args);
  },
});

export const create = internalAction({
  args: {
    data: v.object({
      name: v.string(),
      createdBy: v.id("users"),
      isRoot: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    return module.createAction(ctx, args);
  },
});

export const createInvitation = internalAction({
  args: {
    organizationId: v.id("organizations"),
    data: v.object({
      emailAddress: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    return module.createInvitationAction(ctx, args);
  },
});

export const getInvitation = internalQuery({
  args: { id: v.id("organization_invitations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const updateInvitation = internalMutation({
  args: {
    id: v.id("organization_invitations"),
    data: updateInvitationArgsSchema,
  },
  handler: async (ctx, args) => {
    return module.updateInvitation(ctx, args);
  },
});

export const revokeInvitation = internalAction({
  args: {
    invitationId: v.id("organization_invitations"),
  },
  handler: async (ctx, args) => {
    return module.revokeInvitationAction(ctx, args);
  },
});

export const resendInvitation = internalAction({
  args: {
    invitationId: v.id("organization_invitations"),
  },
  handler: async (ctx, args) => {
    return module.resendInvitationAction(ctx, args);
  },
});

export const upsertOrganizationByClerkId = internalMutation({
  args: { clerkId: v.string(), data: insertArgsSchema },
  handler: async (ctx, args) => {
    const { clerkId, data } = args;

    const id = await module.getIdFromClerkId(ctx, {
      clerkId,
    });

    if (!id) {
      return await module.insert(ctx, { data });
    } else {
      await module.update(ctx, { id, data });
      return id;
    }
  },
});

export const upsertInvitationByClerkId = internalMutation({
  args: {
    clerkId: v.string(),
    data: insertInvitationArgsSchema,
  },
  handler: async (ctx, args) => {
    const { clerkId, data } = args;

    const id = await module.getInvitationIdFromClerkId(ctx, {
      clerkId,
    });

    if (!id) {
      return await module.insertInvitation(ctx, { data });
    } else {
      await module.updateInvitation(ctx, { id, data });
      return id;
    }
  },
});

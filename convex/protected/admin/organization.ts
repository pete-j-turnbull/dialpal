import { rootQuery, rootAction } from "@convex/functions";
import * as module from "@convex/modules/organization";
import { v } from "convex/values";

export const get = rootQuery({
  args: { id: v.id("organizations") },
  handler: async (ctx, args) => {
    return await module.get(ctx, args);
  },
});

export const list = rootQuery({
  handler: async (ctx) => {
    return await module.list(ctx);
  },
});

export const create = rootAction({
  args: {
    data: v.object({ name: v.string() }),
  },
  handler: async (ctx, args) => {
    const { userId } = ctx;
    const { data } = args;

    return await module.createAction(ctx, {
      data: {
        name: data.name,
        createdBy: userId,
      },
    });
  },
});

export const listInvitations = rootQuery({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await module.listInvitations(ctx, args);
  },
});

export const createInvitation = rootAction({
  args: {
    organizationId: v.id("organizations"),
    data: v.object({ emailAddress: v.string() }),
  },
  handler: async (ctx, args) => {
    return await module.createInvitationAction(ctx, args);
  },
});

export const listMembers = rootQuery({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await module.listMembers(ctx, args);
  },
});

export const revokeInvitation = rootAction({
  args: {
    invitationId: v.id("organization_invitations"),
  },
  handler: async (ctx, args) => {
    return await module.revokeInvitationAction(ctx, args);
  },
});

export const resendInvitation = rootAction({
  args: {
    invitationId: v.id("organization_invitations"),
  },
  handler: async (ctx, args) => {
    return await module.resendInvitationAction(ctx, args);
  },
});

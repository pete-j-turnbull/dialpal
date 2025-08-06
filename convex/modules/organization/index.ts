import { internal } from "@convex/_generated/api";
import { type Id } from "@convex/_generated/dataModel";
import {
  ActionCtx,
  internalAction,
  internalMutation,
  internalQuery,
  type MutationCtx,
  type QueryCtx,
} from "@convex/functions";
import { clerk, OrganizationMembershipRole } from "@convex/lib/clerk";
import { Infer, v } from "convex/values";
import {
  insertArgsSchema,
  insertInvitationArgsSchema,
  updateArgsSchema,
  updateInvitationArgsSchema,
} from "./schemas";
import { OrganizationInvitationStatus } from "@convex/schema/organization";
import { requireEnv } from "../../../env";

export async function get(
  ctx: QueryCtx,
  args: {
    id: Id<"organizations">;
  }
) {
  const { id } = args;
  return await ctx.db.get(id);
}

export async function getIdFromClerkId(
  ctx: QueryCtx,
  args: {
    clerkId: string;
  }
) {
  const { clerkId } = args;
  const organization = await ctx.db
    .query("organizations")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
    .first();

  return organization?._id ?? null;
}

export async function getInvitationIdFromClerkId(
  ctx: QueryCtx,
  args: { clerkId: string }
) {
  const { clerkId } = args;
  const invitation = await ctx.db
    .query("organization_invitations")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
    .first();

  return invitation?._id ?? null;
}

export async function list(ctx: QueryCtx) {
  return await ctx.db.query("organizations").collect();
}

export async function listInvitations(
  ctx: QueryCtx,
  args: {
    organizationId: Id<"organizations">;
  }
) {
  const { organizationId } = args;
  return await ctx.db
    .query("organization_invitations")
    .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
    .collect();
}

export async function listMembers(
  ctx: QueryCtx,
  args: { organizationId: Id<"organizations"> }
) {
  const { organizationId } = args;
  return await ctx.db
    .query("organization_memberships")
    .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
    .collect();
}

export async function insert(
  ctx: MutationCtx,
  args: { data: Infer<typeof insertArgsSchema> }
) {
  const { data } = args;

  return await ctx.db.insert("organizations", data);
}

export async function insertInvitation(
  ctx: MutationCtx,
  args: { data: Infer<typeof insertInvitationArgsSchema> }
) {
  const { data } = args;

  return await ctx.db.insert("organization_invitations", data);
}

export async function update(
  ctx: MutationCtx,
  args: { id: Id<"organizations">; data: Infer<typeof updateArgsSchema> }
) {
  const { id, data } = args;
  return await ctx.db.patch(id, data);
}

export async function updateInvitation(
  ctx: MutationCtx,
  args: {
    id: Id<"organization_invitations">;
    data: Infer<typeof updateInvitationArgsSchema>;
  }
) {
  const { id, data } = args;
  return await ctx.db.patch(id, data);
}

export async function deleteById(
  ctx: MutationCtx,
  args: { id: Id<"organizations"> }
) {
  const { id } = args;
  await ctx.db.delete(id);
}

export async function deleteInvitationById(
  ctx: MutationCtx,
  args: { id: Id<"organization_invitations"> }
) {
  const { id } = args;
  await ctx.db.delete(id);
}

export async function createAction(
  ctx: ActionCtx,
  args: {
    data: { name: string; createdBy?: Id<"users"> };
  }
): Promise<Id<"organizations">> {
  const { data } = args;

  const { convex } = requireEnv("convex");

  let createdByClerkId: string | undefined;

  if (data.createdBy) {
    const user = await ctx.runQuery(internal.modules.auth.index._get, {
      id: data.createdBy,
    });
    if (!user) throw new Error("Created by user not found");

    createdByClerkId = user.clerkId;
  }

  const clerkOrg = await clerk.createOrganization({
    name: data.name,
    createdBy: createdByClerkId,
    publicMetadata: {
      deployment: convex.deployment,
    },
  });

  // TODO: upsert owner member too

  return await ctx.runMutation(
    internal.modules.organization.internal.upsertOrganizationByClerkId,
    {
      clerkId: clerkOrg.id,
      data: {
        clerkId: clerkOrg.id,
        name: clerkOrg.name,
      },
    }
  );
}

export async function createInvitationAction(
  ctx: ActionCtx,
  args: {
    organizationId: Id<"organizations">;
    data: { emailAddress: string };
  }
): Promise<Id<"organization_invitations">> {
  const { organizationId, data } = args;

  const { convex } = requireEnv("convex");

  const organization = await ctx.runQuery(
    internal.modules.organization.internal.get,
    { id: organizationId }
  );
  if (!organization) throw new Error("Organization not found");

  const clerkOrgInvitation = await clerk.createOrganizationInvitation({
    organizationId: organization.clerkId,
    emailAddress: data.emailAddress,
    role: OrganizationMembershipRole.Member,
    publicMetadata: {
      deployment: convex.deployment,
    },
  });

  return await ctx.runMutation(
    internal.modules.organization.internal.upsertInvitationByClerkId,
    {
      clerkId: clerkOrgInvitation.id,
      data: {
        organizationId,
        clerkId: clerkOrgInvitation.id,
        clerkOrgId: clerkOrgInvitation.organizationId,
        emailAddress: clerkOrgInvitation.emailAddress,
        expiresAt: clerkOrgInvitation.expiresAt,
        status: (clerkOrgInvitation.status ??
          OrganizationInvitationStatus.Pending) as OrganizationInvitationStatus,
      },
    }
  );
}

export async function revokeInvitationAction(
  ctx: ActionCtx,
  args: {
    invitationId: Id<"organization_invitations">;
  }
): Promise<void> {
  const { invitationId } = args;

  const invitation = await ctx.runQuery(
    internal.modules.organization.internal.getInvitation,
    { id: invitationId }
  );
  if (!invitation) throw new Error("Invitation not found");

  const organization = await ctx.runQuery(
    internal.modules.organization.internal.get,
    { id: invitation.organizationId }
  );
  if (!organization) throw new Error("Organization not found");

  // Revoke in Clerk

  await clerk.revokeOrganizationInvitation({
    organizationId: organization.clerkId,
    invitationId: invitation.clerkId,
  });

  // Update local status immediately for better UX
  await ctx.runMutation(
    internal.modules.organization.internal.updateInvitation,
    {
      id: invitationId,
      data: {
        status: OrganizationInvitationStatus.Revoked,
      },
    }
  );
}

export async function resendInvitationAction(
  ctx: ActionCtx,
  args: {
    invitationId: Id<"organization_invitations">;
  }
): Promise<void> {
  const { invitationId } = args;

  const invitation = await ctx.runQuery(
    internal.modules.organization.internal.getInvitation,
    { id: invitationId }
  );
  if (!invitation) throw new Error("Invitation not found");

  if (invitation.status !== OrganizationInvitationStatus.Pending) {
    throw new Error("Can only resend pending invitations");
  }

  const organization = await ctx.runQuery(
    internal.modules.organization.internal.get,
    { id: invitation.organizationId }
  );
  if (!organization) throw new Error("Organization not found");

  // Create a new invitation in Clerk (resending is done via creation)
  const clerkOrgInvitation = await clerk.createOrganizationInvitation({
    organizationId: organization.clerkId,
    emailAddress: invitation.emailAddress,
    role: OrganizationMembershipRole.Member,
  });

  // Update the existing invitation with new Clerk ID and expiration
  await ctx.runMutation(
    internal.modules.organization.internal.updateInvitation,
    {
      id: invitationId,
      data: {
        expiresAt: clerkOrgInvitation.expiresAt,
        status: (clerkOrgInvitation.status ??
          OrganizationInvitationStatus.Pending) as OrganizationInvitationStatus,
      },
    }
  );
}

export async function getMembershipByClerkId(
  ctx: QueryCtx,
  args: { clerkId: string }
) {
  const { clerkId } = args;

  return await ctx.db
    .query("organization_memberships")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
    .unique();
}

export async function getInvitationByClerkId(
  ctx: QueryCtx,
  args: { clerkId: string }
) {
  const { clerkId } = args;

  return await ctx.db
    .query("organization_invitations")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
    .unique();
}

import { internalMutation } from "@convex/functions";
import {
  UserJSON,
  OrganizationJSON,
  OrganizationMembershipJSON,
  OrganizationInvitationJSON,
} from "@clerk/backend";
import { v, Validator } from "convex/values";
import { OrganizationInvitationStatus } from "@convex/schema/organization";
import * as authModule from "@convex/modules/auth";
import * as organizationModule from "@convex/modules/organization";
import { requireEnv } from "../../../env";

/** Internal API */

export const _upsertOrganization = internalMutation({
  args: { data: v.any() as Validator<OrganizationJSON> }, // no runtime validation, trust Clerk
  async handler(ctx, { data }) {
    const { convex } = requireEnv("convex");

    const deployment = data.public_metadata?.deployment;
    if (deployment && deployment !== convex.deployment) return;

    const { id: clerkId, name } = data;

    const id = await organizationModule.getIdFromClerkId(ctx, {
      clerkId: clerkId,
    });

    if (!id) {
      return await organizationModule.insert(ctx, {
        data: { clerkId, name },
      });
    } else {
      return await organizationModule.update(ctx, { id, data: { name } });
    }
  },
});

export const _deleteOrganization = internalMutation({
  args: { clerkId: v.string() },
  async handler(ctx, { clerkId }) {
    const id = await organizationModule.getIdFromClerkId(ctx, {
      clerkId: clerkId,
    });

    if (id) {
      return await organizationModule.deleteById(ctx, { id });
    }
  },
});

export const _upsertOrganizationInvitation = internalMutation({
  args: { data: v.any() as Validator<OrganizationInvitationJSON> }, // no runtime validation, trust Clerk
  async handler(ctx, { data }) {
    const { convex } = requireEnv("convex");

    const deployment = data.public_metadata?.deployment;
    if (deployment && deployment !== convex.deployment) return;

    const {
      id: clerkId,
      organization_id: clerkOrgId,
      email_address: emailAddress,
      expires_at: expiresAt,
      status,
    } = data;

    const invitationId = await organizationModule.getInvitationIdFromClerkId(
      ctx,
      {
        clerkId,
      }
    );

    if (invitationId) {
      await organizationModule.updateInvitation(ctx, {
        id: invitationId,
        data: {
          status: status as OrganizationInvitationStatus,
          expiresAt,
        },
      });
      return invitationId;
    } else {
      const organizationId = await organizationModule.getIdFromClerkId(ctx, {
        clerkId: clerkOrgId,
      });
      if (!organizationId) throw new Error("Organization not found");

      return await organizationModule.insertInvitation(ctx, {
        data: {
          clerkId,
          clerkOrgId,
          organizationId,
          emailAddress,
          expiresAt,
          status: status as OrganizationInvitationStatus,
        },
      });
    }
  },
});

export const _deleteOrganizationInvitation = internalMutation({
  args: { clerkId: v.string() },
  async handler(ctx, { clerkId }) {
    const invitation = await organizationModule.getInvitationByClerkId(ctx, {
      clerkId,
    });

    if (invitation) {
      await organizationModule.deleteInvitationById(ctx, {
        id: invitation._id,
      });
    }
  },
});

export const _upsertOrganizationMembership = internalMutation({
  args: { data: v.any() as Validator<OrganizationMembershipJSON> }, // no runtime validation, trust Clerk
  async handler(ctx, { data }) {
    const { convex } = requireEnv("convex");

    const deployment = data.public_metadata?.deployment;
    if (deployment && deployment !== convex.deployment) return;

    const clerkId = data.id;
    const clerkOrgId = data.organization.id;
    const clerkUserId = data.public_user_data.user_id;
    const role = data.role.split("org:")[1] as "admin" | "member";

    const organizationMembership =
      await organizationModule.getMembershipByClerkId(ctx, {
        clerkId,
      });
    if (!organizationMembership) {
      const [organizationId, user] = await Promise.all([
        organizationModule.getIdFromClerkId(ctx, {
          clerkId: clerkOrgId,
        }),
        authModule.getUserFromClerkId(ctx, clerkUserId),
      ]);

      if (!organizationId || !user) {
        throw new Error("Organization or user not found");
      }

      await ctx.db.insert("organization_memberships", {
        clerkId,
        clerkOrgId,
        clerkUserId,
        organizationId,
        userId: user._id,
        email: user.email,
        role,
      });
    } else {
      await ctx.db.patch(organizationMembership._id, {
        role,
      });
    }
  },
});

export const _deleteOrganizationMembership = internalMutation({
  args: { clerkId: v.string() },
  async handler(ctx, { clerkId }) {
    const membership = await organizationModule.getMembershipByClerkId(ctx, {
      clerkId,
    });

    if (membership) {
      await ctx.db.delete(membership._id);
    } else {
      console.warn(
        `Can't delete organization membership, there is none for Clerk ID: ${clerkId}`
      );
    }
  },
});

export const _upsertUser = internalMutation({
  args: { data: v.any() as Validator<UserJSON> }, // no runtime validation, trust Clerk
  async handler(ctx, { data }) {
    const { convex } = requireEnv("convex");

    const deployment = data.public_metadata?.deployment;
    if (deployment && deployment !== convex.deployment) return;

    const attributes = {
      clerkId: data.id,
      email: data.email_addresses[0].email_address,
    };

    const user = await authModule.getUserFromClerkId(ctx, data.id);

    if (!user) {
      await ctx.db.insert("users", attributes);
    } else {
      await ctx.db.patch(user._id, attributes);
    }
  },
});

export const _deleteUser = internalMutation({
  args: { clerkId: v.string() },
  async handler(ctx, { clerkId }) {
    const user = await authModule.getUserFromClerkId(ctx, clerkId);

    if (user) {
      await ctx.db.delete(user._id);
    }
  },
});

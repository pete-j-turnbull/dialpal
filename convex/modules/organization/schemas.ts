import { OrganizationInvitationStatus } from "@convex/schema/organization";
import { v } from "convex/values";

export const insertArgsSchema = v.object({
  clerkId: v.string(),
  name: v.string(),
});

export const updateArgsSchema = v.object({
  name: v.optional(v.string()),
});

export const insertInvitationArgsSchema = v.object({
  clerkId: v.string(),
  clerkOrgId: v.string(),
  organizationId: v.id("organizations"),
  emailAddress: v.string(),
  expiresAt: v.number(),
  status: v.union(
    v.literal(OrganizationInvitationStatus.Pending),
    v.literal(OrganizationInvitationStatus.Accepted),
    v.literal(OrganizationInvitationStatus.Revoked),
    v.literal(OrganizationInvitationStatus.Expired)
  ),
});

export const updateInvitationArgsSchema = v.object({
  expiresAt: v.optional(v.number()),
  status: v.optional(
    v.union(
      v.literal(OrganizationInvitationStatus.Pending),
      v.literal(OrganizationInvitationStatus.Accepted),
      v.literal(OrganizationInvitationStatus.Revoked),
      v.literal(OrganizationInvitationStatus.Expired)
    )
  ),
});

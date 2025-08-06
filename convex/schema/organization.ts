import { defineTable } from "convex/server";
import { v } from "convex/values";
import { Doc } from "@convex/_generated/dataModel";
import { workspaceFields } from "./workspace";

export enum OrganizationInvitationStatus {
  Expired = "expired",
  Revoked = "revoked",
  Pending = "pending",
  Accepted = "accepted",
}

export const organizationSchema = v.object({
  name: v.string(),
  clerkId: v.string(),
  ...workspaceFields,
});

export const organizationMembershipSchema = v.object({
  clerkId: v.string(),
  clerkOrgId: v.string(),
  clerkUserId: v.string(),
  organizationId: v.id("organizations"),
  userId: v.id("users"),
  email: v.string(),
  role: v.union(v.literal("admin"), v.literal("member")),
});

export const organizationInvitationSchema = v.object({
  clerkId: v.string(),
  clerkOrgId: v.string(),
  organizationId: v.id("organizations"),
  emailAddress: v.string(),
  expiresAt: v.number(),
  status: v.union(
    v.literal(OrganizationInvitationStatus.Expired),
    v.literal(OrganizationInvitationStatus.Revoked),
    v.literal(OrganizationInvitationStatus.Pending),
    v.literal(OrganizationInvitationStatus.Accepted)
  ),
});

export type Organization = Doc<"organizations">;
export type OrganizationMembership = Doc<"organization_memberships">;
export type OrganizationInvitation = Doc<"organization_invitations">;

export const organizationTable = defineTable(organizationSchema).index(
  "by_clerk_id",
  ["clerkId"]
);

export const organizationMembershipTable = defineTable(
  organizationMembershipSchema
)
  .index("by_clerk_id", ["clerkId"])
  .index("by_organization", ["organizationId"])
  .index("by_clerk_organization_and_user", ["clerkOrgId", "clerkUserId"]);

export const organizationInvitationTable = defineTable(
  organizationInvitationSchema
)
  .index("by_clerk_id", ["clerkId"])
  .index("by_organization", ["organizationId"])
  .index("by_email_address", ["emailAddress"]);

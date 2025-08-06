import { defineSchema } from "convex/server";

import {
  organizationTable,
  organizationMembershipTable,
  organizationInvitationTable,
} from "@convex/schema/organization";
import { userTable } from "@convex/schema/user";
import { avatarTable } from "@convex/schema/resources/avatar";
import { flowTable } from "@convex/schema/flows";
import { renderedVideoTable } from "@convex/schema/rendered_video";
import {
  productDatasetTable,
  productDatasetAssetTable,
} from "@convex/schema/resources/product_dataset";
import { contentPillarTable } from "./schema/content_pillar";

export default defineSchema({
  users: userTable,
  organizations: organizationTable,
  organization_memberships: organizationMembershipTable,
  organization_invitations: organizationInvitationTable,
  avatars: avatarTable,
  flows: flowTable,
  rendered_videos: renderedVideoTable,
  product_datasets: productDatasetTable,
  product_dataset_assets: productDatasetAssetTable,
  content_pillars: contentPillarTable,
});

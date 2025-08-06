import { Infer, v } from "convex/values";
import { Doc } from "@convex/_generated/dataModel";
import { defineTable } from "convex/server";
import { workspaceIdSchema } from "./workspace";

export enum ContentPillarStatus {
  Active = "active",
  Inactive = "inactive",
  Deleted = "deleted",
}

export enum IdeaStatus {
  Draft = "draft",
  Used = "used",
  Archived = "archived",
}

export const ideaStatusSchema = v.union(
  v.literal(IdeaStatus.Draft),
  v.literal(IdeaStatus.Used),
  v.literal(IdeaStatus.Archived)
);

export const contentPillarStatusSchema = v.union(
  v.literal(ContentPillarStatus.Active),
  v.literal(ContentPillarStatus.Inactive),
  v.literal(ContentPillarStatus.Deleted)
);

export const ideaSchema = v.object({
  id: v.string(),
  status: ideaStatusSchema,
  title: v.string(),
  summary: v.string(),
  script: v.string(),
});

export const contentPillarSchema = v.object({
  workspaceId: workspaceIdSchema,
  status: contentPillarStatusSchema,
  ideas: v.array(ideaSchema),
  title: v.string(),
  summary: v.string(),
  purpose: v.string(),
  audience: v.string(),
  tone: v.string(),
});

export type Idea = Infer<typeof ideaSchema>;

export type ContentPillar = Doc<"content_pillars">;

export const contentPillarTable = defineTable(contentPillarSchema).index(
  "by_workspace_id",
  ["workspaceId"]
);

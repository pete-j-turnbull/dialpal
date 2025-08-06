import { defineTable } from "convex/server";
import { v } from "convex/values";
import { Doc } from "@convex/_generated/dataModel";
import { workspaceIdSchema } from "./workspace";

export enum FlowType {
  ThoughtLeadership916 = "thought_leadership_916",
  ThoughtLeadership169 = "thought_leadership_169",
  Raw = "raw",
}

const flowBaseFields = {
  workspaceId: workspaceIdSchema,
  isError: v.optional(v.boolean()),
  error: v.optional(v.string()),
};

const flowThoughtLeadership916Schema = v.object({
  ...flowBaseFields,
  type: v.literal(FlowType.ThoughtLeadership916),
  avatarId: v.id("avatars"),
  productDatasetId: v.optional(v.id("product_datasets")),
  script: v.string(),
  title: v.string(),
  templatedVideo: v.optional(v.any()),
  output: v.optional(v.string()),
  voiceGenerating: v.optional(v.boolean()),
  voiceGenerationHash: v.optional(v.string()),
  videoGenerating: v.optional(v.boolean()),
});

const flowThoughtLeadership169Schema = v.object({
  ...flowBaseFields,
  type: v.literal(FlowType.ThoughtLeadership169),
  avatarId: v.id("avatars"),
  productDatasetId: v.optional(v.id("product_datasets")),
  script: v.string(),
  title: v.string(),
  templatedVideo: v.optional(v.any()),
  output: v.optional(v.string()),
  voiceGenerating: v.optional(v.boolean()),
  voiceGenerationHash: v.optional(v.string()),
  videoGenerating: v.optional(v.boolean()),
});

const flowRaw = v.object({
  ...flowBaseFields,
  type: v.literal(FlowType.Raw),
  avatarId: v.id("avatars"),
  script: v.string(),
  title: v.string(),
  templatedVideo: v.optional(v.any()),
  output: v.optional(v.string()),
  voiceGenerating: v.optional(v.boolean()),
  voiceGenerationHash: v.optional(v.string()),
  videoGenerating: v.optional(v.boolean()),
});

export const flowSchema = v.union(
  flowThoughtLeadership916Schema,
  flowThoughtLeadership169Schema,
  flowRaw
);

export type Flow = Doc<"flows">;

export type FlowThoughtLeadership916 = Doc<"flows"> & {
  type: FlowType.ThoughtLeadership916;
};
export type FlowThoughtLeadership169 = Doc<"flows"> & {
  type: FlowType.ThoughtLeadership169;
};
export type FlowRaw = Doc<"flows"> & {
  type: FlowType.Raw;
};

export const flowTable = defineTable(flowSchema);

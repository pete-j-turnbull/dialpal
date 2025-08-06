import { defineTable } from "convex/server";
import { Infer, v } from "convex/values";
import { Doc } from "@convex/_generated/dataModel";
import { fileVideoSchema } from "../common";
import { workspaceIdSchema } from "../workspace";

const timedTextEntrySchema = v.object({
  text: v.string(),
  startTime: v.number(),
  endTime: v.number(),
});

export const richTranscriptSchema = v.object({
  content: v.optional(v.string()),
  title: v.optional(v.string()),
  summary: v.optional(v.string()),
  speech: v.optional(v.array(timedTextEntrySchema)),
  visualSceneDescription: v.optional(v.array(timedTextEntrySchema)),
  sceneText: v.optional(v.array(timedTextEntrySchema)),
});

export type TimedTextEntry = Infer<typeof timedTextEntrySchema>;
export type RichTranscript = Infer<typeof richTranscriptSchema>;

export enum ProductDatasetAssetType {
  Logo = "logo",
  CallToAction = "call_to_action",
  UserJourney = "user_journey",
  PainPoint = "pain_point",
  Solution = "solution",
}

export enum ProductDatasetAssetStatus {
  Ready = "ready",
  Processing = "processing",
  Failed = "failed",
}

export const productDatasetAssetTypeSchema = v.union(
  v.literal(ProductDatasetAssetType.Logo),
  v.literal(ProductDatasetAssetType.CallToAction),
  v.literal(ProductDatasetAssetType.UserJourney),
  v.literal(ProductDatasetAssetType.PainPoint),
  v.literal(ProductDatasetAssetType.Solution)
);

export const productDatasetAssetStatusSchema = v.union(
  v.literal(ProductDatasetAssetStatus.Ready),
  v.literal(ProductDatasetAssetStatus.Processing),
  v.literal(ProductDatasetAssetStatus.Failed)
);

const baseAssetFields = {
  productDatasetId: v.id("product_datasets"),
  type: productDatasetAssetTypeSchema,
  file: fileVideoSchema,
  error: v.optional(v.union(v.null(), v.string())),
};

const assetSchemaReady = v.object({
  ...baseAssetFields,
  status: v.literal(ProductDatasetAssetStatus.Ready),
  cloudGlueFileId: v.string(),
  cloudGlueFileUri: v.string(),
  richTranscript: richTranscriptSchema,
});

const assetSchemaNotReady = v.object({
  ...baseAssetFields,
  status: v.union(
    v.literal(ProductDatasetAssetStatus.Processing),
    v.literal(ProductDatasetAssetStatus.Failed)
  ),
});

export const productDatasetAssetSchema = v.union(
  assetSchemaReady,
  assetSchemaNotReady
);

export const productDatasetSchema = v.object({
  name: v.string(),
  workspaceId: workspaceIdSchema,
  assetCount: v.optional(v.number()),
});

export type ProductDataset = Doc<"product_datasets">;
export type ProductDatasetAsset = Doc<"product_dataset_assets">;

export type ProductDatasetAssetReady = ProductDatasetAsset &
  Infer<typeof assetSchemaReady>;

export const productDatasetAssetTable = defineTable(
  productDatasetAssetSchema
).index("by_product_dataset", ["productDatasetId"]);

export const productDatasetTable = defineTable(productDatasetSchema).index(
  "by_workspace",
  ["workspaceId"]
);

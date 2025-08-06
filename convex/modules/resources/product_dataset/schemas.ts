import { fileVideoSchema } from "@convex/schema/common";
import {
  productDatasetAssetStatusSchema,
  productDatasetAssetTypeSchema,
  richTranscriptSchema,
} from "@convex/schema/resources/product_dataset";
import { workspaceIdSchema } from "@convex/schema/workspace";
import { v } from "convex/values";

export const createArgsSchema = v.object({
  workspaceId: workspaceIdSchema,
  name: v.string(),
});

export const createAssetArgsSchema = v.object({
  productDatasetId: v.id("product_datasets"),
  type: productDatasetAssetTypeSchema,
  file: fileVideoSchema,
});

export const updateArgsSchema = v.object({
  name: v.optional(v.string()),
});

export const updateAssetArgsSchema = v.object({
  status: v.optional(productDatasetAssetStatusSchema),
  cloudGlueFileId: v.optional(v.string()),
  cloudGlueFileUri: v.optional(v.string()),
  richTranscript: v.optional(richTranscriptSchema),
  error: v.optional(v.union(v.null(), v.string())),
});

import {
  privateQuery,
  privateMutation,
  privateAction,
} from "@convex/functions";
import * as module from "@convex/modules/resources/product_dataset";
import {
  updateArgsSchema,
  updateAssetArgsSchema,
} from "@convex/modules/resources/product_dataset/schemas";
import {
  ProductDatasetAssetType,
  productDatasetAssetTypeSchema,
} from "@convex/schema/resources/product_dataset";
import { v } from "convex/values";

export const get = privateQuery({
  args: { id: v.id("product_datasets") },
  handler: async (ctx, args) => {
    return await module.get(ctx, args);
  },
});

export const getAsset = privateQuery({
  args: { id: v.id("product_dataset_assets") },
  handler: async (ctx, args) => {
    return await module.getAsset(ctx, args);
  },
});

export const update = privateMutation({
  args: {
    id: v.id("product_datasets"),
    data: updateArgsSchema,
  },
  handler: async (ctx, args) => {
    return await module.update(ctx, args);
  },
});

export const updateAsset = privateMutation({
  args: {
    id: v.id("product_dataset_assets"),
    data: updateAssetArgsSchema,
  },
  handler: async (ctx, args) => {
    return await module.updateAsset(ctx, args);
  },
});

export const searchClips = privateAction({
  args: {
    productDatasetId: v.id("product_datasets"),
    data: v.object({
      query: v.string(),
      duration: v.number(),
      filter: v.object({
        type: v.union(
          v.literal(ProductDatasetAssetType.Logo),
          v.literal(ProductDatasetAssetType.CallToAction),
          v.literal(ProductDatasetAssetType.UserJourney),
          v.literal(ProductDatasetAssetType.PainPoint),
          v.literal(ProductDatasetAssetType.Solution)
        ),
      }),
    }),
  },
  handler: async (ctx, args) => {
    return await module.searchClipsAction(ctx, args);
  },
});

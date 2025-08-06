import { rootQuery, rootMutation, rootAction } from "@convex/functions";
import * as module from "@convex/modules/resources/product_dataset";
import {
  updateArgsSchema,
  createAssetArgsSchema,
  updateAssetArgsSchema,
  createArgsSchema,
} from "@convex/modules/resources/product_dataset/schemas";
import { workspaceIdSchema } from "@convex/schema/workspace";
import { ProductDatasetAssetType } from "@convex/schema/resources/product_dataset";
import { v } from "convex/values";
import { internal } from "@convex/_generated/api";

export const get = rootQuery({
  args: { id: v.id("product_datasets") },
  handler: async (ctx, args) => {
    return await module.get(ctx, args);
  },
});

export const listByWorkspace = rootQuery({
  args: { workspaceId: workspaceIdSchema },
  handler: async (ctx, args) => {
    return await module.listByWorkspace(ctx, args);
  },
});

export const create = rootMutation({
  args: {
    data: createArgsSchema,
  },
  handler: async (ctx, args) => {
    return await module.create(ctx, args);
  },
});

export const update = rootMutation({
  args: {
    id: v.id("product_datasets"),
    data: updateArgsSchema,
  },
  handler: async (ctx, args) => {
    const productDataset = await module.get(ctx, {
      id: args.id,
    });

    if (!productDataset) throw new Error("Product dataset not found");

    return await module.update(ctx, args);
  },
});

export const searchClips = rootAction({
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

export const listAssets = rootQuery({
  args: { productDatasetId: v.id("product_datasets") },
  handler: async (ctx, args) => {
    const productDataset = await module.get(ctx, {
      id: args.productDatasetId,
    });

    if (!productDataset) throw new Error("Product dataset not found");

    return await module.listAssets(ctx, args);
  },
});

export const getAsset = rootQuery({
  args: { id: v.id("product_dataset_assets") },
  handler: async (ctx, args) => {
    return await module.getAsset(ctx, args);
  },
});

export const createAsset = rootMutation({
  args: {
    data: createAssetArgsSchema,
  },
  handler: async (ctx, args) => {
    const productDataset = await module.get(ctx, {
      id: args.data.productDatasetId,
    });

    if (!productDataset) throw new Error("Product dataset not found");

    return await module.createAsset(ctx, args);
  },
});

export const updateAsset = rootMutation({
  args: {
    id: v.id("product_dataset_assets"),
    data: updateAssetArgsSchema,
  },
  handler: async (ctx, args) => {
    const asset = await module.getAsset(ctx, {
      id: args.id,
    });

    if (!asset) throw new Error("Asset not found");

    return await module.updateAsset(ctx, args);
  },
});

export const remove = rootMutation({
  args: {
    id: v.id("product_datasets"),
  },
  handler: async (ctx, args) => {
    const productDataset = await module.get(ctx, {
      id: args.id,
    });

    if (!productDataset) throw new Error("Product dataset not found");

    return await module.remove(ctx, args);
  },
});

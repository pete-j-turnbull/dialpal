import { internal } from "@convex/_generated/api";
import {
  protectedAction,
  protectedMutation,
  protectedQuery,
} from "@convex/functions";
import * as module from "@convex/modules/resources/product_dataset";
import { updateArgsSchema } from "@convex/modules/resources/product_dataset/schemas";
import { ProductDatasetAssetType } from "@convex/schema/resources/product_dataset";
import { v } from "convex/values";

export const get = protectedQuery({
  args: { id: v.id("product_datasets") },
  handler: async (ctx, args) => {
    const { organizationId, userId } = ctx;

    const workspaceId = organizationId ?? userId;

    const productDataset = await module.get(ctx, args);
    return productDataset?.workspaceId === workspaceId ? productDataset : null;
  },
});

export const list = protectedQuery({
  handler: async (ctx) => {
    const { organizationId, userId } = ctx;

    const workspaceId = organizationId ?? userId;

    return await module.listByWorkspace(ctx, {
      workspaceId,
    });
  },
});

export const listAssets = protectedQuery({
  args: { productDatasetId: v.id("product_datasets") },
  handler: async (ctx, args) => {
    const { organizationId, userId } = ctx;

    const workspaceId = organizationId ?? userId;

    const productDataset = await module.get(ctx, { id: args.productDatasetId });
    if (!productDataset || productDataset.workspaceId !== workspaceId)
      throw new Error("Product dataset not found");

    return await module.listAssets(ctx, {
      productDatasetId: args.productDatasetId,
    });
  },
});

export const create = protectedMutation({
  args: {
    data: v.object({
      name: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const { organizationId, userId } = ctx;

    const workspaceId = organizationId ?? userId;

    return await module.create(ctx, {
      data: {
        ...args.data,
        workspaceId,
      },
    });
  },
});

export const update = protectedMutation({
  args: {
    id: v.id("product_datasets"),
    data: updateArgsSchema,
  },
  handler: async (ctx, args) => {
    const { organizationId, userId } = ctx;

    const workspaceId = organizationId ?? userId;

    const productDataset = await module.get(ctx, {
      id: args.id,
    });

    if (!productDataset) throw new Error("Product dataset not found");
    if (productDataset.workspaceId !== workspaceId)
      throw new Error("Product dataset not found");

    return await module.update(ctx, args);
  },
});

export const remove = protectedMutation({
  args: {
    id: v.id("product_datasets"),
  },
  handler: async (ctx, args) => {
    const { organizationId, userId } = ctx;

    const workspaceId = organizationId ?? userId;

    const productDataset = await module.get(ctx, {
      id: args.id,
    });

    if (!productDataset) throw new Error("Product dataset not found");
    if (productDataset.workspaceId !== workspaceId)
      throw new Error("Product dataset not found");

    return await module.remove(ctx, args);
  },
});

export const searchClips = protectedAction({
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
    const { organizationId, userId } = ctx;

    const workspaceId = organizationId ?? userId;

    const productDataset = await ctx.runQuery(
      internal.modules.resources.product_dataset.index._get,
      { id: args.productDatasetId }
    );
    if (!productDataset || productDataset.workspaceId !== workspaceId)
      throw new Error("Product dataset not found");

    return await module.searchClipsAction(ctx, args);
  },
});

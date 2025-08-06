import { type Id } from "@convex/_generated/dataModel";
import {
  internalQuery,
  internalMutation,
  internalAction,
  type MutationCtx,
  type QueryCtx,
  ActionCtx,
} from "@convex/functions";
import { WorkspaceId, workspaceIdSchema } from "@convex/schema/workspace";
import { Infer, v } from "convex/values";
import {
  createArgsSchema,
  createAssetArgsSchema,
  updateArgsSchema,
  updateAssetArgsSchema,
} from "./schemas";
import {
  ProductDatasetAssetReady,
  ProductDatasetAssetStatus,
  ProductDatasetAssetType,
} from "@convex/schema/resources/product_dataset";
import { retrier } from "@convex/components";
import { internal } from "@convex/_generated/api";
import { trigger } from "@convex/lib/trigger";
import { ProcessAssetTask } from "./trigger";
import { FileVideo } from "@convex/schema/common";
import { prompt } from "./prompts/search_clips";
import { executePrompt, parseClipsFromText } from "./helpers";

export async function get(ctx: QueryCtx, args: { id: Id<"product_datasets"> }) {
  const { id } = args;
  return await ctx.db.get(id);
}

export async function listByWorkspace(
  ctx: QueryCtx,
  args: { workspaceId: WorkspaceId }
) {
  const { workspaceId } = args;
  return await ctx.db
    .query("product_datasets")
    .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
    .collect();
}

export async function create(
  ctx: MutationCtx,
  args: { data: Infer<typeof createArgsSchema> }
) {
  const { data } = args;

  const productDatasetId = await ctx.db.insert("product_datasets", data);

  return productDatasetId;
}

export async function update(
  ctx: MutationCtx,
  args: { id: Id<"product_datasets">; data: Infer<typeof updateArgsSchema> }
) {
  const { id, data } = args;
  return await ctx.db.patch(id, data);
}

export async function remove(
  ctx: MutationCtx,
  args: { id: Id<"product_datasets"> }
) {
  const { id } = args;
  return await ctx.db.delete(id);
}

export async function listAssets(
  ctx: QueryCtx,
  args: { productDatasetId: Id<"product_datasets"> }
) {
  const { productDatasetId } = args;
  return await ctx.db
    .query("product_dataset_assets")
    .withIndex("by_product_dataset", (q) =>
      q.eq("productDatasetId", productDatasetId)
    )
    .collect();
}

export async function getAsset(
  ctx: QueryCtx,
  args: { id: Id<"product_dataset_assets"> }
) {
  const { id } = args;
  return await ctx.db.get(id);
}

export async function createAsset(
  ctx: MutationCtx,
  args: { data: Infer<typeof createAssetArgsSchema> }
) {
  const { data } = args;

  const productDataset = await ctx.db.get(data.productDatasetId);
  if (!productDataset) throw new Error("Product dataset not found");

  const assetId = await ctx.db.insert("product_dataset_assets", {
    ...data,
    status: ProductDatasetAssetStatus.Processing,
  });

  await ctx.db.patch(data.productDatasetId, {
    assetCount: (productDataset.assetCount ?? 0) + 1,
  });

  await retrier.run(
    ctx,
    internal.modules.resources.product_dataset.index._processAction,
    { id: assetId },
    { maxFailures: 2 }
  );

  return assetId;
}

export async function updateAsset(
  ctx: MutationCtx,
  args: {
    id: Id<"product_dataset_assets">;
    data: Infer<typeof updateAssetArgsSchema>;
  }
) {
  const { id, data } = args;
  return await ctx.db.patch(id, data);
}

export async function searchClipsAction(
  ctx: ActionCtx,
  args: {
    productDatasetId: Id<"product_datasets">;
    data: {
      query: string;
      duration: number;
      filter: { type: ProductDatasetAssetType };
    };
  }
): Promise<
  {
    assetId: Id<"product_dataset_assets">;
    type: ProductDatasetAssetType;
    file: FileVideo;
    start: number;
    end: number;
  }[]
> {
  const { productDatasetId, data } = args;
  const { query, duration, filter } = data;

  const assets = await ctx.runQuery(
    internal.modules.resources.product_dataset.index._listAssets,
    { productDatasetId }
  );
  if (!assets) throw new Error("Product dataset not found");

  const videos = assets
    .filter(
      (asset) =>
        asset.status === ProductDatasetAssetStatus.Ready &&
        asset.type === filter.type
    )
    .map((a) => a as ProductDatasetAssetReady);

  console.log("Videos to search", { videos });

  const rawOutput = await executePrompt({
    prompt: prompt(
      query,
      duration,
      videos.map((v) => ({
        id: v._id,
        transcript: v.richTranscript,
      }))
    ),
    system: `You are a helpful assistant that can search through video transcripts and find clips that match a given query.`,
  });
  const rawClips = parseClipsFromText(rawOutput);

  console.log("Raw clips", { rawClips });

  const clips: {
    assetId: Id<"product_dataset_assets">;
    type: ProductDatasetAssetType;
    file: FileVideo;
    start: number;
    end: number;
  }[] = [];

  for (const clip of rawClips) {
    const video = videos.find((v) => v._id === clip.id);
    if (!video) continue;

    clips.push({
      assetId: clip.id,
      type: filter.type,
      file: video.file,
      start: clip.start,
      end: clip.end,
    });
  }

  return clips;
}

/** Internal API */

// Internal query to get a single avatar by ID
export const _get = internalQuery({
  args: { id: v.id("product_datasets") },
  handler: async (ctx, args) => {
    return await get(ctx, args);
  },
});

// Internal query to list avatars by workspace
export const _listByWorkspace = internalQuery({
  args: { workspaceId: workspaceIdSchema },
  handler: async (ctx, args) => {
    return await listByWorkspace(ctx, args);
  },
});

// Internal mutation to create an avatar
export const _create = internalMutation({
  args: { data: createArgsSchema },
  handler: async (ctx, args) => {
    return await create(ctx, args);
  },
});

// Internal mutation to update an avatar
export const _update = internalMutation({
  args: {
    id: v.id("product_datasets"),
    data: updateArgsSchema,
  },
  handler: async (ctx, args) => {
    return await update(ctx, args);
  },
});

// Internal mutation to remove an avatar
export const _remove = internalMutation({
  args: { id: v.id("product_datasets") },
  handler: async (ctx, args) => {
    return await remove(ctx, args);
  },
});

export const _listAssets = internalQuery({
  args: { productDatasetId: v.id("product_datasets") },
  handler: async (ctx, args) => {
    return await listAssets(ctx, args);
  },
});

export const _createAsset = internalMutation({
  args: { data: createAssetArgsSchema },
  handler: async (ctx, args) => {
    return await createAsset(ctx, args);
  },
});

export const _updateAsset = internalMutation({
  args: {
    id: v.id("product_dataset_assets"),
    data: updateAssetArgsSchema,
  },
  handler: async (ctx, args) => {
    return await updateAsset(ctx, args);
  },
});

export const _processAction = internalAction({
  args: { id: v.id("product_dataset_assets") },
  handler: async (ctx, args) => {
    const { id } = args;

    await trigger.runTask<ProcessAssetTask>(
      "resources/product_dataset/process-asset",
      { assetId: id }
    );
  },
});

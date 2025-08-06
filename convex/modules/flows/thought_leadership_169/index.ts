import { Infer, v } from "convex/values";
import { Id } from "@convex/_generated/dataModel";
import {
  type QueryCtx,
  type MutationCtx,
  internalQuery,
  internalMutation,
  internalAction,
} from "@convex/functions";
import { createArgsSchema, updateArgsSchema } from "./schemas";
import { FlowType, FlowThoughtLeadership169 } from "@convex/schema/flows";
import {
  GenerateTemplateTask,
  GenerateVideoTask,
  GenerateVoiceTask,
} from "./trigger";
import { trigger } from "@convex/lib/trigger";
import { retrier } from "@convex/components";
import { internal } from "@convex/_generated/api";
import { AvatarStatus, ReadyAvatar } from "@convex/schema/resources/avatar";
import * as workspaceModule from "@convex/modules/workspace";
import * as avatarModule from "@convex/modules/resources/avatar";

export * from "./schemas";

export async function get(
  ctx: QueryCtx,
  args: { id: Id<"flows"> }
): Promise<FlowThoughtLeadership169 | null> {
  const { id } = args;

  const flow = await ctx.db.get(id);
  if (flow && flow.type === FlowType.ThoughtLeadership169) {
    return flow;
  }

  return null;
}

export async function create(
  ctx: MutationCtx,
  args: {
    data: Infer<typeof createArgsSchema>;
  }
) {
  const { data } = args;

  const flowId = await ctx.db.insert("flows", {
    type: FlowType.ThoughtLeadership169,
    workspaceId: data.workspaceId,
    avatarId: data.avatarId,
    productDatasetId: data.productDatasetId,
    script: data.script,
    title: "Untitled",
  });

  await retrier.run(
    ctx,
    internal.modules.flows.thought_leadership_169.index._generateTemplate,
    { id: flowId },
    { maxFailures: 2 }
  );

  return flowId;
}

export async function update(
  ctx: MutationCtx,
  args: {
    id: Id<"flows">;
    data: Infer<typeof updateArgsSchema>;
  }
) {
  const { id, data } = args;

  return await ctx.db.patch(id, data);
}

export async function generateVoice(
  ctx: MutationCtx,
  args: { id: Id<"flows"> }
) {
  const { id } = args;

  const flow = await get(ctx, { id });
  if (!flow) return;

  await ctx.db.patch(id, {
    voiceGenerating: true,
  });

  await retrier.run(
    ctx,
    internal.modules.flows.thought_leadership_169.index._generateVoice,
    { id },
    { maxFailures: 2 }
  );
}

export async function generateVideo(
  ctx: MutationCtx,
  args: { id: Id<"flows"> }
) {
  const { id } = args;

  const flow = await get(ctx, { id });
  if (!flow) return;

  await ctx.db.patch(id, {
    videoGenerating: true,
  });

  await retrier.run(
    ctx,
    internal.modules.flows.thought_leadership_169.index._generateVideo,
    { id },
    { maxFailures: 2 }
  );
}

export async function fetchRequiredDataForTemplate(
  ctx: QueryCtx,
  args: { id: Id<"flows"> }
) {
  const { id } = args;

  const flow = await get(ctx, { id });
  if (!flow) throw new Error("Flow not found");

  const avatar = await avatarModule.get(ctx, { id: flow.avatarId });
  if (
    !avatar ||
    avatar.status !== AvatarStatus.Ready ||
    !avatar.preview ||
    avatar.aspect !== "16:9"
  ) {
    throw new Error("Avatar not found or not ready");
  }

  const workspace = await workspaceModule.get(ctx, {
    id: flow.workspaceId,
  });

  return {
    flow,
    avatar: avatar as ReadyAvatar & { aspect: "16:9" },
    workspace,
  };
}

/** Internal API */

export const _get = internalQuery({
  args: { id: v.id("flows") },
  handler: async (ctx, args) => {
    return get(ctx, args);
  },
});

export const _create = internalMutation({
  args: {
    data: createArgsSchema,
  },
  handler: async (ctx, args) => {
    return create(ctx, args);
  },
});

export const _update = internalMutation({
  args: {
    id: v.id("flows"),
    data: updateArgsSchema,
  },
  handler: async (ctx, args) => {
    return update(ctx, args);
  },
});

export const _generateTemplate = internalAction({
  args: { id: v.id("flows") },
  handler: async (ctx, args) => {
    const { id } = args;

    await trigger.runTask<GenerateTemplateTask>(
      "flows/thought_leadership_169/generate-template",
      { flowId: id }
    );
  },
});

export const _generateVoice = internalAction({
  args: { id: v.id("flows") },
  handler: async (ctx, args) => {
    const { id } = args;

    await trigger.runTask<GenerateVoiceTask>(
      "flows/thought_leadership_169/generate-voice",
      { flowId: id }
    );
  },
});

export const _generateVideo = internalAction({
  args: { id: v.id("flows") },
  handler: async (ctx, args) => {
    const { id } = args;

    await trigger.runTask<GenerateVideoTask>(
      "flows/thought_leadership_169/generate-video",
      { flowId: id }
    );
  },
});

"use node";

import { api } from "@convex/_generated/api";
import { convex } from "@convex/lib/convex";
import { WorkspaceId } from "@convex/schema/workspace";
import { schemaTask } from "@trigger.dev/sdk";
import { v4 as uuid } from "uuid";
import { z } from "zod";
import { executePrompt, parseContentPillarsFromText } from "../helpers";
import { prompt } from "../prompts/generate_content_pillars";
import { ContentPillarStatus, IdeaStatus } from "@convex/schema/content_pillar";

export const generateContentPillars = schemaTask({
  id: "insights/generate-content-pillars",
  schema: z.object({
    workspaceId: z.string().transform((val) => val as WorkspaceId),
  }),
  maxDuration: 300,
  retry: {
    maxAttempts: 2,
  },
  machine: "medium-1x",
  run: async (payload) => {
    const { workspaceId } = payload;

    const workspace = await convex.query(api.private.workspace.get, {
      id: workspaceId,
    });

    if (!workspace.creatorDNA) {
      throw new Error("Creator DNA not found");
    }

    const rawOutput = await executePrompt({
      prompt: prompt(workspace.creatorDNA),
      system: `You are a strategic content advisor and short-form video strategist. Your job is to generate high-converting personalised content pillars and related video script ideas, aligned with the creator's personal brand and the company's mission. The final output must be valid XML, strictly structured for downstream processing.`,
    });

    const parsedContentPillars = parseContentPillarsFromText(rawOutput);
    const pillarsToCreate = parsedContentPillars.slice(0, 3).map((p) => ({
      ...p,
      status: ContentPillarStatus.Active,
      ideas: p.ideas.map((i) => ({
        ...i,
        id: uuid(),
        status: IdeaStatus.Draft,
      })),
    }));

    await convex.mutation(api.private.insights.createContentPillars, {
      workspaceId,
      data: pillarsToCreate,
    });

    await convex.mutation(api.private.workspace.update, {
      id: workspaceId,
      data: {
        isGeneratingContentPillars: false,
      },
    });
  },
  onFailure: async ({ payload, error }) => {
    await convex.mutation(api.private.workspace.update, {
      id: payload.workspaceId,
      data: {
        isGeneratingContentPillars: false,
      },
    });
  },
});

export type GenerateContentPillarsTask = typeof generateContentPillars;

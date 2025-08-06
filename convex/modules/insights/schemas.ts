import {
  contentPillarStatusSchema,
  ideaStatusSchema,
} from "@convex/schema/content_pillar";
import { v } from "convex/values";

export const createContentPillarArgsSchema = v.object({
  status: contentPillarStatusSchema,
  title: v.string(),
  summary: v.string(),
  purpose: v.string(),
  audience: v.string(),
  tone: v.string(),
  ideas: v.array(
    v.object({
      id: v.string(),
      title: v.string(),
      summary: v.string(),
      script: v.string(),
      status: ideaStatusSchema,
    })
  ),
});

export const updateContentPillarArgsSchema = v.object({
  status: v.optional(contentPillarStatusSchema),
  ideas: v.optional(
    v.array(
      v.object({
        id: v.string(),
        status: v.union(ideaStatusSchema),
      })
    )
  ),
});

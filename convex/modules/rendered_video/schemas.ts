import { v } from "convex/values";
import { fileVideoSchema } from "@convex/schema/common";
import { ExportStatus } from "@convex/schema/rendered_video";
import { workspaceIdSchema } from "@convex/schema/workspace";

export const createArgsSchema = v.object({
  workspaceId: workspaceIdSchema,
  composition: v.any(),
});

export const updateArgsSchema = v.object({
  exportStatus: v.optional(
    v.union(
      v.literal(ExportStatus.Exporting),
      v.literal(ExportStatus.Ready),
      v.literal(ExportStatus.Failed)
    )
  ),
  exportError: v.optional(v.string()),
  exportFile: v.optional(fileVideoSchema),
});

import { defineTable } from "convex/server";
import { v } from "convex/values";
import { Doc } from "@convex/_generated/dataModel";
import { fileVideoSchema } from "./common";
import { workspaceIdSchema } from "./workspace";

export enum ExportStatus {
  Exporting = "exporting",
  Ready = "ready",
  Failed = "failed",
}

const renderedVideoSchema = v.object({
  workspaceId: workspaceIdSchema,
  composition: v.any(),
  exportStatus: v.union(
    v.literal(ExportStatus.Exporting),
    v.literal(ExportStatus.Ready),
    v.literal(ExportStatus.Failed)
  ),
  exportError: v.optional(v.string()),
  exportFile: v.optional(fileVideoSchema),
});

export type RenderedVideo = Doc<"rendered_videos">;

export const renderedVideoTable = defineTable(renderedVideoSchema).index(
  "by_workspace",
  ["workspaceId"]
);

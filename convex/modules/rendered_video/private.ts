import { privateMutation } from "@convex/functions";
import { v } from "convex/values";
import { workspaceIdSchema } from "@convex/schema/workspace";
import { ExportStatus } from "@convex/schema/rendered_video";
import { fileVideoSchema } from "@convex/schema/common";

export const importMany = privateMutation({
  args: {
    workspaceId: workspaceIdSchema,
    data: v.array(fileVideoSchema),
  },
  handler: async (ctx, args) => {
    const { workspaceId, data } = args;

    for (const video of data) {
      await ctx.db.insert("rendered_videos", {
        workspaceId,
        composition: {},
        exportStatus: ExportStatus.Ready,
        exportFile: video,
      });
    }
  },
});

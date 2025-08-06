"use node";

import { generateRandomID } from "@/lib/utils";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { convex } from "@convex/lib/convex";
import { r2 } from "@convex/lib/r2";
import { renderEngine } from "@convex/lib/render_engine";
import { getFileMetadata } from "@convex/modules/common/trigger";
import { FileType, FileVideo } from "@convex/schema/common";
import { ExportStatus } from "@convex/schema/rendered_video";
import { CompositionData } from "@packages/render-engine/types";
import { schemaTask, wait } from "@trigger.dev/sdk";
import { z } from "zod";

// TODO: this should return the render result (error of success) so that the caller can handle it appropriately
const waitForRender = schemaTask({
  id: "render_engine/wait-for-render",
  maxDuration: 60 * 5, // times out after 15 minutes
  schema: z.object({
    renderId: z.string(),
  }),
  run: async (payload) => {
    const { renderId } = payload;

    while (true) {
      const renderState = await renderEngine.getRenderState(renderId);
      if (!renderState) throw new Error("Render state not found");

      const { progress, status, mediaUrl, errors } = renderState;

      if (status === "done") {
        return mediaUrl!;
      } else if (status === "error") {
        const error = (errors ?? []).join(", ");
        throw new Error(error);
      }

      await wait.for({ seconds: 5.5 });
    }
  },
});

export const exportRenderedVideo = schemaTask({
  id: "rendered_video/export",
  machine: "medium-1x",
  schema: z.object({
    id: z.string().transform((val) => val as Id<"rendered_videos">),
  }),
  run: async (payload) => {
    const { id } = payload;

    const renderedVideo = await convex.query(api.private.rendered_video.get, {
      id,
    });

    if (!renderedVideo) throw new Error("Rendered video not found");

    const composition = renderedVideo.composition as CompositionData;

    const renderId = await renderEngine.createRender(composition);
    const renderUrl = await waitForRender
      .triggerAndWait({
        renderId,
      })
      .unwrap();

    const [fileUrl, fileMetadata] = await Promise.all([
      r2.uploadDataFromUrl(renderUrl, "video/mp4"),
      getFileMetadata
        .triggerAndWait({
          url: renderUrl,
        })
        .unwrap(),
    ]);

    const exportFile: FileVideo = {
      id: generateRandomID(),
      type: FileType.Video,
      url: fileUrl,
      filename: `rendered_video_${id}.mp4`,
      contentType: "video/mp4",
      metadata: fileMetadata as FileVideo["metadata"],
    };

    await convex.mutation(api.private.rendered_video.update, {
      id,
      data: {
        exportFile,
        exportStatus: ExportStatus.Ready,
      },
    });
  },
  onFailure: async ({ payload, error }) => {
    const { id } = payload;

    await convex.mutation(api.private.rendered_video.update, {
      id,
      data: {
        exportStatus: ExportStatus.Failed,
        exportError: error instanceof Error ? error.message : "Unknown error",
      },
    });
  },
});

export type ExportRenderedVideoTask = typeof exportRenderedVideo;

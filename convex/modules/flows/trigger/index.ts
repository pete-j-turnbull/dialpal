"use node";

import { heygen } from "@convex/lib/heygen";
import { HeygenVideoStatus } from "@convex/lib/heygen/const";
import { schemaTask, wait } from "@trigger.dev/sdk";

import _ from "lodash";
import { z } from "zod";

const waitForTalkingHead = schemaTask({
  id: "flows/wait-for-talking-head",
  maxDuration: 60 * 15, // times out after 15 minutes
  schema: z.object({
    heygenVideoId: z.string(),
  }),
  run: async (payload) => {
    const { heygenVideoId } = payload;

    console.info("waiting for talking head", { heygenVideoId });

    while (true) {
      console.info("getting heygen video", { heygenVideoId });

      const result = await heygen.getVideo(heygenVideoId);

      console.info("heygen video result", { result });

      if (!result.success) throw new Error("Failed to get video");

      const { status, videoUrl, errorDetails } = result.data;

      console.info("heygen video status", {
        status,
        videoUrl,
        errorDetails,
      });

      switch (status) {
        case HeygenVideoStatus.Pending:
          break;
        case HeygenVideoStatus.Processing:
          break;
        case HeygenVideoStatus.Waiting:
          break;
        case HeygenVideoStatus.Failed:
          throw new Error(
            "Video gen failed: " + (errorDetails?.message ?? "Unknown")
          );
        case HeygenVideoStatus.Completed:
          return { videoUrl: videoUrl! };
        default:
          console.info("hit default");
          break;
      }

      await wait.for({ seconds: 5.5 });
    }
  },
});

export const generateTalkingHead = schemaTask({
  id: "flows/generate-talking-head",
  maxDuration: 60 * 15, // times out after 15 minutes
  retry: { maxAttempts: 1 },
  schema: z.object({
    audioUrl: z.string(),
    avatarId: z.string(),
    aspectRatio: z.union([z.literal("9:16"), z.literal("16:9")]),
  }),
  run: async (payload) => {
    const { audioUrl, avatarId, aspectRatio } = payload;

    console.info("generating talking head", {
      audioUrl,
      avatarId,
      aspectRatio,
    });

    const result = await heygen.generateVideo({
      audioFileUrl: audioUrl,
      avatarId,
      aspectRatio,
    });

    console.info("heygen result", { result });

    if (!result.success) {
      throw new Error(result.error);
    }

    console.info("waiting for talking head", {
      heygenVideoId: result.heygenVideoId,
    });

    const { videoUrl } = await waitForTalkingHead
      .triggerAndWait({
        heygenVideoId: result.heygenVideoId,
      })
      .unwrap();

    console.info("heygen video url", { videoUrl });

    return { videoUrl };
  },
});

export type GenerateTalkingHead = typeof generateTalkingHead;

"use node";

import { convex } from "@convex/lib/convex";
import { idempotencyKeys, schemaTask, wait } from "@trigger.dev/sdk";
import _ from "lodash";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";

import {
  ProductDatasetAssetStatus,
  RichTranscript,
} from "@convex/schema/resources/product_dataset";
import { cloudglue } from "@convex/lib/cloudglue";

const transcribeFile = schemaTask({
  id: "resources/product_dataset/transcribe-file",
  schema: z.object({
    url: z.string(),
  }),
  maxDuration: 300,
  run: async (payload) => {
    const { url } = payload;

    const { job_id: jobId } = await cloudglue.transcribe({ url });

    return await waitUntilTranscriptionJobComplete
      .triggerAndWait({
        jobId,
      })
      .unwrap();
  },
});
const waitUntilTranscriptionJobComplete = schemaTask({
  id: "resources/product_dataset/wait-until-transcription-job-complete",
  schema: z.object({
    jobId: z.string(),
  }),
  maxDuration: 300,
  run: async (payload) => {
    const { jobId } = payload;

    while (true) {
      const transcriptionJob = await cloudglue.getTranscriptionJob({ jobId });

      if (transcriptionJob.status === "completed" && transcriptionJob.data) {
        return {
          content: transcriptionJob.data.content,
          title: transcriptionJob.data.title,
          summary: transcriptionJob.data.summary,
          speech: transcriptionJob.data.speech?.map((speech) => ({
            text: speech.text,
            startTime: Math.round(speech.start_time * 1000),
            endTime: Math.round(speech.end_time * 1000),
          })),
          visualSceneDescription:
            transcriptionJob.data.visual_scene_description?.map(
              (visualSceneDescription) => ({
                text: visualSceneDescription.text,
                startTime: Math.round(visualSceneDescription.start_time * 1000),
                endTime: Math.round(visualSceneDescription.end_time * 1000),
              })
            ),
          sceneText: transcriptionJob.data.scene_text?.map((sceneText) => ({
            text: sceneText.text,
            startTime: Math.round(sceneText.start_time * 1000),
            endTime: Math.round(sceneText.end_time * 1000),
          })),
        } satisfies RichTranscript;
      } else if (transcriptionJob.status === "failed") {
        throw new Error("Failed to process transcription job");
      }

      await wait.for({
        seconds: 5.5,
      });
    }
  },
});

const uploadFile = schemaTask({
  id: "resources/product_dataset/upload-file",
  schema: z.object({
    url: z.string(),
    contentType: z.string(),
    metadata: z.record(z.string(), z.any()),
  }),
  maxDuration: 300,
  run: async (payload) => {
    const { url, contentType, metadata } = payload;

    const { id: fileId } = await cloudglue.uploadFile({
      url,
      contentType,
      metadata,
    });

    return await waitUntilCloudGlueFileReady
      .triggerAndWait({
        fileId,
      })
      .unwrap();
  },
});
const waitUntilCloudGlueFileReady = schemaTask({
  id: "resources/product_dataset/wait-until-cloudglue-file-ready",
  schema: z.object({
    fileId: z.string(),
  }),
  maxDuration: 300,
  run: async (payload, { ctx }) => {
    const { fileId } = payload;

    while (true) {
      const file = await cloudglue.getFile({ fileId });

      if (file.status === "completed") {
        return file;
      } else if (file.status === "failed") {
        throw new Error("Failed to process file");
      }

      await wait.for({
        seconds: 5.5,
      });
    }
  },
});

export const processAsset = schemaTask({
  id: "resources/product_dataset/process-asset",
  schema: z.object({
    assetId: z.string().transform((val) => val as Id<"product_dataset_assets">),
  }),
  maxDuration: 300,
  retry: {
    maxAttempts: 1,
  },
  machine: "medium-2x",
  run: async (payload, { ctx }) => {
    const { assetId } = payload;

    const asset = await convex.query(
      api.private.resources.product_dataset.getAsset,
      {
        id: assetId,
      }
    );
    if (!asset) return;

    const idempotencyKey = await idempotencyKeys.create(assetId);

    const cloudGlueFile = await uploadFile
      .triggerAndWait(
        {
          url: asset.file.url,
          contentType: asset.file.contentType,
          metadata: {},
        },
        { idempotencyKey }
      )
      .unwrap();

    const richTranscript = await transcribeFile
      .triggerAndWait({ url: cloudGlueFile.uri }, { idempotencyKey })
      .unwrap();

    await convex.mutation(api.private.resources.product_dataset.updateAsset, {
      id: assetId,
      data: {
        status: ProductDatasetAssetStatus.Ready,
        cloudGlueFileId: cloudGlueFile.id,
        cloudGlueFileUri: cloudGlueFile.uri,
        richTranscript,
        error: null,
      },
    });
  },
  onFailure: async ({ payload, error }) => {
    const { assetId } = payload;

    console.error(error);

    await convex.mutation(api.private.resources.product_dataset.updateAsset, {
      id: assetId,
      data: {
        status: ProductDatasetAssetStatus.Failed,
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });
  },
});

export type ProcessAssetTask = typeof processAsset;

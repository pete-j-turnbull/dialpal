"use node";

import { ffmpeg } from "@convex/lib/ffmpeg";
import { schemaTask } from "@trigger.dev/sdk";
import { z } from "zod";

export const getFileMetadata = schemaTask({
  id: "common/get-file-metadata",
  machine: "medium-1x",
  schema: z.object({
    url: z.string(),
  }),
  run: async (payload) => {
    const { url } = payload;

    const metadata = await ffmpeg.getMetadata(url);

    return metadata;
  },
});

export type GetFileMetadataTask = typeof getFileMetadata;

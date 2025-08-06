"use node";

import { heygen } from "@convex/lib/heygen";
import { convex } from "@convex/lib/convex";
import { schemaTask } from "@trigger.dev/sdk";
import _ from "lodash";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { cache } from "@convex/lib/cache";
import { AvatarStatus } from "@convex/schema/resources/avatar";
import { ffmpeg } from "@convex/lib/ffmpeg";
import { r2 } from "@convex/lib/r2";
import { FileImage, FileType } from "@convex/schema/common";
import { v4 as uuid } from "uuid";

async function reportError(avatarId: string, error: string): Promise<void> {
  await convex.mutation(api.private.resources.avatar.update, {
    id: avatarId as Id<"avatars">,
    data: { status: AvatarStatus.Error, error },
  });
}

export const processAvatar = schemaTask({
  id: "resources/avatar/process-avatar",
  schema: z.object({
    avatarId: z.string().transform((val) => val as Id<"avatars">),
  }),
  maxDuration: 300,
  retry: {
    maxAttempts: 1,
  },
  machine: "large-1x",
  run: async (payload, { ctx }) => {
    const { avatarId } = payload;

    const avatar = await convex.query(api.private.resources.avatar.get, {
      id: avatarId,
    });
    if (!avatar) return;

    const heygenAvatars = await cache.getOrFetch({
      key: "heygen-avatars",
      ttl: 60 * 60 * 24,
      fetch: async () => {
        return await heygen.getAvatars();
      },
    });
    const avatarDataMap = _.keyBy(
      heygenAvatars.map((a) => ({
        heygenAvatarId: a.id,
        name: a.name,
        previewImageUrl: a.previewImageUrl,
        previewVideoUrl: a.previewVideoUrl,
      })),
      "heygenAvatarId"
    );

    const avatarData = avatarDataMap[avatar.heygenAvatarId];
    if (!avatarData) {
      return await reportError(avatarId, "Avatar not found");
    }

    const previewImageUrl = await r2.uploadDataFromUrl(
      avatarData.previewImageUrl,
      "image/png"
    );
    const imageMetadata = await ffmpeg.getMetadata<FileType.Image>(
      previewImageUrl
    );

    const previewImage: FileImage = {
      id: uuid(),
      type: FileType.Image,
      metadata: imageMetadata,
      filename: "preview.png",
      contentType: "image/png",
      url: previewImageUrl,
    };

    await convex.mutation(api.private.resources.avatar.update, {
      id: avatarId,
      data: {
        status: AvatarStatus.Ready,
        preview: previewImage,
        error: null,
      },
    });
  },
  onFailure: async ({ payload, error }) => {
    const { avatarId } = payload;

    console.error(error);

    await convex.mutation(api.private.resources.avatar.update, {
      id: avatarId,
      data: {
        status: AvatarStatus.Error,
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });
  },
});

export type ProcessAvatarTask = typeof processAvatar;

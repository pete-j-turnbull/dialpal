"use node";

import * as fs from "fs";
import * as path from "path";
import { PassThrough } from "stream";
import { generateRandomID } from "@/lib/utils";
import { convex } from "@convex/lib/convex";
import { idempotencyKeys, queue, schemaTask } from "@trigger.dev/sdk";
import _ from "lodash";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { hashObject, tokenizeScript } from "../../frontend";

import { Orientation, Template, Video } from "@packages/video-templates/raw";
import { elevenlabs } from "@convex/lib/elevenlabs";
import { r2 } from "@convex/lib/r2";
import { FileAudio, FileType, FileVideo } from "@convex/schema/common";
import { getFileMetadata } from "@convex/modules/common/trigger";
import { FlowRaw } from "@convex/schema/flows";
import { generateTalkingHead } from "../../trigger";

const generateVideoQueue = queue({
  name: "flows/raw/generate-video",
  concurrencyLimit: 10,
});

export const generateTemplate = schemaTask({
  id: "flows/raw/generate-template",
  schema: z.object({
    flowId: z.string().transform((val) => val as Id<"flows">),
  }),
  maxDuration: 300,
  retry: {
    maxAttempts: 2,
  },
  machine: "medium-1x",
  run: async (payload) => {
    const { flowId } = payload;

    const requiredData = await convex.query(
      api.private.flows.raw.fetchRequiredDataForTemplate,
      { id: flowId }
    );
    const { flow, avatar } = requiredData;

    const { script } = flow;
    const templatedVideo = flow.templatedVideo as Video | undefined;

    const tokens = tokenizeScript(script);
    const video: Video = {
      tokens,
      config: templatedVideo?.config || {
        orientation: avatar.aspect as Orientation,
      },
    };

    video.config.avatarFile = avatar.preview;

    await convex.mutation(api.private.flows.raw.update, {
      id: flowId,
      data: { templatedVideo: video },
    });

    // TODO: trigger generate voice task and update to say voice generating
    await generateVoice.trigger(
      { flowId },
      { concurrencyKey: flowId, tags: [`flow_${flowId}`] }
    );

    await convex.mutation(api.private.flows.raw.update, {
      id: flowId,
      data: { voiceGenerating: true },
    });
  },
});

export const generateVoice = schemaTask({
  id: "flows/raw/generate-voice",
  schema: z.object({
    flowId: z.string().transform((val) => val as Id<"flows">),
  }),
  maxDuration: 300,
  retry: {
    maxAttempts: 1,
  },
  machine: "medium-1x",
  run: async (
    payload
  ): Promise<
    FlowRaw & {
      templatedVideo: Video & { config: { voiceFile: FileAudio } };
    }
  > => {
    const { flowId } = payload;

    const requiredData = await convex.query(
      api.private.flows.raw.fetchRequiredDataForTemplate,
      { id: flowId }
    );
    const { flow, avatar, workspace } = requiredData;

    const phoneticCorrections = workspace.phoneticCorrections;

    const { avatarId } = flow;
    const templatedVideo = flow.templatedVideo as Video | undefined;

    if (!templatedVideo) throw new Error("Templated video not found");

    const phoneticScript = templatedVideo.tokens
      .map((token) => {
        const correction = phoneticCorrections?.find(
          (c) => c.word.toLowerCase() === token.value.toLowerCase()
        );

        return correction ? correction.phonetic : token.value;
      })
      .join(" ");

    console.log(phoneticScript, "phoneticScript");

    const audioStream = await elevenlabs.streamTextToSpeech(
      avatar.elevenLabsVoiceId,
      phoneticScript
    );

    // Create a temporary file path
    const tempDir = "/tmp"; // Use system temp directory
    const tempFileName = `audio_${flowId}_${Date.now()}.mp3`;
    const tempFilePath = path.join(tempDir, tempFileName);

    const r2UploadStream = new PassThrough();
    const uploadPromise = r2.uploadStream(r2UploadStream, "audio/mpeg");

    // Create a write stream for the temporary file
    const fileWriteStream = fs.createWriteStream(tempFilePath);

    const processingPromise = (async () => {
      try {
        const reader = audioStream.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const audioBuffer = Buffer.from(value);

            // Write to both the file and R2 upload stream
            fileWriteStream.write(audioBuffer);

            if (!r2UploadStream.destroyed) {
              r2UploadStream.write(audioBuffer);
            }
          }
        } finally {
          reader.releaseLock();
        }

        // End both streams
        fileWriteStream.end();
        if (!r2UploadStream.destroyed) {
          r2UploadStream.end();
        }

        // Wait for file write to complete
        await new Promise((resolve, reject) => {
          fileWriteStream.on("finish", () => resolve(undefined));
          fileWriteStream.on("error", reject);
        });
      } catch (err) {
        const error = err as Error;
        fileWriteStream.destroy();
        if (!r2UploadStream.destroyed) {
          r2UploadStream.destroy(error);
        }
        throw error;
      }
    })();

    // Wait for both the streaming process and operations to complete
    const [, audioUrl, updatedTokens] = await Promise.all([
      processingPromise,
      uploadPromise.catch((error) => {
        console.warn("R2 upload failed:", error);
        throw error;
      }),
      (async () => {
        await processingPromise;

        // Read the file and create a Blob for forced alignment
        const audioFileBuffer = await fs.promises.readFile(tempFilePath);
        const audioBlob = new Blob([audioFileBuffer], { type: "audio/mp3" });

        const _alignedTokens = await elevenlabs.generateForcedAlignment(
          audioBlob,
          phoneticScript
        );

        // Clean up the temporary file
        try {
          await fs.promises.unlink(tempFilePath);
          console.info("Temporary audio file cleaned up", { tempFilePath });
        } catch (cleanupError) {
          console.warn("Failed to clean up temporary file", {
            tempFilePath,
            error: cleanupError,
          });
        }

        console.info("aligned tokens", {
          alignedTokens: _alignedTokens,
          tokens: templatedVideo.tokens,
        });

        // Merge the aligned tokens timing with existing tokens
        const updatedTokens = templatedVideo.tokens.map((token, idx) => {
          const alignedToken = _alignedTokens[idx];

          if (!alignedToken) {
            console.log(token, idx);
            throw new Error("No aligned token found");
          }

          // Calculate start and end times to ensure no gaps
          const start = idx === 0 ? 0 : alignedToken.start;

          // For all tokens except the last one, end when the next token starts
          // For the last token, use its original end time
          let end: number;
          if (idx < templatedVideo.tokens.length - 1) {
            const nextAlignedToken = _alignedTokens[idx + 1];
            if (!nextAlignedToken) {
              console.log(token, idx);
              throw new Error("No next aligned token found");
            }

            end = nextAlignedToken.start;
          } else {
            end = alignedToken.end;
          }

          return {
            ...token,
            start,
            end,
          };
        });

        return updatedTokens;
      })(),
    ]);

    const metadata = (await getFileMetadata
      .triggerAndWait({
        url: audioUrl,
      })
      .unwrap()) as FileAudio["metadata"];

    const voiceFile: FileAudio = {
      id: generateRandomID(),
      type: FileType.Audio,
      url: audioUrl,
      filename: "voice.mp3",
      contentType: "audio/mpeg",
      metadata,
    };

    const flowUpdate = {
      voiceGenerationHash: hashObject({
        avatarId,
        tokens: updatedTokens,
      }),
      templatedVideo: {
        ...templatedVideo,
        tokens: updatedTokens,
        config: {
          ...templatedVideo.config,
          voiceFile,
        },
      },
    };

    await convex.mutation(api.private.flows.raw.update, {
      id: flowId,
      data: flowUpdate,
    });

    return { ...flow, ...flowUpdate };
  },
});

export const generateVideo = schemaTask({
  id: "flows/raw/generate-video",
  schema: z.object({
    flowId: z.string().transform((val) => val as Id<"flows">),
  }),
  maxDuration: 60 * 15,
  retry: {
    maxAttempts: 1,
  },
  machine: "medium-1x",
  queue: generateVideoQueue,
  run: async (payload) => {
    const { flowId } = payload;

    const idempotencyKey = await idempotencyKeys.create(flowId);

    const requiredData = await convex.query(
      api.private.flows.raw.fetchRequiredDataForTemplate,
      { id: flowId }
    );

    let { flow } = requiredData;
    const { avatar } = requiredData;

    const { avatarId, voiceGenerationHash } = flow;

    if (!flow.templatedVideo) throw new Error("Templated video not found");

    const cleanVoiceHash = hashObject({
      avatarId,
      tokens: flow.templatedVideo.tokens,
    });

    if (voiceGenerationHash !== cleanVoiceHash) {
      flow = await generateVoice
        .triggerAndWait({ flowId }, { idempotencyKey })
        .unwrap();
    }

    const readyVideo = flow.templatedVideo as Video & {
      config: { voiceFile: FileAudio };
    };
    const { voiceFile } = readyVideo.config;

    const { videoUrl: talkingHeadTempUrl } = await generateTalkingHead
      .triggerAndWait(
        {
          audioUrl: voiceFile.url,
          avatarId: avatar.heygenAvatarId,
          aspectRatio: avatar.aspect,
        },
        { idempotencyKey }
      )
      .unwrap();

    console.info("talking head temp url", { talkingHeadTempUrl });

    const [talkingHeadMetadata, talkingHeadUrl] = await Promise.all([
      getFileMetadata
        .triggerAndWait({
          url: talkingHeadTempUrl,
        })
        .unwrap(),
      r2.uploadDataFromUrl(talkingHeadTempUrl, "video/mp4"),
    ]);

    const talkingHeadFileId = generateRandomID();
    const talkingHeadFile: FileVideo = {
      id: talkingHeadFileId,
      type: FileType.Video,
      url: talkingHeadUrl,
      filename: `avatar_generation_${talkingHeadFileId}.mp4`,
      contentType: "video/mp4",
      metadata: talkingHeadMetadata as FileVideo["metadata"],
    };

    const updatedVideo = {
      ...readyVideo,
      config: {
        ...readyVideo.config,
        avatarFile: talkingHeadFile as FileVideo,
      },
    };
    const composition = new Template(updatedVideo).compose();

    const renderedVideoId = await convex.mutation(
      api.private.rendered_video.create,
      {
        data: {
          workspaceId: flow.workspaceId,
          composition,
        },
      }
    );

    await convex.mutation(api.private.flows.raw.update, {
      id: flowId,
      data: {
        output: renderedVideoId,
      },
    });
  },
});

export type GenerateTemplateTask = typeof generateTemplate;
export type GenerateVoiceTask = typeof generateVoice;
export type GenerateVideoTask = typeof generateVideo;

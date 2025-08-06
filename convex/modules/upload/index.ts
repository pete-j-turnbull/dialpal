"use node";

import { ActionCtx, internalAction } from "@convex/functions";
import { r2 } from "@convex/lib/r2";
import { v4 as uuid } from "uuid";

export const getS3Params = internalAction(
  async (
    ctx: ActionCtx,
    args: {
      type: string;
    }
  ) => {
    const { type } = args;

    const key = `uploads/${uuid()}`;
    const result = await r2.generatePresignedUrl({
      key,
      contentType: type,
    });

    return {
      key,
      url: result.url,
    };
  }
);

export const createMultipartUpload = internalAction(
  async (ctx: ActionCtx, args: { type: string }) => {
    const { type } = args;

    const result = await r2.createMultipartUpload({
      key: `uploads/${uuid()}`,
      contentType: type,
    });

    return {
      uploadId: result.uploadId,
      key: result.key,
    };
  }
);

export const getPart = internalAction(
  async (
    ctx: ActionCtx,
    args: { uploadId: string; partNumber: number; key: string }
  ) => {
    const { uploadId, partNumber, key } = args;

    return await r2.getUploadPartUrl({
      uploadId,
      key,
      partNumber,
    });
  }
);

export const listParts = internalAction(
  async (ctx: ActionCtx, args: { uploadId: string; key: string }) => {
    const { uploadId, key } = args;

    return await r2.listParts({
      uploadId,
      key,
    });
  }
);

export const completeMultipartUpload = internalAction(
  async (
    ctx: ActionCtx,
    args: {
      uploadId: string;
      key: string;
      parts: Array<{ ETag: string; PartNumber: number }>;
    }
  ) => {
    const { uploadId, key, parts } = args;

    return await r2.completeMultipartUpload({
      uploadId,
      key,
      parts,
    });
  }
);

export const abortMultipartUpload = internalAction(
  async (ctx: ActionCtx, args: { uploadId: string; key: string }) => {
    const { uploadId, key } = args;

    return await r2.abortMultipartUpload({
      uploadId,
      key,
    });
  }
);

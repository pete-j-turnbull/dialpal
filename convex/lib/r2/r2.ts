"use node";

import { type ReadStream } from "fs";
import { Readable } from "stream";
import axios from "axios";
import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  ListPartsCommand,
  PutObjectCommand,
  S3Client,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuid } from "uuid";
import { requireEnv } from "../../../env";

export class R2 {
  private bucketName?: string;
  private domain?: string;
  private client?: S3Client;

  private ensureClient() {
    if (!this.client) {
      const env = requireEnv("r2");

      this.bucketName = env.r2.bucketName;
      this.domain = env.r2.domain;
      this.client = new S3Client({
        region: "auto",
        endpoint: `https://${env.r2.accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: env.r2.accessKeyId,
          secretAccessKey: env.r2.secretAccessKey,
        },
      });
    }

    return this.client;
  }

  public async uploadData(data: Buffer, contentType: string) {
    const client = this.ensureClient();

    const fileId = uuid();
    const key = `uploads/${fileId}`;

    await client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: data,
        ContentType: contentType,
      })
    );

    return `${this.domain}/${key}`;
  }

  public async uploadStream(stream: Readable, contentType: string) {
    const client = this.ensureClient();

    const fileId = uuid();
    const key = `uploads/${fileId}`;

    try {
      const upload = new Upload({
        client,
        params: {
          Bucket: this.bucketName,
          Key: key,
          Body: stream,
          ContentType: contentType,
        },
        partSize: 5 * 1024 * 1024, // Minimum 5 MB
        queueSize: 4,
      });

      await upload.done();
      return `${this.domain}/${key}`;
    } catch (_err) {
      const err = _err as Error;
      console.error("Failed to upload stream:", {
        ...err,
        error: err.message,
        stack: err.stack,
        args: { contentType },
      });
      throw new Error("Failed to upload stream to R2");
    }
  }

  // TODO: test
  public async uploadDataFromReadStream(
    readStream: ReadStream,
    contentType: string
  ) {
    const client = this.ensureClient();

    const fileId = uuid();
    const key = `uploads/${fileId}`;

    try {
      const upload = new Upload({
        client,
        params: {
          Bucket: this.bucketName,
          Key: key,
          Body: readStream,
          ContentType: contentType,
        },
        partSize: 5 * 1024 * 1024, // Minimum 5 MB
        queueSize: 4,
      });

      await upload.done();
      return `${this.domain}/${key}`;
    } catch (_err) {
      const err = _err as Error;
      console.error("Failed to upload data from read stream:", {
        ...err,
        error: err.message,
        stack: err.stack,
        args: { contentType },
      });
      throw new Error("Failed to upload data from read stream");
    }
  }

  public async uploadDataFromUrl(url: string, contentType: string) {
    const client = this.ensureClient();

    const fileId = uuid();
    const key = `uploads/${fileId}`;

    try {
      // Fetch the data from the URL
      const response = await axios.get(url, {
        responseType: "stream",
        maxContentLength: Infinity,
      });

      // Upload the data to R2 using Upload for better stream handling
      const upload = new Upload({
        client,
        params: {
          Bucket: this.bucketName,
          Key: key,
          Body: response.data,
          ContentType: contentType,
        },
        partSize: 5 * 1024 * 1024, // Minimum 5 MB
        queueSize: 4,
      });

      await upload.done();
      return `${this.domain}/${key}`;
    } catch (_err) {
      const err = _err as Error;
      console.error("Failed to upload data:", {
        ...err,
        error: err.message,
        stack: err.stack,
        args: {
          url,
          contentType,
        },
      });
      throw new Error("Failed to upload data to R2");
    }
  }

  public async generatePresignedUrl(args: {
    key: string;
    contentType: string;
  }) {
    const client = this.ensureClient();

    const { key, contentType } = args;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });

    try {
      const presignedUrl = await getSignedUrl(client, command, {
        expiresIn: 3600,
      });

      const fileUrl = `${this.domain}/${key}`;

      return { url: presignedUrl, fileUrl };
    } catch (err) {
      throw new Error("Failed to generate presigned URL");
    }
  }

  public async createMultipartUpload(args: {
    key: string;
    contentType: string;
  }) {
    const client = this.ensureClient();

    const { key, contentType } = args;

    const command = new CreateMultipartUploadCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });

    try {
      const response = await client.send(command);
      return {
        uploadId: response.UploadId!,
        key,
        fileUrl: `${this.domain}/${key}`,
      };
    } catch (err) {
      console.error("Failed to create multipart upload:", {
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        args,
      });
      throw new Error("Failed to create multipart upload");
    }
  }

  public async getUploadPartUrl(args: {
    uploadId: string;
    key: string;
    partNumber: number;
    signal?: AbortSignal;
  }) {
    const client = this.ensureClient();

    const { uploadId, key, partNumber, signal } = args;

    const command = new UploadPartCommand({
      Bucket: this.bucketName,
      Key: key,
      UploadId: uploadId,
      PartNumber: partNumber,
    });

    try {
      const presignedUrl = await getSignedUrl(client, command, {
        expiresIn: 3600,
      });

      return { url: presignedUrl };
    } catch (err) {
      console.error("Failed to generate part upload URL:", {
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        args,
      });
      throw new Error("Failed to generate part upload URL");
    }
  }

  public async completeMultipartUpload(args: {
    uploadId: string;
    key: string;
    parts: Array<{ ETag: string; PartNumber: number }>;
  }) {
    const client = this.ensureClient();

    const { uploadId, key, parts } = args;

    const command = new CompleteMultipartUploadCommand({
      Bucket: this.bucketName,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts.sort((a, b) => a.PartNumber - b.PartNumber),
      },
    });

    try {
      await client.send(command);
      return {
        location: `${this.domain}/${args.key}`,
      };
    } catch (err) {
      console.error("Failed to complete multipart upload:", {
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        args,
      });
      throw new Error("Failed to complete multipart upload");
    }
  }

  public async abortMultipartUpload(args: { uploadId: string; key: string }) {
    const client = this.ensureClient();

    const { uploadId, key } = args;

    const command = new AbortMultipartUploadCommand({
      Bucket: this.bucketName,
      Key: key,
      UploadId: uploadId,
    });

    try {
      await client.send(command);
    } catch (err) {
      console.error("Failed to abort multipart upload:", {
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        args,
      });
      throw new Error("Failed to abort multipart upload");
    }
  }

  public async listParts(args: { uploadId: string; key: string }) {
    const client = this.ensureClient();

    const { uploadId, key } = args;

    const command = new ListPartsCommand({
      Bucket: this.bucketName,
      Key: key,
      UploadId: uploadId,
    });

    try {
      const response = await client.send(command);
      return {
        parts:
          response.Parts?.map((part) => ({
            ETag: part.ETag!,
            PartNumber: part.PartNumber!,
            Size: part.Size!,
          })) || [],
      };
    } catch (err) {
      console.error("Failed to list upload parts:", {
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        args,
      });
      throw new Error("Failed to list upload parts");
    }
  }
}

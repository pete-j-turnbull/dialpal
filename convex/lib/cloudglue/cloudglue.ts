/* eslint-disable @typescript-eslint/no-explicit-any */
"use node";

import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import {
  type ChatCompletionFilter,
  type Collection,
  type File as CloudGlueFile,
  TranscriptionJob,
} from "./types";

import { requireEnv } from "../../../env";

const BASE_URL = "https://api.cloudglue.dev/v1";

export class CloudGlue {
  private apiKey?: string;

  private ensureApiKey(): string {
    if (!this.apiKey) {
      const env = requireEnv("cloudglue");
      this.apiKey = env.cloudglue.apiKey;
    }

    return this.apiKey;
  }

  private async sendRequest<T = any>(args: {
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    path: string;
    body?: any;
    headers?: Record<string, string>;
  }): Promise<T> {
    const apiKey = this.ensureApiKey();

    const url = `${BASE_URL}${args.path}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${apiKey}`,
      ...args.headers,
    };

    // Add Content-Type for requests with body
    if (args.body && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(url, {
      method: args.method,
      headers,
      body: args.body ? JSON.stringify(args.body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `CloudGlue API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    return response.json();
  }

  public async listFiles(): Promise<CloudGlueFile[]> {
    const response = await this.sendRequest<{ data: CloudGlueFile[] }>({
      method: "GET",
      path: "/files",
    });
    return response.data;
  }

  public async uploadFile(args: {
    url: string;
    contentType: string;
    metadata: Record<string, any>;
  }): Promise<CloudGlueFile> {
    // Extract filename from URL or use a default
    const urlPath = new URL(args.url).pathname;
    const fileName = path.basename(urlPath) || "uploaded-file";

    // Create a temporary file path
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "cloudglue-"));
    const tempFilePath = path.join(tempDir, fileName);

    try {
      // Fetch the file from the URL
      const response = await fetch(args.url);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch file from URL: ${response.statusText}`
        );
      }

      // Stream the file to disk
      const fileStream = fs.createWriteStream(tempFilePath);
      await pipeline(Readable.fromWeb(response.body as any), fileStream);

      // Read the file from disk for upload
      const fileBuffer = await fs.promises.readFile(tempFilePath);
      const fileBlob = new Blob([fileBuffer], { type: args.contentType });

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", fileBlob, fileName);

      // Add metadata as form fields
      Object.entries(args.metadata).forEach(([key, value]) => {
        formData.append(
          `metadata[${key}]`,
          typeof value === "string" ? value : JSON.stringify(value)
        );
      });

      // Upload the file using multipart/form-data
      const uploadResponse = await fetch(`${BASE_URL}/files`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.ensureApiKey()}`,
          // Don't set Content-Type - let FormData set the boundary
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(
          `CloudGlue API error: ${uploadResponse.status} ${uploadResponse.statusText} - ${errorText}`
        );
      }

      return await uploadResponse.json();
    } finally {
      // Clean up temporary file
      try {
        await fs.promises.unlink(tempFilePath);
        await fs.promises.rmdir(tempDir);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  }

  public async getFile(args: { fileId: string }): Promise<CloudGlueFile> {
    const { fileId } = args;
    return await this.sendRequest<CloudGlueFile>({
      method: "GET",
      path: `/files/${fileId}`,
    });
  }

  public async listCollections(): Promise<Collection[]> {
    const response = await this.sendRequest<{ data: Collection[] }>({
      method: "GET",
      path: "/collections",
    });
    return response.data;
  }

  public async createCollection(args: { name: string }): Promise<Collection> {
    const response = await this.sendRequest<Collection>({
      method: "POST",
      path: "/collections",
      body: {
        name: args.name,
        collection_type: "rich-transcripts",
        transcribe_config: {
          enable_speech: true,
          enable_visual_scene_description: true,
          enable_scene_text: true,
          enable_summary: true,
        },
      },
    });

    return response;
  }

  public async addVideoToCollection(args: {
    collectionId: string;
    fileId: string;
  }): Promise<void> {
    const { collectionId, fileId } = args;

    await this.sendRequest({
      method: "POST",
      path: `/collections/${collectionId}/videos`,
      body: {
        file_id: fileId,
      },
    });
  }

  public async createChatCompletion(args: {
    collectionId: string;
    system: string;
    query: string;
    filter?: ChatCompletionFilter;
  }) {
    const { collectionId, system, query, filter } = args;

    // TODO: metadata filter with product dataset id and asset type
    // TODO: system messages

    const response = await this.sendRequest<{
      choices?: Array<{
        message?: { content?: string };
        citations?: any;
      }>;
    }>({
      method: "POST",
      path: "/chat/completions",
      body: {
        model: "nimbus-001",
        messages: [
          { role: "system", content: system },
          { role: "user", content: query },
        ],
        collections: [collectionId],
        filter,
        force_search: true,
        include_citations: true,
      },
    });
    console.log(response);

    if (!response.choices) {
      throw new Error("No choices returned from CloudGlue");
    }

    const { message, citations } = response.choices[0];
    if (!message) throw new Error("No message returned from CloudGlue");

    return {
      content: message.content,
      citations,
    };
  }

  public async transcribe(args: { url: string }) {
    const { url } = args;

    return await this.sendRequest<TranscriptionJob>({
      method: "POST",
      path: `/transcribe`,
      body: {
        url,
        enable_summary: true,
        enable_speech: true,
        enable_visual_scene_description: true,
        enable_scene_text: true,
      },
    });
  }

  public async getTranscriptionJob(args: { jobId: string }) {
    const { jobId } = args;

    return await this.sendRequest<TranscriptionJob>({
      method: "GET",
      path: `/transcribe/${jobId}`,
    });
  }
}

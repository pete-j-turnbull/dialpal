import { type MutationCtx, type QueryCtx } from "@convex/functions";
import {
  Document,
  DocumentChange,
  DocumentId,
  DocumentPlatform,
} from "@convex/schema/document";
import { syncArgsSchema } from "./schemas";
import { Infer } from "convex/values";
import { UserId } from "@convex/schema/user";
import { SyncConflictError } from "./errors";

export async function get(
  ctx: QueryCtx,
  documentId: DocumentId
): Promise<Document | null> {
  return await ctx.db.get(documentId);
}

/**
 * Get all operations that happened after a given checkpoint (hash)
 * Returns changes in ascending version order (oldest first)
 */
export async function getOperationsSinceCheckpoint(
  ctx: QueryCtx,
  args: {
    userId: UserId;
    externalId: string;
    platform: DocumentPlatform;
    checkpointHash?: string;
  }
): Promise<{
  changes: DocumentChange[];
  currentHash: string;
  currentVersion: number;
}> {
  const { userId, externalId, platform, checkpointHash } = args;

  const document = await ctx.db
    .query("documents")
    .withIndex("by_user_and_platform_and_external_id", (q) =>
      q
        .eq("userId", userId)
        .eq("platform", platform)
        .eq("externalId", externalId)
    )
    .first();

  if (!document)
    throw new Error(`Document with external id ${externalId} not found`);

  // If no checkpoint hash provided, return all changes from the beginning
  if (!checkpointHash) {
    const allChanges = await ctx.db
      .query("document_changes")
      .withIndex("by_document", (q) => q.eq("documentId", document._id))
      .order("asc")
      .collect();

    return {
      changes: allChanges,
      currentHash: document.currentHash,
      currentVersion: document.version,
    };
  }

  // Find the change that has this hash as newHash
  const checkpointChange = await ctx.db
    .query("document_changes")
    .withIndex("by_document_and_newHash", (q) =>
      q.eq("documentId", document._id).eq("newHash", checkpointHash)
    )
    .first();

  if (!checkpointChange) {
    // The checkpoint hash doesn't exist in our history
    // This means the hash is invalid
    throw new Error(
      `Checkpoint hash ${checkpointHash} not found in document history`
    );
  }

  // Get all changes after this checkpoint (version > checkpoint.version)
  const changesSinceCheckpoint = await ctx.db
    .query("document_changes")
    .withIndex("by_document_and_version", (q) =>
      q.eq("documentId", document._id).gt("version", checkpointChange.version)
    )
    .order("asc")
    .collect();

  return {
    changes: changesSinceCheckpoint,
    currentHash: document.currentHash,
    currentVersion: document.version,
  };
}

export async function sync(
  ctx: MutationCtx,
  args: Infer<typeof syncArgsSchema>
): Promise<DocumentId> {
  const { userId, ts, externalId, platform, title, oldHash, newHash, ops } =
    args;

  // Try to find existing document
  const existing = await ctx.db
    .query("documents")
    .withIndex("by_user_and_platform_and_external_id", (q) =>
      q
        .eq("userId", userId)
        .eq("platform", platform)
        .eq("externalId", externalId)
    )
    .first();

  if (existing) {
    if (existing.currentHash !== oldHash) {
      throw new SyncConflictError(oldHash, existing.currentHash);
    }

    const newVersion = existing.version + 1;

    await ctx.db.patch(existing._id, {
      lastSyncedAt: Date.now(),
      currentHash: newHash,
      title,
      version: newVersion,
    });

    if (ops && ops.length > 0) {
      await ctx.db.insert("document_changes", {
        documentId: existing._id,
        timestamp: ts,
        version: newVersion,
        oldHash: oldHash,
        newHash: newHash,
        operations: ops,
      });
    }

    return existing._id;
  }

  // Create new document
  const documentId = await ctx.db.insert("documents", {
    userId,
    externalId,
    platform,
    title,
    currentHash: newHash,
    version: 0,
    firstSeenAt: Date.now(),
    lastSyncedAt: Date.now(),
  });

  // Store initial change with operations
  if (ops && ops.length > 0) {
    await ctx.db.insert("document_changes", {
      documentId,
      timestamp: ts,
      version: 0,
      oldHash: oldHash,
      newHash: newHash,
      operations: ops,
    });
  }

  return documentId;
}

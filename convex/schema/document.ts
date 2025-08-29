import { defineTable } from "convex/server";
import { v } from "convex/values";
import { Doc, Id } from "@convex/_generated/dataModel";

export const DocumentPlatforms = {
  GOOGLE_DOCS: "google_docs",
} as const;

export const OpType = {
  INSERT: "ins",
  DELETE: "del",
} as const;

export const documentPlatformSchema = v.union(
  v.literal(DocumentPlatforms.GOOGLE_DOCS)
);

// Schema for documents being tracked
export const documentSchema = v.object({
  userId: v.id("users"),

  platform: documentPlatformSchema,
  externalId: v.string(),

  title: v.string(),
  currentHash: v.optional(v.string()),

  firstSeenAt: v.number(), // When we first saw this document
  lastSyncedAt: v.number(), // Last time we received a sync
});

export const documentChangeSchema = v.object({
  documentId: v.id("documents"),

  // Timestamp when the change occurred
  timestamp: v.number(),

  // Hash values for change validation
  oldHash: v.optional(v.string()),
  newHash: v.string(),

  // The diff operations
  operations: v.array(
    v.union(
      // Insert operation
      v.object({
        t: v.literal(OpType.INSERT),
        pos: v.number(),
        text: v.string(),
      }),
      // Delete operation
      v.object({
        t: v.literal(OpType.DELETE),
        pos: v.number(),
        len: v.number(),
      })
    )
  ),
});

export type Document = Doc<"documents">;
export type DocumentId = Id<"documents">;

export type DocumentChange = Doc<"document_changes">;
export type DocumentChangeId = Id<"document_changes">;

export const documentsTable = defineTable(documentSchema).index("by_user", [
  "userId",
]);

export const documentChangesTable = defineTable(documentChangeSchema).index(
  "by_document",
  ["documentId"]
);

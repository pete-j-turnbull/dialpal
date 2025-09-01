import { defineTable } from "convex/server";
import { Infer, v } from "convex/values";
import { Doc, Id } from "@convex/_generated/dataModel";

export const DocumentPlatforms = {
  GoogleDocs: "google_docs",
} as const;

export const OpType = {
  INSERT: "ins",
  DELETE: "del",
} as const;

export type OpType = (typeof OpType)[keyof typeof OpType];

export const diffOpSchema = v.union(
  v.object({
    t: v.literal(OpType.INSERT),
    pos: v.number(),
    text: v.string(),
  }),
  v.object({
    t: v.literal(OpType.DELETE),
    pos: v.number(),
    len: v.number(),
  })
);

export type DiffOp = Infer<typeof diffOpSchema>;

export const documentPlatformSchema = v.union(
  v.literal(DocumentPlatforms.GoogleDocs)
);

export type DocumentPlatform = Infer<typeof documentPlatformSchema>;

// Schema for documents being tracked
export const documentSchema = v.object({
  userId: v.id("users"),

  platform: documentPlatformSchema,
  externalId: v.string(),

  title: v.optional(v.string()),
  currentHash: v.string(),
  version: v.number(),

  firstSeenAt: v.number(), // When we first saw this document
  lastSyncedAt: v.number(), // Last time we received a sync
});

export const documentChangeSchema = v.object({
  documentId: v.id("documents"),

  // Timestamp when the change occurred
  timestamp: v.number(),
  version: v.number(),

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

export const documentsTable = defineTable(documentSchema)
  .index("by_user", ["userId"])
  .index("by_user_and_external_id", ["userId", "externalId"])
  .index("by_user_and_platform_and_external_id", [
    "userId",
    "platform",
    "externalId",
  ]);

export const documentChangesTable = defineTable(documentChangeSchema)
  .index("by_document", ["documentId"])
  .index("by_document_and_version", ["documentId", "version"])
  .index("by_document_and_newHash", ["documentId", "newHash"]);

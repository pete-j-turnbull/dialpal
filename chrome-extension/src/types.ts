import { type DiffOp } from "@convex/schema/document";

export type DocumentState = {
  // Current state of the document
  currentText?: string;
  currentHash?: string;

  // Last successfully synced state
  lastSyncedText?: string;
  lastSyncedHash?: string;

  // Pending operations not yet synced
  pendingOps: DiffOp[];

  // Sync status
  syncInProgress: boolean;
  lastSyncAttempt?: number;
  lastSyncSuccess?: number;
  retryTimer?: number;
};

import { diffChars } from "diff";
import { sha256 } from "./lib/hash";
import { ConvexClient } from "convex/browser";
import { type DocumentState } from "./types";
import { config } from "./config";
import { api } from "@convex/_generated/api";
import { DocumentPlatforms } from "@convex/schema/document";
import { type DiffOp } from "@convex/schema/document";

const convex = new ConvexClient(config.convexCloudUrl);

// Constants
const POLL_INTERVAL_MS = 10_000; // Check for changes every 10 seconds
const RETRY_DELAY_MS = 30_000; // Retry failed syncs after 30 seconds
const MAX_DOC_SIZE = 2_000_000; // 2MB max document size

class GoogleDocsTracker {
  private docId: string = "";
  private pollTimer: number | null = null;

  private state: DocumentState = {
    pendingOps: [],
    syncInProgress: false,
  };

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    try {
      // Extract document ID from URL
      this.docId = this.extractDocId();
      if (!this.docId) {
        console.log("[docs-tracker] No valid document ID found");
        return;
      }

      console.log(`[docs-tracker] Initialized for doc: ${this.docId}`);

      // Load persisted state
      await this.loadPersistedState();

      // Start polling for document changes
      this.startPolling();

      // Do initial fetch
      this.checkForChanges();
    } catch (error) {
      console.error("[docs-tracker] Initialization failed:", error);
    }
  }

  private extractDocId(): string {
    const pathParts = location.pathname.split("/");
    if (
      pathParts.length >= 4 &&
      pathParts[1] === "document" &&
      pathParts[2] === "d"
    ) {
      return pathParts[3];
    }
    return "";
  }

  /**
   * Load persisted state from Chrome storage
   */
  private async loadPersistedState(): Promise<void> {
    try {
      const key = `docState_${this.docId}`;
      const result = await chrome.storage.local.get([key]);

      if (result[key]) {
        const savedState = result[key];
        console.log(
          `[docs-tracker] Loaded persisted state - currentHash: ${savedState.currentHash?.substring(
            0,
            8
          )}..., lastSyncedHash: ${savedState.lastSyncedHash?.substring(
            0,
            8
          )}..., pendingOps: ${savedState.pendingOps?.length || 0}`
        );

        // Restore current state
        this.state.currentText = savedState.currentText || "";
        this.state.currentHash = savedState.currentHash || null;

        // Restore synced state
        this.state.lastSyncedText = savedState.lastSyncedText || "";
        this.state.lastSyncedHash = savedState.lastSyncedHash || null;

        // Restore pending operations
        this.state.pendingOps = savedState.pendingOps || [];

        if (this.state.pendingOps.length > 0) {
          console.log(
            `[docs-tracker] Found ${this.state.pendingOps.length} pending operations from previous session`
          );
        }
      } else {
        console.log("[docs-tracker] No persisted state found, starting fresh");
      }

      // Periodically clean up old document states (10% chance)
      if (Math.random() < 0.1) {
        this.cleanupOldStates();
      }
    } catch (error) {
      console.error("[docs-tracker] Failed to load persisted state:", error);
    }
  }

  /**
   * Save state to Chrome storage
   */
  private async saveState(): Promise<void> {
    try {
      const key = `docState_${this.docId}`;
      const stateToSave = {
        currentText: this.state.currentText,
        currentHash: this.state.currentHash,
        lastSyncedText: this.state.lastSyncedText,
        lastSyncedHash: this.state.lastSyncedHash,
        pendingOps: this.state.pendingOps,
        timestamp: Date.now(),
      };

      await chrome.storage.local.set({ [key]: stateToSave });
      console.log(
        `[docs-tracker] Saved state - currentHash: ${this.state.currentHash?.substring(
          0,
          8
        )}..., lastSyncedHash: ${this.state.lastSyncedHash?.substring(
          0,
          8
        )}..., pendingOps: ${this.state.pendingOps.length}`
      );
    } catch (error) {
      console.error("[docs-tracker] Failed to save state:", error);
    }
  }

  /**
   * Clean up old document states to manage storage quota
   * Keeps only the most recent 50 documents
   */
  private async cleanupOldStates(): Promise<void> {
    try {
      const result = await chrome.storage.local.get(null);
      const docStates: Array<{ key: string; timestamp: number }> = [];

      // Find all document states
      for (const [key, value] of Object.entries(result)) {
        if (
          key.startsWith("docState_") &&
          value &&
          typeof value === "object" &&
          "timestamp" in value
        ) {
          docStates.push({
            key,
            timestamp: (value as { timestamp: number }).timestamp || 0,
          });
        }
      }

      // Keep only the most recent 50 documents
      if (docStates.length > 50) {
        docStates.sort((a, b) => b.timestamp - a.timestamp);
        const toRemove = docStates.slice(50).map((item) => item.key);

        for (const key of toRemove) {
          await chrome.storage.local.remove(key);
        }

        console.log(
          `[docs-tracker] Cleaned up ${toRemove.length} old document states`
        );
      }
    } catch (error) {
      console.error("[docs-tracker] Failed to clean up old states:", error);
    }
  }

  private startPolling(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
    }

    this.pollTimer = window.setInterval(() => {
      this.checkForChanges();
    }, POLL_INTERVAL_MS);
  }

  private async checkForChanges(): Promise<void> {
    try {
      // Fetch current document text
      const text = await this.fetchDocumentText();

      // Check if document is too large
      if (text.length > MAX_DOC_SIZE) {
        console.log(
          `[docs-tracker] Document too large (${text.length} chars), skipping`
        );
        return;
      }

      // Calculate hash of current text
      const hash = await sha256(text);

      // Check if document has changed
      if (hash === this.state.currentHash) {
        console.log("[docs-tracker] No changes detected");
        return;
      }

      console.log(
        `[docs-tracker] Document changed - old: ${this.state.currentText?.length} chars, new: ${text.length} chars`
      );

      // Update current state
      const previousText = this.state.currentText;
      this.state.currentText = text;
      this.state.currentHash = hash;

      // Save the updated current state even if no new ops are generated
      // This ensures we track the latest document state
      await this.saveState();

      // Generate diff operations if we have a previous state
      if (previousText) {
        const newOps = this.generateDiffOps(previousText, text);
        if (newOps.length > 0) {
          // Add new ops to pending queue
          this.state.pendingOps = [...this.state.pendingOps, ...newOps];
          console.log(
            `[docs-tracker] Generated ${newOps.length} new ops, total pending: ${this.state.pendingOps.length}`
          );
        }
      } else {
        // First fetch - treat entire document as an insert
        if (text.length > 0) {
          this.state.pendingOps = [{ t: "ins", pos: 0, text }];
          console.log(
            "[docs-tracker] Initial document fetch - treating as full insert"
          );
        }
      }

      // Try to sync if we have pending operations
      if (this.state.pendingOps.length > 0 && !this.state.syncInProgress) {
        await this.syncToConvex();
      }
    } catch (error) {
      console.error("[docs-tracker] Error checking for changes:", error);
    }
  }

  private async fetchDocumentText(): Promise<string> {
    console.log(`[docs-tracker] Fetching document text for doc: ${this.docId}`);

    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          action: "fetchDocText",
          docId: this.docId,
        },
        (response: { success: boolean; text?: string; error?: string }) => {
          // Check for chrome.runtime.lastError
          if (chrome.runtime.lastError) {
            console.error(
              "[docs-tracker] Runtime error:",
              chrome.runtime.lastError.message
            );
            reject(
              new Error(`Runtime error: ${chrome.runtime.lastError.message}`)
            );
            return;
          }

          if (!response) {
            console.error("[docs-tracker] No response from background script");
            reject(new Error("No response from background script"));
            return;
          }

          if (response.success && response.text !== undefined) {
            console.log(
              `[docs-tracker] Received document text, length: ${response.text.length} chars`
            );
            resolve(response.text);
          } else {
            const errorMsg =
              response.error || "Unknown error from background script";
            console.error("[docs-tracker] Background script error:", errorMsg);
            reject(new Error(errorMsg));
          }
        }
      );
    });
  }

  private generateDiffOps(oldText: string, newText: string): DiffOp[] {
    const diffs = diffChars(oldText, newText);
    const ops: DiffOp[] = [];
    let cursor = 0;

    for (const change of diffs) {
      if (change.removed && change.value.length > 0) {
        // Delete operation
        ops.push({ t: "del", pos: cursor, len: change.value.length });
        // Don't advance cursor for deletes in the new text
      } else if (change.added && change.value.length > 0) {
        // Insert operation
        ops.push({ t: "ins", pos: cursor, text: change.value });
        cursor += change.value.length;
      } else if (!change.added && !change.removed) {
        // Unchanged text - advance cursor
        cursor += change.value.length;
      }
    }

    return this.coalesceOps(ops);
  }

  private coalesceOps(ops: DiffOp[]): DiffOp[] {
    if (ops.length <= 1) return ops;

    const coalesced: DiffOp[] = [];
    let current = ops[0];

    for (let i = 1; i < ops.length; i++) {
      const next = ops[i];

      // Try to coalesce adjacent deletes
      if (current.t === "del" && next.t === "del" && current.pos === next.pos) {
        current = { t: "del", pos: current.pos, len: current.len + next.len };
        continue;
      }

      // Try to coalesce adjacent inserts at same position
      if (
        current.t === "ins" &&
        next.t === "ins" &&
        current.pos + current.text.length === next.pos
      ) {
        current = {
          t: "ins",
          pos: current.pos,
          text: current.text + next.text,
        };
        continue;
      }

      // Can't coalesce, push current and move to next
      coalesced.push(current);
      current = next;
    }

    coalesced.push(current);
    return coalesced;
  }

  // TODO: check if current hash exists
  private async syncToConvex(): Promise<void> {
    // Clear any existing retry timer
    if (this.state.retryTimer) {
      clearTimeout(this.state.retryTimer);
      this.state.retryTimer = undefined;
    }

    // Mark sync as in progress
    this.state.syncInProgress = true;
    this.state.lastSyncAttempt = Date.now();

    try {
      console.log(
        `[docs-tracker] Syncing ${this.state.pendingOps.length} operations to Convex`
      );

      // Call the sync mutation
      await convex.mutation(api.modules.document.protected.sync, {
        ts: Date.now(),
        externalId: this.docId,
        platform: DocumentPlatforms.GoogleDocs,
        oldHash: this.state.lastSyncedHash,
        newHash: this.state.currentHash!,
        ops: this.state.pendingOps,
        title: this.extractTitle(),
      });

      console.log(
        `[docs-tracker] Successfully synced ${this.state.pendingOps.length} operations`
      );

      // Update synced state
      this.state.lastSyncedText = this.state.currentText;
      this.state.lastSyncedHash = this.state.currentHash;
      this.state.pendingOps = [];
      this.state.lastSyncSuccess = Date.now();
      this.state.syncInProgress = false;

      // Save state after successful sync
      await this.saveState();
    } catch (error) {
      console.error("[docs-tracker] Sync failed:", error);
      this.state.syncInProgress = false;

      // Schedule retry
      console.log(
        `[docs-tracker] Scheduling retry in ${RETRY_DELAY_MS / 1000} seconds`
      );
      this.state.retryTimer = window.setTimeout(() => {
        this.state.retryTimer = undefined;
        if (this.state.pendingOps.length > 0 && !this.state.syncInProgress) {
          this.syncToConvex();
        }
      }, RETRY_DELAY_MS);
    }
  }

  private extractTitle(): string {
    const title = document.title;
    return title.replace(/ - Google Docs$/, "").trim();
  }

  // Clean up on page unload
  public async destroy(): Promise<void> {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }

    if (this.state.retryTimer) {
      clearTimeout(this.state.retryTimer);
      this.state.retryTimer = undefined;
    }

    // Save current state before unloading
    if (this.state.pendingOps.length > 0) {
      console.log(
        `[docs-tracker] Saving ${this.state.pendingOps.length} pending ops before unload`
      );
      await this.saveState();
    }
  }
}

// Initialize tracker when content script loads
let tracker: GoogleDocsTracker | null = null;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    tracker = new GoogleDocsTracker();
  });
} else {
  tracker = new GoogleDocsTracker();
}

// Clean up on page unload
window.addEventListener("beforeunload", (e) => {
  if (tracker) {
    // Note: beforeunload doesn't wait for async operations,
    // but Chrome will usually give us enough time to save to storage
    tracker.destroy().catch(console.error);
  }
});

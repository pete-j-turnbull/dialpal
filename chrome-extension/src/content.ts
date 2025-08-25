import {
  DiffMatchPatch,
  DIFF_DELETE,
  DIFF_INSERT,
  DIFF_EQUAL,
} from "./vendor/diff_match_patch";
import { sha256 } from "./lib/hash";
import { backoffManager } from "./lib/backoff";
import { DiffEvent, DiffOp, ExtensionState } from "./types";

// Hard-coded constants
const API_URL = "https://your.ingest.endpoint/v1/diffs"; // TODO: replace
const MAX_DOC_SIZE = 2_000_000;
const SAMPLE_INTERVAL_MS = 30_000;
const IDLE_TIMEOUT_MS = 120_000;

class GoogleDocsTracker {
  private state: ExtensionState = {
    lastText: "",
    lastHash: null,
    installId: "",
    active: false,
    typedRecently: false,
    hasInitialFetch: false,
  };

  private docId: string = "";
  private dmp: DiffMatchPatch;
  private pollTimer: number | null = null;
  private idleTimer: number | null = null;

  constructor() {
    this.dmp = new DiffMatchPatch();
    this.dmp.Diff_Timeout = 0.5;
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

      // Initialize install ID
      await this.initInstallId();

      // Load persisted document state
      await this.loadPersistedState();

      // Set up event listeners
      this.setupEventListeners();

      // Update initial activity state
      this.updateActivityState();

      // Start polling timer
      this.startPolling();

      console.log(`[docs-tracker] Initialized for doc: ${this.docId}`);
      console.log(
        `[docs-tracker] Initial state - visible: ${
          document.visibilityState === "visible"
        }, focused: ${document.hasFocus()}, will attempt initial fetch: ${
          !this.state.hasInitialFetch &&
          document.visibilityState === "visible" &&
          document.hasFocus()
        }`
      );
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

  private async initInstallId(): Promise<void> {
    const result = await chrome.storage.local.get(["installId"]);

    if (result.installId) {
      this.state.installId = result.installId;
    } else {
      // Generate UUID v4
      this.state.installId = this.generateUUID();
      await chrome.storage.local.set({ installId: this.state.installId });
      console.log(
        `[docs-tracker] Generated install ID: ${this.state.installId}`
      );
    }
  }

  private generateUUID(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Save document state to persistent storage
   */
  private async saveDocumentState(docId: string, text: string, hash: string): Promise<void> {
    try {
      const key = `docState_${docId}`;
      const state = {
        lastText: text,
        lastHash: hash,
        timestamp: Date.now()
      };
      
      await chrome.storage.local.set({ [key]: state });
      console.log(`[docs-tracker] Saved document state for ${docId}, text length: ${text.length}`);
    } catch (error) {
      console.error('[docs-tracker] Failed to save document state:', error);
    }
  }

  /**
   * Load document state from persistent storage
   */
  private async loadDocumentState(docId: string): Promise<{lastText: string, lastHash: string | null} | null> {
    try {
      const key = `docState_${docId}`;
      const result = await chrome.storage.local.get([key]);
      
      if (result[key]) {
        const state = result[key];
        console.log(`[docs-tracker] Loaded document state for ${docId}, text length: ${state.lastText?.length || 0}, timestamp: ${new Date(state.timestamp).toISOString()}`);
        
        return {
          lastText: state.lastText || "",
          lastHash: state.lastHash || null
        };
      }
      
      console.log(`[docs-tracker] No persisted state found for document ${docId}`);
      return null;
    } catch (error) {
      console.error('[docs-tracker] Failed to load document state:', error);
      return null;
    }
  }

  /**
   * Clear old document states to manage storage quota
   * Keeps only the most recent 50 documents
   */
  private async clearOldDocumentStates(): Promise<void> {
    try {
      const result = await chrome.storage.local.get(null);
      const docStates: Array<{key: string, timestamp: number}> = [];
      
      // Find all document states
      for (const [key, value] of Object.entries(result)) {
        if (key.startsWith('docState_') && value && typeof value === 'object' && 'timestamp' in value) {
          docStates.push({
            key,
            timestamp: (value as { timestamp: number }).timestamp || 0
          });
        }
      }
      
      // Keep only the most recent 50 documents
      if (docStates.length > 50) {
        docStates.sort((a, b) => b.timestamp - a.timestamp);
        const toRemove = docStates.slice(50).map(item => item.key);
        
        for (const key of toRemove) {
          await chrome.storage.local.remove(key);
        }
        
        console.log(`[docs-tracker] Cleaned up ${toRemove.length} old document states`);
      }
    } catch (error) {
      console.error('[docs-tracker] Failed to clear old document states:', error);
    }
  }

  /**
   * Load persisted state for the current document during initialization
   */
  private async loadPersistedState(): Promise<void> {
    const persistedState = await this.loadDocumentState(this.docId);
    
    if (persistedState) {
      this.state.lastText = persistedState.lastText;
      this.state.lastHash = persistedState.lastHash;
      this.state.hasInitialFetch = true; // We have previous state, so not truly "initial"
      
      console.log(`[docs-tracker] Restored document state from storage - text length: ${persistedState.lastText.length}, hash: ${persistedState.lastHash?.substring(0, 8)}...`);
    } else {
      console.log(`[docs-tracker] No previous state found for document, starting fresh`);
    }
    
    // Periodically clean up old document states (every 10th initialization)
    if (Math.random() < 0.1) {
      this.clearOldDocumentStates();
    }
  }

  private setupEventListeners(): void {
    // Visibility and focus listeners
    document.addEventListener("visibilitychange", () =>
      this.updateActivityState()
    );
    window.addEventListener("focus", () => this.updateActivityState());
    window.addEventListener("blur", () => this.updateActivityState());

    // Typing activity listener
    document.addEventListener("keydown", () => this.onTyping());
  }

  private updateActivityState(): void {
    const wasActive = this.state.active;
    this.state.active =
      document.visibilityState === "visible" &&
      document.hasFocus() &&
      this.state.typedRecently;

    if (this.state.active !== wasActive) {
      const reason = this.state.active
        ? "document visible, focused, and recently typed"
        : `document ${
            document.visibilityState === "visible" ? "visible" : "hidden"
          }, ${document.hasFocus() ? "focused" : "unfocused"}, ${
            this.state.typedRecently ? "recently typed" : "no recent typing"
          }`;

      console.log(
        `[docs-tracker] Ongoing polling activity changed: ${this.state.active} (${reason})`
      );
    }
  }

  private onTyping(): void {
    console.log("[docs-tracker] Typing event detected");

    this.state.typedRecently = true;
    this.updateActivityState();

    // Reset idle timer
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
    }

    this.idleTimer = window.setTimeout(() => {
      console.log("[docs-tracker] Idle timeout reached, pausing polling");
      this.state.typedRecently = false;
      this.updateActivityState();
    }, IDLE_TIMEOUT_MS);
  }

  private startPolling(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
    }

    this.pollTimer = window.setInterval(() => {
      this.tick().catch((error) => {
        console.error("[docs-tracker] Polling tick error:", error);
      });
    }, SAMPLE_INTERVAL_MS);

    // Initial tick
    this.tick().catch((error) => {
      console.error("[docs-tracker] Initial tick error:", error);
    });
  }

  private async tick(): Promise<void> {
    // Allow initial fetch even without typing activity, but require visibility and focus
    const canFetchInitial =
      !this.state.hasInitialFetch &&
      document.visibilityState === "visible" &&
      document.hasFocus();

    const canFetchOngoing = this.state.active;

    if (!canFetchInitial && !canFetchOngoing) {
      if (!this.state.hasInitialFetch) {
        console.log(
          "[docs-tracker] Skipping initial fetch - document not visible/focused"
        );
      } else {
        console.log("[docs-tracker] Skipping tick due to inactivity");
      }
      return;
    }

    // Check if we're in backoff for export
    if (backoffManager.isInBackoff("export")) {
      console.log("[docs-tracker] Skipping tick due to backoff");
      return;
    }

    try {
      await backoffManager.withBackoff("export", async () => {
        const text = await this.fetchDocumentText();

        if (!this.state.hasInitialFetch) {
          console.log(
            `[docs-tracker] Initial fetch completed, document length: ${text.length} chars`
          );
          this.state.hasInitialFetch = true;
        } else {
          console.log(
            `[docs-tracker] Ongoing fetch completed, document length: ${text.length} chars`
          );
        }

        await this.processTextUpdate(text);
      });
    } catch (error) {
      console.error("[docs-tracker] Tick failed:", error);
    }
  }

  private async fetchDocumentText(): Promise<string> {
    console.log(
      `[docs-tracker] Requesting document text via background script for doc: ${this.docId}`
    );

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
            const text = response.text;
            console.log(
              `[docs-tracker] Received document text from background, length: ${text.length} chars`
            );

            // Check for very large documents
            if (text.length > MAX_DOC_SIZE) {
              console.log(
                `[docs-tracker] Document too large (${text.length} chars), sending heartbeat`
              );
              this.sendHeartbeat().catch((error) =>
                console.error("[docs-tracker] Failed to send heartbeat:", error)
              );

              // Pause polling for 5 minutes
              if (this.pollTimer) {
                clearInterval(this.pollTimer);
                setTimeout(() => this.startPolling(), 5 * 60 * 1000);
              }

              reject(new Error("Document too large"));
              return;
            }

            resolve(text);
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

  private async processTextUpdate(text: string): Promise<void> {
    const newHash = await sha256(text);

    // Check if document hasn't changed at all (including from persisted state)
    if (this.state.lastText === text && this.state.lastHash === newHash) {
      console.log("[docs-tracker] Document unchanged since last check, skipping");
      return;
    }

    // Handle first fetch (no previous state)
    if (this.state.lastText === "" && this.state.lastHash === null) {
      console.log("[docs-tracker] First fetch - sending full document as insert");
      const ops: DiffOp[] = text.length > 0 ? [{ t: "ins", pos: 0, text }] : [];
      await this.sendDiffEvent(ops, null, newHash);
      this.state.lastText = text;
      this.state.lastHash = newHash;
      await this.saveDocumentState(this.docId, text, newHash);
      return;
    }

    // Handle case where text is identical but hash might be different
    // This can happen if document was edited while page was closed
    if (this.state.lastText === text) {
      if (this.state.lastHash !== newHash) {
        console.log("[docs-tracker] Text identical but hash changed - updating hash only");
        this.state.lastHash = newHash;
        await this.saveDocumentState(this.docId, text, newHash);
      } else {
        console.log("[docs-tracker] No changes detected");
      }
      return;
    }

    // Generate diff for actual changes
    console.log(`[docs-tracker] Document changed - generating diff (old: ${this.state.lastText.length} chars, new: ${text.length} chars)`);
    const diffs = this.dmp.diff_main(this.state.lastText, text);
    const ops = this.convertDiffsToOps(diffs);

    if (ops.length === 0) {
      console.log("[docs-tracker] No diff operations generated, updating state only");
      this.state.lastText = text;
      this.state.lastHash = newHash;
      await this.saveDocumentState(this.docId, text, newHash);
      return;
    }

    // Send diff event
    console.log(`[docs-tracker] Sending ${ops.length} diff operations`);
    await this.sendDiffEvent(ops, this.state.lastHash, newHash);
    this.state.lastText = text;
    this.state.lastHash = newHash;
    await this.saveDocumentState(this.docId, text, newHash);
  }

  private convertDiffsToOps(diffs: Array<[number, string]>): DiffOp[] {
    const ops: DiffOp[] = [];
    let cursor = 0;

    for (const [operation, data] of diffs) {
      switch (operation) {
        case DIFF_DELETE:
          if (data.length > 0) {
            ops.push({ t: "del", pos: cursor, len: data.length });
            cursor += data.length;
          }
          break;
        case DIFF_INSERT:
          if (data.length > 0) {
            ops.push({ t: "ins", pos: cursor, text: data });
          }
          break;
        case DIFF_EQUAL:
          cursor += data.length;
          break;
      }
    }

    // Coalesce adjacent operations
    return this.coalesceOps(ops);
  }

  private coalesceOps(ops: DiffOp[]): DiffOp[] {
    if (ops.length <= 1) return ops;

    const coalesced: DiffOp[] = [];
    let current = ops[0];

    for (let i = 1; i < ops.length; i++) {
      const next = ops[i];

      // Try to coalesce adjacent deletes
      if (
        current.t === "del" &&
        next.t === "del" &&
        current.pos + current.len === next.pos
      ) {
        current = { t: "del", pos: current.pos, len: current.len + next.len };
        continue;
      }

      // Try to coalesce adjacent inserts at same position
      if (current.t === "ins" && next.t === "ins" && current.pos === next.pos) {
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

  private async sendDiffEvent(
    ops: DiffOp[],
    oldHash: string | null,
    newHash: string
  ): Promise<void> {
    const payload: DiffEvent = {
      ts: new Date().toISOString(),
      docId: this.docId,
      docUrl: location.href,
      installId: this.state.installId,
      sampleMs: 30000,
      source: "chrome-ext@v1",
      oldHash,
      newHash,
      ops,
      meta: {
        title: this.extractTitle(),
        userLocale: navigator.language,
      },
    };

    // Check payload size and compress if needed
    const payloadStr = JSON.stringify(payload);
    if (payloadStr.length > 200 * 1024) {
      // TODO: Implement gzip compression if needed
      console.warn(
        "[docs-tracker] Large payload detected, compression not yet implemented"
      );
    }

    // Check if we're in backoff for posting
    if (backoffManager.isInBackoff("post")) {
      console.log("[docs-tracker] Skipping send due to backoff");
      return;
    }

    try {
      await backoffManager.withBackoff("post", async () => {
        console.log(payloadStr);

        // TODO: To be implemented at a later date (not by CLAUDE)
        // const response = await fetch(API_URL, {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   body: payloadStr,
        //   keepalive: true,
        // });

        // if (!response.ok) {
        //   throw new Error(`Post failed: ${response.status}`);
        // }

        console.log(
          `[docs-tracker] Sent ${ops.length} ops for doc ${this.docId}`
        );
      });
    } catch (error) {
      console.error("[docs-tracker] Failed to send diff event:", error);
    }
  }

  private async sendHeartbeat(): Promise<void> {
    const payload = {
      ts: new Date().toISOString(),
      docId: this.docId,
      docUrl: location.href,
      installId: this.state.installId,
      source: "chrome-ext@v1",
      tooLarge: true,
    };

    try {
      // TODO: To be implemented at a later date (not by CLAUDE)
      // await fetch(API_URL, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(payload),
      //   keepalive: true,
      // });

      console.log("[docs-tracker] Sent heartbeat for oversized doc");
    } catch (error) {
      console.error("[docs-tracker] Failed to send heartbeat:", error);
    }
  }

  private extractTitle(): string {
    const title = document.title;
    return title.replace(/ - Google Docs$/, "").trim();
  }
}

// Initialize tracker when content script loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    new GoogleDocsTracker();
  });
} else {
  new GoogleDocsTracker();
}

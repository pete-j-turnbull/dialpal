/**
 * Background service worker for Google Docs Diff Tracker Chrome Extension
 * Handles cross-origin requests to Google Docs export API to bypass CORS restrictions
 */

// Message types for communication with content script
interface FetchDocMessage {
  action: "fetchDocText";
  docId: string;
}

interface FetchDocResponse {
  success: boolean;
  text?: string;
  error?: string;
}

/**
 * Validates that the docId is a valid Google Docs document ID format
 */
function validateDocId(docId: string): boolean {
  // Google Docs IDs are typically 44 characters long and contain letters, numbers, hyphens, and underscores
  const docIdPattern = /^[a-zA-Z0-9_-]{25,50}$/;
  return docIdPattern.test(docId);
}

/**
 * Fetches document text from Google Docs export API
 */
async function fetchGoogleDocText(docId: string): Promise<string> {
  if (!validateDocId(docId)) {
    throw new Error("Invalid document ID format");
  }

  const url = `https://docs.google.com/document/d/${docId}/export?format=txt`;

  console.log(`[docs-tracker-bg] Fetching document text for ID: ${docId}`);

  const response = await fetch(url, {
    credentials: "include", // Include cookies for authentication
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`Export failed: ${response.status} ${response.statusText}`);
  }

  const text = await response.text();
  console.log(
    `[docs-tracker-bg] Successfully fetched document text, length: ${text.length} chars`
  );

  return text;
}

/**
 * Handle messages from content script
 */
chrome.runtime.onMessage.addListener(
  (
    message: FetchDocMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: FetchDocResponse) => void
  ) => {
    // Only handle messages from content scripts on docs.google.com
    if (!sender.tab?.url?.includes("docs.google.com")) {
      sendResponse({ success: false, error: "Invalid sender origin" });
      return false;
    }

    if (message.action === "fetchDocText") {
      // Use async function in background to handle the fetch
      (async () => {
        try {
          const text = await fetchGoogleDocText(message.docId);
          sendResponse({ success: true, text });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";
          console.error(
            "[docs-tracker-bg] Failed to fetch document text:",
            errorMessage
          );
          sendResponse({ success: false, error: errorMessage });
        }
      })();

      // Return true to indicate we'll send respond asynchronously
      return true;
    }

    // Unknown message type
    sendResponse({ success: false, error: "Unknown action" });
    return false;
  }
);

console.log("[docs-tracker-bg] Background service worker loaded");

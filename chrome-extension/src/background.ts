/**
 * Background service worker for Google Docs Diff Tracker Chrome Extension
 * Handles cross-origin requests to Google Docs export API to bypass CORS restrictions
 */

// Message types for communication with content script
interface FetchDocMessage {
  action: 'fetchDocText';
  docId: string;
}

interface FetchDocResponse {
  success: boolean;
  text?: string;
  error?: string;
}

// Exponential backoff for failed requests
class BackgroundBackoff {
  private backoffState: { [key: string]: { count: number; nextRetryTime: number } } = {};

  async withBackoff<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const backoffInfo = this.backoffState[key];

    // If we're in backoff period, throw error
    if (backoffInfo && now < backoffInfo.nextRetryTime) {
      throw new Error(`Backoff active for ${key}. Next retry in ${Math.ceil((backoffInfo.nextRetryTime - now) / 1000)}s`);
    }

    try {
      const result = await fn();
      // Success - reset backoff
      this.resetBackoff(key);
      return result;
    } catch (error) {
      this.incrementBackoff(key);
      throw error;
    }
  }

  resetBackoff(key: string): void {
    delete this.backoffState[key];
  }

  private incrementBackoff(key: string): void {
    const current = this.backoffState[key] || { count: 0, nextRetryTime: 0 };
    const newCount = current.count + 1;
    
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 32s, 60s, 120s (cap at 2 minutes)
    const baseDelay = Math.min(Math.pow(2, newCount - 1) * 1000, 120000);
    
    // Add jitter (±25%)
    const jitter = baseDelay * 0.25 * (Math.random() - 0.5);
    const delay = Math.max(1000, baseDelay + jitter);

    this.backoffState[key] = {
      count: newCount,
      nextRetryTime: Date.now() + delay
    };

    console.log(`[docs-tracker-bg] Backoff for ${key}: attempt ${newCount}, next retry in ${Math.ceil(delay / 1000)}s`);
  }
}

const backgroundBackoff = new BackgroundBackoff();

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
    throw new Error('Invalid document ID format');
  }

  const url = `https://docs.google.com/document/d/${docId}/export?format=txt`;
  
  console.log(`[docs-tracker-bg] Fetching document text for ID: ${docId}`);
  
  const response = await fetch(url, {
    credentials: 'include', // Include cookies for authentication
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });

  if (!response.ok) {
    throw new Error(`Export failed: ${response.status} ${response.statusText}`);
  }

  const text = await response.text();
  console.log(`[docs-tracker-bg] Successfully fetched document text, length: ${text.length} chars`);
  
  return text;
}

/**
 * Handle messages from content script
 */
chrome.runtime.onMessage.addListener((
  message: FetchDocMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: FetchDocResponse) => void
) => {
  // Only handle messages from content scripts on docs.google.com
  if (!sender.tab?.url?.includes('docs.google.com')) {
    sendResponse({ success: false, error: 'Invalid sender origin' });
    return false;
  }

  if (message.action === 'fetchDocText') {
    // Use async function in background to handle the fetch
    (async () => {
      try {
        await backgroundBackoff.withBackoff(`export-${message.docId}`, async () => {
          const text = await fetchGoogleDocText(message.docId);
          sendResponse({ success: true, text });
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('[docs-tracker-bg] Failed to fetch document text:', errorMessage);
        sendResponse({ success: false, error: errorMessage });
      }
    })();

    // Return true to indicate we'll send response asynchronously
    return true;
  }

  // Unknown message type
  sendResponse({ success: false, error: 'Unknown action' });
  return false;
});

console.log('[docs-tracker-bg] Background service worker loaded');
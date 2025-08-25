import { BackoffState } from "../types.js";

/**
 * Exponential backoff utility with jitter
 */
class BackoffManager {
  private state: BackoffState = {};

  /**
   * Execute a function with exponential backoff
   */
  async withBackoff<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const backoffInfo = this.state[key];

    // If we're in backoff period, throw error
    if (backoffInfo && now < backoffInfo.nextRetryTime) {
      throw new Error(
        `Backoff active for ${key}. Next retry in ${Math.ceil(
          (backoffInfo.nextRetryTime - now) / 1000
        )}s`
      );
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

  /**
   * Reset backoff for a key
   */
  resetBackoff(key: string): void {
    delete this.state[key];
  }

  /**
   * Increment backoff for a key
   */
  private incrementBackoff(key: string): void {
    const current = this.state[key] || { count: 0, nextRetryTime: 0 };
    const newCount = current.count + 1;

    // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 32s, 60s, 120s (cap at 2 minutes)
    const baseDelay = Math.min(Math.pow(2, newCount - 1) * 1000, 120000);

    // Add jitter (±25%)
    const jitter = baseDelay * 0.25 * (Math.random() - 0.5);
    const delay = Math.max(1000, baseDelay + jitter);

    this.state[key] = {
      count: newCount,
      nextRetryTime: Date.now() + delay,
    };

    console.log(
      `[docs-tracker] Backoff for ${key}: attempt ${newCount}, next retry in ${Math.ceil(
        delay / 1000
      )}s`
    );
  }

  /**
   * Check if a key is currently in backoff
   */
  isInBackoff(key: string): boolean {
    const backoffInfo = this.state[key];
    return backoffInfo ? Date.now() < backoffInfo.nextRetryTime : false;
  }
}

export const backoffManager = new BackoffManager();

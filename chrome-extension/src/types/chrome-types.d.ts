/**
 * Additional Chrome API type definitions
 * Supplements @types/chrome where needed
 */

declare global {
  interface Window {
    chrome?: typeof chrome;
  }
}

export {};

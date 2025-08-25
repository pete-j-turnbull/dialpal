export {};

declare global {
  type Override<T, K> = Omit<T, keyof K> & K;

  interface UserPublicMetadata {
    deployment?: string;
  }
}

// https://clerk.com/docs/guides/custom-types

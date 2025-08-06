export {};

declare global {
  type Override<T, K> = Omit<T, keyof K> & K;

  interface UserPublicMetadata {
    is_root?: boolean;
    deployment?: string;
  }

  interface OrganizationPublicMetadata {
    deployment?: string;
  }

  interface OrganizationInvitationPublicMetadata {
    deployment?: string;
  }

  interface OrganizationMembershipPublicMetadata {
    deployment?: string;
  }
}

// https://clerk.com/docs/guides/custom-types

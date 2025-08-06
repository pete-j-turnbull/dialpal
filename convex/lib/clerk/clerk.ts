import { createClerkClient, ClerkClient } from "@clerk/backend";
import { OrganizationMembershipRole } from "./const";
import { requireEnv } from "../../../env";

export class Clerk {
  private client?: ClerkClient;

  private ensureClient() {
    if (!this.client) {
      const env = requireEnv("clerk");
      this.client = createClerkClient({
        secretKey: env.clerk.secretKey,
      });
    }

    return this.client;
  }

  public async createOrganization(args: {
    name: string;
    createdBy?: string;
    publicMetadata?: Record<string, string>;
  }) {
    const client = this.ensureClient();

    const { name, createdBy, publicMetadata } = args;
    return client.organizations.createOrganization({
      name,
      createdBy,
      publicMetadata,
    });
  }

  public async createOrganizationInvitation(args: {
    organizationId: string;
    emailAddress: string;
    role: OrganizationMembershipRole;
    publicMetadata?: Record<string, string>;
  }) {
    const { organizationId, emailAddress, role, publicMetadata } = args;

    const client = this.ensureClient();

    const data = {
      organizationId,
      emailAddress,
      role,
      publicMetadata,
    };

    return client.organizations.createOrganizationInvitation(data);
  }

  public async revokeOrganizationInvitation(args: {
    organizationId: string;
    invitationId: string;
  }) {
    const client = this.ensureClient();

    return client.organizations.revokeOrganizationInvitation({
      organizationId: args.organizationId,
      invitationId: args.invitationId,
    });
  }
}

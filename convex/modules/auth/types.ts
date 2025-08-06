import { Id } from "@convex/_generated/dataModel";

export type AuthContext = {
  organizationId?: Id<"organizations">;
  userId: Id<"users">;
  isRoot: boolean;
};

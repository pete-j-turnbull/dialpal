import { defineTable } from "convex/server";
import { v } from "convex/values";
import { Doc, Id } from "@convex/_generated/dataModel";

export const userSchema = v.object({
  email: v.string(),
  clerkId: v.string(),
});

export type UserId = Id<"users">;
export type User = Doc<"users">;

export const userTable = defineTable(userSchema).index("by_clerk_id", [
  "clerkId",
]);

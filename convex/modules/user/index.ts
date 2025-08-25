import { type QueryCtx } from "@convex/functions";
import { User } from "@convex/schema/user";
import { Id } from "@convex/_generated/dataModel";

export async function get(
  ctx: QueryCtx,
  args: { id: Id<"users"> }
): Promise<User> {
  const { id } = args;

  const user = await ctx.db.get(id);
  if (!user) throw new Error("User not found");

  return user;
}

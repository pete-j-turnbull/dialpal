import { defineSchema } from "convex/server";

import { userTable } from "@convex/schema/user";

export default defineSchema({
  users: userTable,
});

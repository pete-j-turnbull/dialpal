import { defineSchema } from "convex/server";

import { userTable } from "@convex/schema/user";
import { documentsTable, documentChangesTable } from "@convex/schema/document";

export default defineSchema({
  users: userTable,
  documents: documentsTable,
  document_changes: documentChangesTable,
});

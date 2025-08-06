import {
  creatorDNASchema,
  phoneticCorrectionSchema,
} from "@convex/schema/workspace";
import { v } from "convex/values";

export const updateArgsSchema = v.object({
  phoneticCorrections: v.optional(v.array(phoneticCorrectionSchema)),
  creatorDNA: v.optional(creatorDNASchema),
  isGeneratingContentPillars: v.optional(v.boolean()),
});

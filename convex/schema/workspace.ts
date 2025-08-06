import { Infer, v } from "convex/values";

export const workspaceIdSchema = v.union(v.id("organizations"), v.id("users"));

export const phoneticCorrectionSchema = v.object({
  id: v.string(),
  word: v.string(),
  phonetic: v.string(),
});

export const creatorDNASchema = v.object({
  description: v.optional(v.string()),
  icp: v.optional(v.string()),
  salesTranscripts: v.optional(v.string()),
  brandVoice: v.optional(v.string()),
  mission: v.optional(v.string()),
  coreValues: v.optional(v.string()),
  competitors: v.optional(v.string()),
  valuePropositions: v.optional(v.string()),
  bio: v.optional(v.string()),
});

export const workspaceFields = {
  phoneticCorrections: v.optional(v.array(phoneticCorrectionSchema)),
  creatorDNA: v.optional(creatorDNASchema),
  isGeneratingContentPillars: v.optional(v.boolean()),
};

export const workspaceSchema = v.object({
  id: workspaceIdSchema,
  ...workspaceFields,
});

export type WorkspaceId = Infer<typeof workspaceIdSchema>;
export type Workspace = Infer<typeof workspaceSchema>;

export type PhoneticCorrection = Infer<typeof phoneticCorrectionSchema>;
export type CreatorDNA = Infer<typeof creatorDNASchema>;

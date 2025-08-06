import { privateMutation } from "@convex/functions";
import { workspaceIdSchema } from "@convex/schema/workspace";
import { v } from "convex/values";
import { fileImageSchema } from "@convex/schema/common";
import { AvatarStatus } from "@convex/schema/resources/avatar";

export const importMany = privateMutation({
  args: {
    workspaceId: workspaceIdSchema,
    data: v.array(
      v.object({
        name: v.string(),
        heygenAvatarId: v.string(),
        elevenLabsVoiceId: v.string(),
        aspect: v.union(v.literal("16:9"), v.literal("9:16")),
        preview: fileImageSchema,
      })
    ),
  },
  handler: async (ctx, args) => {
    const { workspaceId, data } = args;

    for (const avatar of data) {
      await ctx.db.insert("avatars", {
        workspaceId,
        status: AvatarStatus.Ready,
        preview: avatar.preview,
        aspect: avatar.aspect,
        heygenAvatarId: avatar.heygenAvatarId,
        elevenLabsVoiceId: avatar.elevenLabsVoiceId,
        name: avatar.name,
      });
    }
  },
});

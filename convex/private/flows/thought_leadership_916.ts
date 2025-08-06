import { privateQuery, privateMutation } from "@convex/functions";
import * as module from "@convex/modules/flows/thought_leadership_916";
import { updateArgsSchema } from "@convex/modules/flows/thought_leadership_916/schemas";
import { FlowThoughtLeadership916 } from "@convex/schema/flows";
import { v } from "convex/values";

export const get = privateQuery({
  args: { id: v.id("flows") },
  handler: async (ctx, args): Promise<FlowThoughtLeadership916 | null> => {
    return await module.get(ctx, args);
  },
});

export const update = privateMutation({
  args: {
    id: v.id("flows"),
    data: updateArgsSchema,
  },
  handler: async (ctx, args) => {
    return await module.update(ctx, args);
  },
});

export const fetchRequiredDataForTemplate = privateQuery({
  args: { id: v.id("flows") },
  handler: async (ctx, args) => {
    return await module.fetchRequiredDataForTemplate(ctx, args);
  },
});

import { httpAction } from "@convex/functions";
import { internal } from "@convex/_generated/api";
import type { WebhookEvent } from "@clerk/backend";
import { Webhook } from "svix";
import { requireEnv } from "../../env";

export const clerkWebhookAction = httpAction(async (ctx, request) => {
  const event = await validateRequest(request);
  if (!event) {
    return new Response("Error occured", { status: 400 });
  }

  switch (event.type) {
    case "user.created": // intentional fallthrough
    case "user.updated":
      await ctx.runMutation(internal.modules.auth.internal.upsertUser, {
        data: event.data,
      });
      break;

    case "user.deleted": {
      await ctx.runMutation(internal.modules.auth.internal.deleteUser, {
        clerkId: event.data.id!,
      });
      break;
    }

    default:
      console.log("Ignored Clerk webhook event", event.type);
  }

  return new Response(null, { status: 200 });
});

async function validateRequest(req: Request): Promise<WebhookEvent | null> {
  const env = requireEnv("clerk");

  const payloadString = await req.text();
  const svixHeaders = {
    "svix-id": req.headers.get("svix-id")!,
    "svix-timestamp": req.headers.get("svix-timestamp")!,
    "svix-signature": req.headers.get("svix-signature")!,
  };
  const wh = new Webhook(env.clerk.webhookSecret);

  try {
    return wh.verify(payloadString, svixHeaders) as unknown as WebhookEvent;
  } catch (error) {
    console.error("Error verifying webhook event", error);
    return null;
  }
}

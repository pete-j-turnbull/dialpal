import { httpRouter } from "convex/server";
import { clerkWebhookAction } from "./http/clerk";

const http = httpRouter();

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: clerkWebhookAction,
});

export default http;

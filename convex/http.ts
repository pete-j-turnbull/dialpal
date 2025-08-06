import { httpRouter } from "convex/server";
import { clerkWebhookAction } from "./http/clerk";
import {
  getS3Params,
  createMultipartUpload,
  listParts,
  completeMultipartUpload,
  abortMultipartUpload,
  optionsS3Params,
  optionsMultipartCreate,
  optionsMultipartOperations,
} from "./http/upload";

const http = httpRouter();

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: clerkWebhookAction,
});

// S3 params endpoints
http.route({
  path: "/upload/s3/params",
  method: "GET",
  handler: getS3Params,
});

http.route({
  path: "/upload/s3/params",
  method: "OPTIONS",
  handler: optionsS3Params,
});

// Multipart creation endpoint
http.route({
  path: "/upload/s3/multipart",
  method: "POST",
  handler: createMultipartUpload,
});

http.route({
  path: "/upload/s3/multipart",
  method: "OPTIONS",
  handler: optionsMultipartCreate,
});

// Multipart operations endpoints (with pathPrefix)
http.route({
  pathPrefix: "/upload/s3/multipart/",
  method: "GET",
  handler: listParts,
});

http.route({
  pathPrefix: "/upload/s3/multipart/",
  method: "POST",
  handler: completeMultipartUpload,
});

http.route({
  pathPrefix: "/upload/s3/multipart/",
  method: "DELETE",
  handler: abortMultipartUpload,
});

http.route({
  pathPrefix: "/upload/s3/multipart/",
  method: "OPTIONS",
  handler: optionsMultipartOperations,
});

export default http;

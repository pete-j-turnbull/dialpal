import { internal } from "@convex/_generated/api";
import { httpAction } from "../_generated/server";
import { requireEnv } from "../../env";

// CORS headers configuration
const corsHeadersFn = (origin: string) => {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, Accept, X-Requested-With",
    "Access-Control-Max-Age": "86400", // 24 hours
  };
};

export const getS3Params = httpAction(async (ctx, request) => {
  const url = new URL(request.url);
  const type = url.searchParams.get("type");

  const env = requireEnv("app");
  const origin = env.app.url;

  const corsHeaders = corsHeadersFn(origin);

  if (!type) {
    return new Response(JSON.stringify({ error: "Content type is required" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
    });
  }

  try {
    // Get presigned URL for PUT upload
    const result = await ctx.runAction(
      internal.modules.upload.index.getS3Params,
      { type }
    );

    // Return in the format Uppy expects
    return new Response(
      JSON.stringify({
        method: "PUT",
        url: result.url,
        headers: {
          "Content-Type": type,
        },
        key: result.key,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
          "Access-Control-Allow-Methods": "GET, OPTIONS",
        },
      }
    );
  } catch (error) {
    console.error("Error generating S3 params:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate upload parameters" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
          "Access-Control-Allow-Methods": "GET, OPTIONS",
        },
      }
    );
  }
});

export const createMultipartUpload = httpAction(async (ctx, request) => {
  const body = await request.json();
  const { type } = body;

  const env = requireEnv("app");
  const origin = env.app.url;

  const corsHeaders = corsHeadersFn(origin);

  if (!type) {
    return new Response(JSON.stringify({ error: "Type is required" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  try {
    const result = await ctx.runAction(
      internal.modules.upload.index.createMultipartUpload,
      { type }
    );

    return new Response(
      JSON.stringify({
        uploadId: result.uploadId,
        key: result.key,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
        },
      }
    );
  } catch (error) {
    console.error("Error creating multipart upload:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create multipart upload" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
        },
      }
    );
  }
});

export const listParts = httpAction(async (ctx, request) => {
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/").filter(Boolean);

  const env = requireEnv("app");
  const origin = env.app.url;

  const corsHeaders = corsHeadersFn(origin);

  // Check if this is a request for a specific part URL or listing all parts
  // pathParts should be like ["upload", "s3", "multipart", uploadId] or ["upload", "s3", "multipart", uploadId, partNumber]

  if (pathParts.length === 5 && !isNaN(Number(pathParts[4]))) {
    // Get upload part URL: /upload/s3/multipart/{uploadId}/{partNumber}
    const uploadId = pathParts[3];
    const partNumber = pathParts[4];
    const key = url.searchParams.get("key");

    if (!uploadId || !partNumber || !key) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
            "Access-Control-Allow-Methods": "GET, OPTIONS",
          },
        }
      );
    }

    try {
      const result = await ctx.runAction(
        internal.modules.upload.index.getPart,
        { uploadId, partNumber: Number(partNumber), key }
      );

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
          "Access-Control-Allow-Methods": "GET, OPTIONS",
        },
      });
    } catch (error) {
      console.error("Error signing upload part:", error);
      return new Response(
        JSON.stringify({ error: "Failed to sign upload part" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
            "Access-Control-Allow-Methods": "GET, OPTIONS",
          },
        }
      );
    }
  } else {
    // List parts: /upload/s3/multipart/{uploadId}
    const uploadId = pathParts[3];
    const key = url.searchParams.get("key");

    if (!uploadId || !key) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
            "Access-Control-Allow-Methods": "GET, OPTIONS",
          },
        }
      );
    }

    try {
      const result = await ctx.runAction(
        internal.modules.upload.index.listParts,
        { uploadId, key }
      );

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
          "Access-Control-Allow-Methods": "GET, OPTIONS",
        },
      });
    } catch (error) {
      console.error("Error listing parts:", error);
      return new Response(JSON.stringify({ error: "Failed to list parts" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
          "Access-Control-Allow-Methods": "GET, OPTIONS",
        },
      });
    }
  }
});

export const completeMultipartUpload = httpAction(async (ctx, request) => {
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/").filter(Boolean);

  const env = requireEnv("app");
  const origin = env.app.url;

  const corsHeaders = corsHeadersFn(origin);

  // Extract uploadId from path
  // Expected format: /upload/s3/multipart/{uploadId}/complete
  // pathParts should be like ["upload", "s3", "multipart", uploadId, "complete"]
  const uploadId = pathParts[3];
  const key = url.searchParams.get("key");

  const body = await request.json();
  const { parts } = body;

  if (!uploadId || !key || !parts) {
    return new Response(
      JSON.stringify({ error: "Missing required parameters" }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
        },
      }
    );
  }

  try {
    const result = await ctx.runAction(
      internal.modules.upload.index.completeMultipartUpload,
      { uploadId, key, parts }
    );

    return new Response(
      JSON.stringify({
        location: result.location,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
        },
      }
    );
  } catch (error) {
    console.error("Error completing multipart upload:", error);
    return new Response(
      JSON.stringify({ error: "Failed to complete multipart upload" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
        },
      }
    );
  }
});

export const abortMultipartUpload = httpAction(async (ctx, request) => {
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/").filter(Boolean);

  const env = requireEnv("app");
  const origin = env.app.url;

  const corsHeaders = corsHeadersFn(origin);

  // Extract uploadId from path
  // Expected format: /upload/s3/multipart/{uploadId}
  // pathParts should be like ["upload", "s3", "multipart", uploadId]
  const uploadId = pathParts[3];
  const key = url.searchParams.get("key");

  if (!uploadId || !key) {
    return new Response(
      JSON.stringify({ error: "Missing required parameters" }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
          "Access-Control-Allow-Methods": "DELETE, OPTIONS",
        },
      }
    );
  }

  try {
    await ctx.runAction(internal.modules.upload.index.abortMultipartUpload, {
      uploadId,
      key,
    });

    return new Response(null, {
      status: 204,
      headers: {
        ...corsHeaders,
        "Access-Control-Allow-Methods": "DELETE, OPTIONS",
      },
    });
  } catch (error) {
    console.error("Error aborting multipart upload:", error);
    return new Response(
      JSON.stringify({ error: "Failed to abort multipart upload" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
          "Access-Control-Allow-Methods": "DELETE, OPTIONS",
        },
      }
    );
  }
});

// CORS OPTIONS handlers
export const optionsS3Params = httpAction(async (ctx, request) => {
  const env = requireEnv("app");
  const origin = env.app.url;

  const corsHeaders = corsHeadersFn(origin);

  return new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders,
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    },
  });
});

export const optionsMultipartCreate = httpAction(async (ctx, request) => {
  const env = requireEnv("app");
  const origin = env.app.url;

  const corsHeaders = corsHeadersFn(origin);

  return new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
  });
});

export const optionsMultipartOperations = httpAction(async (ctx, request) => {
  const env = requireEnv("app");
  const origin = env.app.url;

  const corsHeaders = corsHeadersFn(origin);

  return new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders,
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    },
  });
});

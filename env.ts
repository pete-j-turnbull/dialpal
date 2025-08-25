import { type RequiredDeep } from "type-fest";

export type Env = {
  nextPublic: {
    clerkFrontendApiUrl?: string;
    clerkPublishableKey?: string;
    convexCloudUrl?: string;
    convexSiteUrl?: string;
    url?: string;
  };
  app: {
    url?: string;
  };
  clerk: {
    domain?: string;
    secretKey?: string;
    webhookSecret?: string;
  };
  convex: {
    cloudUrl?: string;
    siteUrl?: string;
    sharedSecret?: string;
    deployment?: string;
  };
  cache: {
    host?: string;
    port?: number;
    user?: string;
    pass?: string;
  };
  trigger: {
    secretKey?: string;
  };
  claude: {
    apiKey?: string;
  };
};

type PickedEnv<M extends Array<keyof Env>> = {
  [K in M[number]]: RequiredDeep<Env[K]>;
};

function getEnv(): Env {
  return {
    nextPublic: {
      clerkFrontendApiUrl: process.env.NEXT_PUBLIC_CLERK_FRONTEND_API_URL,
      clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      convexCloudUrl: process.env.NEXT_PUBLIC_CONVEX_CLOUD_URL,
      convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL,
      url: process.env.NEXT_PUBLIC_APP_URL,
    },
    app: {
      url: process.env.APP_URL,
    },
    clerk: {
      domain: process.env.CLERK_DOMAIN,
      secretKey: process.env.CLERK_SECRET_KEY,
      webhookSecret: process.env.CLERK_WEBHOOK_SECRET,
    },
    convex: {
      cloudUrl: process.env.CONVEX_CLOUD_URL,
      siteUrl: process.env.CONVEX_SITE_URL,
      sharedSecret: process.env.CONVEX_SHARED_SECRET,
      deployment: process.env.CONVEX_DEPLOYMENT ?? "dev",
    },
    cache: {
      host: process.env.CACHE_HOST,
      port: process.env.CACHE_PORT ? parseInt(process.env.CACHE_PORT) : 6379,
      user: process.env.CACHE_USER,
      pass: process.env.CACHE_PASS ?? "",
    },
    trigger: {
      secretKey: process.env.TRIGGER_SECRET_KEY,
    },
    claude: {
      apiKey: process.env.CLAUDE_API_KEY,
    },
  };
}

export function requireEnv<K extends Array<keyof Env>>(
  ...keys: K
): PickedEnv<K> {
  const env = getEnv();
  const missingKeys: string[] = [];

  // Deep check each requested key
  keys.forEach((key) => {
    const envSection = env[key];
    if (!envSection) {
      missingKeys.push(key as string);
    } else {
      // Check each property within the section
      Object.entries(envSection).forEach(([subKey, value]) => {
        if (value === undefined || value === null || value === "") {
          missingKeys.push(`${key as string}.${subKey}`);
        }
      });
    }
  });

  if (missingKeys.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingKeys.join(", ")}`
    );
  }

  return env as unknown as PickedEnv<K>;
}

"use client";

import { ReactNode, useMemo } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";
import { config } from "@/config";

// Singleton pattern to ensure consistent client instance
let convexClient: ConvexReactClient | null = null;

function getConvexClient() {
  if (!convexClient && typeof window !== "undefined") {
    convexClient = new ConvexReactClient(config.convexCloudUrl);
  }
  return convexClient;
}

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  const client = useMemo(() => {
    return getConvexClient() || new ConvexReactClient(config.convexCloudUrl);
  }, []);

  return (
    <ConvexProviderWithClerk client={client} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}

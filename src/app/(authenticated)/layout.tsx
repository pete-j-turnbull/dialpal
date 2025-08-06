"use client";

import { useConvexAuth } from "convex/react";
import { LoadingScreen } from "@/components/loading-screen";
import { Confirm } from "@/components/confirm";
import { Toaster } from "@/components/ui/sonner";
import { UploadProvider } from "@/features/upload/context";

type LayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function Layout({ children }: LayoutProps) {
  const { isLoading, isAuthenticated } = useConvexAuth();

  if (isLoading || !isAuthenticated) {
    return <LoadingScreen />;
  }

  return (
    <UploadProvider>
      {children}
      <Toaster />
      <Confirm />
    </UploadProvider>
  );
}

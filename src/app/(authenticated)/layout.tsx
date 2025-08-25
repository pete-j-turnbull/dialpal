"use client";

import { useConvexAuth } from "convex/react";
import { LoadingScreen } from "@/components/loading-screen";
import { Confirm } from "@/components/confirm";
import { Toaster } from "@/components/ui/sonner";

type LayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function Layout({ children }: LayoutProps) {
  const { isLoading, isAuthenticated } = useConvexAuth();

  if (isLoading || !isAuthenticated) {
    return <LoadingScreen />;
  }

  return (
    <>
      {children}
      <Toaster />
      <Confirm />
    </>
  );
}

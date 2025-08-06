"use client";

import { AppSidebar } from "@/components/app-sidebar";

import { TopNav } from "@/components/top-nav";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";

const SIDEBAR_WIDTH = 220;

type LayoutProps = Readonly<{
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}>;

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="h-screen">
      <TopNav
        left={
          <OrganizationSwitcher
            afterCreateOrganizationUrl="/orgs/:slug"
            afterSelectOrganizationUrl="/orgs/:slug"
            afterSelectPersonalUrl="/personal"
          />
        }
        right={<UserButton />}
      />

      <div
        style={{ width: SIDEBAR_WIDTH }}
        className={`fixed left-0 top-0 z-10 h-[calc(100vh-var(--top-nav-height))]`}
      >
        <AppSidebar />
      </div>
      <div
        style={{ marginLeft: SIDEBAR_WIDTH }}
        className={`h-[calc(100vh-var(--top-nav-height))]`}
      >
        {children}
      </div>
    </div>
  );
}

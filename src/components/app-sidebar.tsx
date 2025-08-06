"use client";

import {
  SidebarMenuButton,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useUser } from "@clerk/nextjs";

import { Cog, Home, Shield, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const extractRoute = (pathname: string) => {
  const lastSlashIndex = pathname.lastIndexOf("/");
  const beforeLastSlash = pathname.substring(0, lastSlashIndex);
  const subRoute = pathname.substring(lastSlashIndex + 1);

  return [beforeLastSlash, subRoute];
};

export const AppSidebar = () => {
  const pathname = usePathname();
  const [before, tab] = extractRoute(pathname);

  const { user } = useUser();

  const isRoot = user?.publicMetadata.is_root;

  return (
    <SidebarProvider open>
      <Sidebar
        variant="sidebar"
        collapsible="none"
        className="bg-background 100svh mt-14 w-full pt-4"
      >
        <SidebarContent className="h-full px-4">
          {/* <TeamSelector /> */}
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={tab === "home"}
                className="hover:bg-accent hover:text-accent-foreground rounded-lg p-5"
              >
                <Link href={`${before}/home`}>
                  <Home className="h-4 w-4" />
                  <span className="text-sm font-medium">Home</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={tab === "insights"}
                className="hover:bg-accent hover:text-accent-foreground rounded-lg p-5"
              >
                <Link href={`${before}/insights`}>
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm font-medium">Insights</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={tab === "settings"}
                className="hover:bg-accent hover:text-accent-foreground rounded-lg p-5"
              >
                <Link href={`${before}/settings`}>
                  <Cog className="h-4 w-4" />
                  <span className="text-sm font-medium">Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {isRoot && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="hover:bg-accent hover:text-accent-foreground rounded-lg p-5"
                >
                  <Link href={`/admin`}>
                    <Shield className="h-4 w-4" />
                    <span className="text-sm font-medium">Admin</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>

          {/* <NavSecondary className="mt-auto" /> */}
        </SidebarContent>
        <SidebarFooter className="bg-background"></SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  );
};

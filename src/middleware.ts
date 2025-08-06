import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/((?!sign-in|sign-up|error).*)"]);

export default clerkMiddleware(
  async (auth, req) => {
    const { isAuthenticated, orgId, orgSlug } = await auth();
    const url = req.nextUrl;
    const pathname = url.pathname;

    // Handle root path redirects based on auth state
    if (pathname === "/") {
      if (!isAuthenticated) {
        return NextResponse.redirect(new URL("/sign-in", req.url));
      }

      if (orgId) {
        return NextResponse.redirect(new URL(`/orgs/${orgSlug}`, req.url));
      } else {
        return NextResponse.redirect(new URL("/personal/home", req.url));
      }
    }

    // Handle protected routes
    if (isProtectedRoute(req)) await auth.protect();

    // Check if we're at /org/[slug] exactly (not /org/[slug]/something)
    const orgRootMatch = pathname.match(/^\/orgs\/([^\/]+)$/);
    if (orgRootMatch) {
      const slug = orgRootMatch[1];
      // Special case: if slug is "personal", redirect to /personal/home
      if (slug === "personal") {
        return NextResponse.redirect(new URL("/personal/home", req.url));
      }
      return NextResponse.redirect(new URL(`/orgs/${slug}/home`, req.url));
    }

    // Check if we're at /personal exactly
    if (pathname === "/personal") {
      return NextResponse.redirect(new URL("/personal/home", req.url));
    }
  },
  {
    // This will automatically sync organizations based on URL patterns
    organizationSyncOptions: {
      organizationPatterns: ["/orgs/:slug", "/orgs/:slug/(.*)"],
      personalAccountPatterns: ["/personal", "/personal/(.*)"],
    },
  }
);

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

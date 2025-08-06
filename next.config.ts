import type { NextConfig } from "next";
import { withAxiom } from "next-axiom";

const nextConfig: NextConfig = withAxiom({
  async rewrites() {
    return [
      {
        source: "/storybook/",
        destination: "/storybook/index.html",
      },
      {
        source: "/personal",
        destination: "/orgs/personal",
      },
      {
        source: "/personal/:path*",
        destination: "/orgs/personal/:path*",
      },
    ];
  },
  outputFileTracingIncludes: {
    registry: ["./src/**/*"],
  },
  // experimental: {
  //   ppr: "incremental",
  // },
});

export default nextConfig;

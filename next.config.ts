import type { NextConfig } from "next";
import { withAxiom } from "next-axiom";

const nextConfig: NextConfig = withAxiom({
  async rewrites() {
    return [
      {
        source: "/storybook/",
        destination: "/storybook/index.html",
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

import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  // Exclude @vercel/og from the standalone output trace.
  // This package (OG image generation) is bundled by Next.js by default but is
  // not used in this project. It contains WASM blobs that add ~2.2 MiB
  // uncompressed (~1.5 MiB gzip) to the Worker bundle, pushing it past the
  // Cloudflare free-tier 3 MiB limit.
  outputFileTracingExcludes: {
    "*": ["node_modules/next/dist/compiled/@vercel/og/**"],
  },

  // Also null out the package in webpack so it is never imported into the
  // edge bundle even if Next.js tries to resolve it transitively.
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@vercel/og": false,
    };
    return config;
  },
};

export default nextConfig;

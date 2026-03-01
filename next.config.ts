import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();

const isDev = process.env.NODE_ENV === "development";

const securityHeaders = [
  // Block clickjacking
  { key: "X-Frame-Options", value: "DENY" },
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Stop referrer leaking to third parties
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable browser features not needed
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Content Security Policy
  // 'unsafe-eval' is removed in production; Next.js only needs it during local hot-reload
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      isDev
        ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
        : "script-src 'self' 'unsafe-inline'",
      // https: for sponsor logos; data: for inline SVG avatars from OAuth providers
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },

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

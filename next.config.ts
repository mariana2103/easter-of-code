import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Initialize OpenNext for Cloudflare in dev mode
initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  // Required for Cloudflare Workers
};

export default nextConfig;

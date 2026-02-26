import { createAuth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import type { NextRequest } from "next/server";

// createAuth() (and getCloudflareContext) is called inside each
// request handler so the async Cloudflare context is available.
export async function GET(req: NextRequest) {
  const { GET: handler } = toNextJsHandler((await createAuth()).handler);
  return handler(req);
}

export async function POST(req: NextRequest) {
  const { POST: handler } = toNextJsHandler((await createAuth()).handler);
  return handler(req);
}

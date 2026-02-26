import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

// getDB returns a Drizzle client bound to the Cloudflare D1 binding.
// Pass the D1Database from the request context (via getRequestContext).
export function getDB(d1: D1Database) {
  return drizzle(d1, { schema });
}

export type DB = ReturnType<typeof getDB>;

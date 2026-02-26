import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDB } from "./db";
import * as schema from "./db/schema";

export async function createAuth() {
  const { env } = await getCloudflareContext({ async: true });
  const db = getDB(env.DB as D1Database);

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: {
        user: schema.users,
        session: schema.sessions,
        account: schema.accounts,
        verification: schema.verifications,
      },
    }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
    },
    user: {
      additionalFields: {
        username: { type: "string", required: true },
        role: { type: "string", required: false, defaultValue: "user" },
      },
    },
  });
}

export type Auth = Awaited<ReturnType<typeof createAuth>>;

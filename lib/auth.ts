import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDB } from "./db";
import * as schema from "./db/schema";

export async function createAuth() {
  const { env } = await getCloudflareContext({ async: true });
  const db = getDB(env.DB as D1Database);
  const cfEnv = env as unknown as Record<string, string | undefined>;

  const adminEmail = cfEnv.ADMIN_EMAIL?.toLowerCase();
  
  // Limpeza da URL para evitar erros de comparação
  const baseURL = cfEnv.BETTER_AUTH_URL?.replace(/\/$/, "");

  return betterAuth({
    secret: cfEnv.BETTER_AUTH_SECRET,
    baseURL: baseURL,
    
    // Isto é o que realmente resolve o 403 na Cloudflare
    trustedOrigins: [
        "https://acm-hackathon.mariana-almeida.workers.dev"
    ],

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
    // Removido o bloco advanced que causava erro de tipo
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5 
      }
    },
    user: {
      additionalFields: {
        username: { type: "string", required: true },
        role: { type: "string", required: false, defaultValue: "user" },
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            if (adminEmail && user.email.toLowerCase() === adminEmail) {
              return { data: { ...user, role: "admin" } };
            }
            return { data: user };
          },
        },
      },
    },
  });
}
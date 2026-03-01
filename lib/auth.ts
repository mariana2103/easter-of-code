import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDB } from "./db";
import * as schema from "./db/schema";

/** Slugify into a safe a-z0-9_ username base */
function toUsernameBase(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 16) || "user";
}

export async function createAuth() {
  const { env } = await getCloudflareContext({ async: true });
  const db = getDB(env.DB as D1Database);
  const cfEnv = env as unknown as Record<string, string | undefined>;

  const adminEmail = cfEnv.ADMIN_EMAIL?.toLowerCase();
  const baseURL = cfEnv.BETTER_AUTH_URL?.replace(/\/$/, "");

  return betterAuth({
    secret: cfEnv.BETTER_AUTH_SECRET,
    baseURL,

    trustedOrigins: [
      "https://acm-hackathon.mariana-almeida.workers.dev",
      // local dev only — never expose localhost in production
      ...(process.env.NODE_ENV === "development"
        ? ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3009"]
        : []),
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

    // ── OAuth only — no passwords stored ──────────────────────────────
    emailAndPassword: { enabled: false },

    socialProviders: {
      github: {
        clientId: cfEnv.GITHUB_CLIENT_ID ?? "",
        clientSecret: cfEnv.GITHUB_CLIENT_SECRET ?? "",
      },
      google: {
        clientId: cfEnv.GOOGLE_CLIENT_ID ?? "",
        clientSecret: cfEnv.GOOGLE_CLIENT_SECRET ?? "",
      },
    },

    // Tighter session window (was 7 days)
    session: {
      expiresIn: 60 * 60 * 8, // 8 hours
      cookieCache: { enabled: true, maxAge: 60 }, // 1-min client cache
    },

    user: {
      additionalFields: {
        // Not required at API level — auto-generated in the hook below
        username: { type: "string", required: false, defaultValue: "" },
        role: { type: "string", required: false, defaultValue: "user" },
      },
    },

    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            const data: typeof user & { username?: string; role?: string } = { ...user };

            // Admin role — OAuth email is provider-verified, so this is secure
            if (adminEmail && user.email.toLowerCase() === adminEmail) {
              data.role = "admin";
            }

            // Auto-generate username for OAuth users (no username in OAuth profile)
            if (!data.username || data.username.trim() === "") {
              const base = toUsernameBase(user.name || user.email.split("@")[0]);
              const suffix = Math.random().toString(36).slice(2, 7);
              data.username = `${base}_${suffix}`;
            }

            return { data };
          },
        },
      },
    },
  });
}

import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, index } from "drizzle-orm/sqlite-core";

// ── Users ─────────────────────────────────────────────────────────────
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  name: text("name"),
  emailVerified: integer("email_verified", { mode: "boolean" }).default(false),
  image: text("image"),
  role: text("role", { enum: ["user", "admin"] }).notNull().default("user"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Better Auth required tables
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
  scope: text("scope"),
  idToken: text("id_token"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const verifications = sqliteTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ── Editions ───────────────────────────────────────────────────────────
// An "edition" is one hackathon run (e.g. "Spring 2025", "Fall 2025")
export const editions = sqliteTable("editions", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),              // e.g. "ACM Spring Hackathon 2025"
  slug: text("slug").notNull().unique(),     // e.g. "spring-2025"
  description: text("description"),
  startDate: integer("start_date", { mode: "timestamp" }).notNull(),
  endDate: integer("end_date", { mode: "timestamp" }).notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ── Challenges ─────────────────────────────────────────────────────────
export const challenges = sqliteTable(
  "challenges",
  {
    id: text("id").primaryKey(),
    editionId: text("edition_id")
      .notNull()
      .references(() => editions.id, { onDelete: "cascade" }),
    day: integer("day").notNull(),                          // 1-7
    type: text("type", { enum: ["easy", "hard", "sponsored"] }).notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),             // Markdown
    answer: text("answer").notNull(),                       // Stored hashed or plaintext (plaintext for simplicity)
    basePoints: integer("base_points").notNull(),           // easy=100, hard=300, sponsored=200
    sponsorName: text("sponsor_name"),                      // null for non-sponsored
    sponsorLogo: text("sponsor_logo"),                      // URL
    unlocksAt: integer("unlocks_at", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [
    index("challenges_edition_day_idx").on(t.editionId, t.day),
  ]
);

// ── Submissions ────────────────────────────────────────────────────────
export const submissions = sqliteTable(
  "submissions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    challengeId: text("challenge_id")
      .notNull()
      .references(() => challenges.id, { onDelete: "cascade" }),
    answer: text("answer").notNull(),
    isCorrect: integer("is_correct", { mode: "boolean" }).notNull(),
    attemptNumber: integer("attempt_number").notNull().default(1),
    pointsAwarded: integer("points_awarded").notNull().default(0),
    submittedAt: integer("submitted_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [
    index("submissions_user_challenge_idx").on(t.userId, t.challengeId),
    index("submissions_challenge_idx").on(t.challengeId),
  ]
);

export type User = typeof users.$inferSelect;
export type Edition = typeof editions.$inferSelect;
export type Challenge = typeof challenges.$inferSelect;
export type Submission = typeof submissions.$inferSelect;

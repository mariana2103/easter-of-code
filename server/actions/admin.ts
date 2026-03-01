"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDB } from "@/lib/db";
import { challenges, editions } from "@/lib/db/schema";
import { generateId, slugify } from "@/lib/utils";
import { createAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { BASE_POINTS } from "@/lib/scoring";

async function requireAdmin() {
  const auth = await createAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role?: string }).role !== "admin") {
    throw new Error("Unauthorized");
  }
  return session;
}

// ── Input validation helpers ──────────────────────────────────────────────

function requireString(value: FormDataEntryValue | null, field: string, max: number): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${field} is required`);
  }
  if (value.length > max) throw new Error(`${field} exceeds max length of ${max}`);
  return value.trim();
}

function optionalString(value: FormDataEntryValue | null, max: number): string | null {
  if (typeof value !== "string" || value.trim().length === 0) return null;
  if (value.length > max) throw new Error(`Value exceeds max length of ${max}`);
  return value.trim();
}

/** Only allows https:// URLs to prevent data: / javascript: injection */
function requireHttpsUrl(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string" || value.trim().length === 0) return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:") throw new Error("URL must use https://");
    return url.toString();
  } catch {
    throw new Error("Sponsor logo must be a valid https:// URL");
  }
}

// ── Actions ───────────────────────────────────────────────────────────────

export async function createEdition(formData: FormData) {
  await requireAdmin();
  const { env } = await getCloudflareContext({ async: true });
  const db = getDB(env.DB as D1Database);

  const name = requireString(formData.get("name"), "name", 120);
  const description = optionalString(formData.get("description"), 500);
  const startDate = new Date(requireString(formData.get("startDate"), "startDate", 32));
  const endDate = new Date(requireString(formData.get("endDate"), "endDate", 32));
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) throw new Error("Invalid dates");
  if (endDate <= startDate) throw new Error("endDate must be after startDate");

  await db.insert(editions).values({
    id: generateId(),
    name,
    slug: slugify(name),
    description,
    startDate,
    endDate,
    isActive: false,
  });

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}

export async function setActiveEdition(editionId: string) {
  await requireAdmin();
  const { env } = await getCloudflareContext({ async: true });
  const db = getDB(env.DB as D1Database);

  await db.update(editions).set({ isActive: false });
  await db.update(editions).set({ isActive: true }).where(eq(editions.id, editionId));

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/challenges");
}

export async function createChallenge(formData: FormData) {
  await requireAdmin();
  const { env } = await getCloudflareContext({ async: true });
  const db = getDB(env.DB as D1Database);

  const editionId = requireString(formData.get("editionId"), "editionId", 64);
  const day = parseInt(requireString(formData.get("day"), "day", 2), 10);
  const type = requireString(formData.get("type"), "type", 16) as "easy" | "hard" | "sponsored";
  const title = requireString(formData.get("title"), "title", 200);
  const description = requireString(formData.get("description"), "description", 20_000);
  const answer = requireString(formData.get("answer"), "answer", 500);
  const sponsorName = optionalString(formData.get("sponsorName"), 120);
  const sponsorLogo = requireHttpsUrl(formData.get("sponsorLogo"));

  if (isNaN(day) || day < 1 || day > 7) throw new Error("day must be 1-7");
  if (!["easy", "hard", "sponsored"].includes(type)) throw new Error("Invalid type");

  const [edition] = await db.select().from(editions).where(eq(editions.id, editionId)).limit(1);
  if (!edition) throw new Error("Edition not found");

  const unlocksAt = new Date(edition.startDate);
  unlocksAt.setDate(unlocksAt.getDate() + (day - 1));

  await db.insert(challenges).values({
    id: generateId(),
    editionId,
    day,
    type,
    title,
    description,
    answer,
    basePoints: BASE_POINTS[type],
    sponsorName,
    sponsorLogo,
    unlocksAt,
  });

  revalidatePath("/admin");
  revalidatePath("/challenges");
  redirect("/admin");
}

export async function updateChallenge(challengeId: string, formData: FormData) {
  await requireAdmin();
  const { env } = await getCloudflareContext({ async: true });
  const db = getDB(env.DB as D1Database);

  const title = requireString(formData.get("title"), "title", 200);
  const description = requireString(formData.get("description"), "description", 20_000);
  const answer = requireString(formData.get("answer"), "answer", 500);
  const sponsorName = optionalString(formData.get("sponsorName"), 120);
  const sponsorLogo = requireHttpsUrl(formData.get("sponsorLogo"));

  await db
    .update(challenges)
    .set({ title, description, answer, sponsorName, sponsorLogo })
    .where(eq(challenges.id, challengeId));

  revalidatePath("/admin");
  revalidatePath("/challenges");
}

export async function deleteChallenge(challengeId: string) {
  await requireAdmin();
  const { env } = await getCloudflareContext({ async: true });
  const db = getDB(env.DB as D1Database);

  await db.delete(challenges).where(eq(challenges.id, challengeId));

  revalidatePath("/admin");
  revalidatePath("/challenges");
}

export async function deleteEdition(editionId: string) {
  await requireAdmin();
  const { env } = await getCloudflareContext({ async: true });
  const db = getDB(env.DB as D1Database);

  // D1 doesn't support SQL BEGIN TRANSACTION via Drizzle's db.transaction().
  // Delete challenges first (FK references edition), then the edition itself.
  await db.delete(challenges).where(eq(challenges.editionId, editionId));
  await db.delete(editions).where(eq(editions.id, editionId));

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/challenges");
}

export async function updateEdition(editionId: string, formData: FormData) {
  await requireAdmin();
  const { env } = await getCloudflareContext({ async: true });
  const db = getDB(env.DB as D1Database);

  const name = requireString(formData.get("name"), "name", 120);
  const description = optionalString(formData.get("description"), 500);
  const startDate = new Date(requireString(formData.get("startDate"), "startDate", 32));
  const endDate = new Date(requireString(formData.get("endDate"), "endDate", 32));
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) throw new Error("Invalid dates");
  if (endDate <= startDate) throw new Error("endDate must be after startDate");

  await db
    .update(editions)
    .set({ name, slug: slugify(name), description, startDate, endDate })
    .where(eq(editions.id, editionId));

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/challenges");
}

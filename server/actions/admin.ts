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

export async function createEdition(formData: FormData) {
  await requireAdmin();
  const { env } = await getCloudflareContext({ async: true });
  const db = getDB(env.DB as D1Database);

  const name = formData.get("name") as string;
  const startDate = new Date(formData.get("startDate") as string);
  const endDate = new Date(formData.get("endDate") as string);
  const description = (formData.get("description") as string) || null;

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

  const editionId = formData.get("editionId") as string;
  const day = parseInt(formData.get("day") as string, 10);
  const type = formData.get("type") as "easy" | "hard" | "sponsored";
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const answer = formData.get("answer") as string;
  const sponsorName = (formData.get("sponsorName") as string) || null;
  const sponsorLogo = (formData.get("sponsorLogo") as string) || null;

  const [edition] = await db
    .select()
    .from(editions)
    .where(eq(editions.id, editionId))
    .limit(1);
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

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const answer = formData.get("answer") as string;
  const sponsorName = (formData.get("sponsorName") as string) || null;
  const sponsorLogo = (formData.get("sponsorLogo") as string) || null;

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

  // Delete all challenges belonging to this edition first
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

  const name = formData.get("name") as string;
  const startDate = new Date(formData.get("startDate") as string);
  const endDate = new Date(formData.get("endDate") as string);
  const description = (formData.get("description") as string) || null;

  await db
    .update(editions)
    .set({ name, slug: slugify(name), description, startDate, endDate })
    .where(eq(editions.id, editionId));

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/challenges");
}

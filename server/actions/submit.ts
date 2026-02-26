"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDB } from "@/lib/db";
import { challenges, submissions } from "@/lib/db/schema";
import { calculatePoints } from "@/lib/scoring";
import { generateId } from "@/lib/utils";
import { createAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";

export type SubmitResult =
  | { success: true; correct: true; pointsAwarded: number; attemptNumber: number }
  | { success: true; correct: false; attemptNumber: number }
  | { success: false; error: string };

export async function submitAnswer(
  challengeId: string,
  rawAnswer: string
): Promise<SubmitResult> {
  const auth = await createAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { success: false, error: "not_authenticated" };
  const userId = session.user.id;

  const { env } = await getCloudflareContext({ async: true });
  const db = getDB(env.DB as D1Database);

  const [challenge] = await db
    .select()
    .from(challenges)
    .where(eq(challenges.id, challengeId))
    .limit(1);

  if (!challenge) return { success: false, error: "challenge_not_found" };

  const now = new Date();
  if (now < challenge.unlocksAt) return { success: false, error: "challenge_locked" };

  const prior = await db
    .select()
    .from(submissions)
    .where(
      and(
        eq(submissions.userId, userId),
        eq(submissions.challengeId, challengeId),
        eq(submissions.isCorrect, true)
      )
    )
    .limit(1);

  if (prior.length > 0) return { success: false, error: "already_solved" };

  const attempts = await db
    .select()
    .from(submissions)
    .where(and(eq(submissions.userId, userId), eq(submissions.challengeId, challengeId)));

  const attemptNumber = attempts.length + 1;
  const normalise = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
  const isCorrect = normalise(rawAnswer) === normalise(challenge.answer);

  const pointsAwarded = isCorrect
    ? calculatePoints(
        challenge.type as "easy" | "hard" | "sponsored",
        challenge.unlocksAt,
        now
      )
    : 0;

  await db.insert(submissions).values({
    id: generateId(),
    userId,
    challengeId,
    answer: rawAnswer.trim(),
    isCorrect,
    attemptNumber,
    pointsAwarded,
    submittedAt: now,
  });

  if (isCorrect) return { success: true, correct: true, pointsAwarded, attemptNumber };
  return { success: true, correct: false, attemptNumber };
}

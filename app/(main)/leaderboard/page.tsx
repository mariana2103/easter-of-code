import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDB } from "@/lib/db";
import { challenges, editions, submissions, users } from "@/lib/db/schema";
import { eq, desc, max, sum, count, and, inArray } from "drizzle-orm";
import { createAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { LeaderboardTable, type LeaderboardEntry } from "@/components/leaderboard-table";
import { EditionSelector } from "@/components/edition-selector";

export const revalidate = 30;

interface Props {
  searchParams: Promise<{ edition?: string }>;
}

export default async function LeaderboardPage({ searchParams }: Props) {
  const { edition: editionSlug } = await searchParams;

  const { env } = await getCloudflareContext({ async: true });
  const db = getDB(env.DB as D1Database);

  const auth = await createAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  const currentUserId = session?.user.id;

  // All editions for selector
  const allEditions = await db
    .select()
    .from(editions)
    .orderBy(editions.startDate);

  // Resolve edition
  let edition = editionSlug
    ? allEditions.find((e) => e.slug === editionSlug) ?? null
    : allEditions.find((e) => e.isActive) ?? null;

  if (!edition && allEditions.length > 0) {
    edition = allEditions[allEditions.length - 1];
  }

  if (!edition) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center font-mono text-light-grey text-sm">
        {"// no_active_edition"}
      </div>
    );
  }

  // Get challenge IDs for this edition to filter submissions
  const editionChallenges = await db
    .select({ id: challenges.id })
    .from(challenges)
    .where(eq(challenges.editionId, edition.id));

  const challengeIds = editionChallenges.map((c) => c.id);

  // Aggregate correct submissions per user for this edition
  const rows =
    challengeIds.length > 0
      ? await db
          .select({
            userId: submissions.userId,
            totalPoints: sum(submissions.pointsAwarded),
            solvedCount: count(submissions.id),
            lastCorrectAt: max(submissions.submittedAt),
          })
          .from(submissions)
          .where(
            and(
              eq(submissions.isCorrect, true),
              inArray(submissions.challengeId, challengeIds)
            )
          )
          .groupBy(submissions.userId)
          .orderBy(
            desc(sum(submissions.pointsAwarded)),
            max(submissions.submittedAt)
          )
      : [];

  // Fetch usernames
  const userMap = new Map<string, string>();
  if (rows.length > 0) {
    const userRecords = await db
      .select({ id: users.id, name: users.name, username: users.username })
      .from(users);
    for (const u of userRecords) {
      userMap.set(u.id, u.name ?? u.username);
    }
  }

  const entries: LeaderboardEntry[] = rows.map((row, i) => ({
    rank: i + 1,
    userId: row.userId,
    username: userMap.get(row.userId) ?? "anonymous",
    totalPoints: Number(row.totalPoints ?? 0),
    solvedCount: Number(row.solvedCount),
    lastCorrectAt: row.lastCorrectAt ? new Date(row.lastCorrectAt) : null,
  }));

  const currentUserEntry = currentUserId
    ? entries.find((e) => e.userId === currentUserId)
    : undefined;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <div>
          <div className="font-mono text-xs text-light-grey mb-1">{"// leaderboard"}</div>
          <h1 className="font-mono text-2xl text-zinc-200">
            <span className="text-light-grey">{"{"}</span>
            <span className="text-hacker-green"> leaderboard </span>
            <span className="text-light-grey">{"}"}</span>
          </h1>
          <div className="font-mono text-xs text-light-grey mt-1">
            {`/* ${edition.name} — ${entries.length} participant${entries.length !== 1 ? "s" : ""} — updates every 30s */`}
          </div>
        </div>

        {/* Edition selector */}
        <EditionSelector
          editions={allEditions}
          currentId={edition.id}
          basePath="/leaderboard"
        />
      </div>

      {/* Current user callout */}
      {currentUserEntry && (
        <div className="border border-purple-500/20 bg-purple-500/5 rounded-lg px-4 py-3 font-mono text-sm flex items-center justify-between">
          <span className="text-main-grey">
            {"// you: "}
            <span className="text-zinc-300">@{currentUserEntry.username}</span>
          </span>
          <div className="flex items-center gap-4 text-xs">
            <span>
              <span className="text-light-grey">rank: </span>
              <span className="text-hacker-purple">#{currentUserEntry.rank}</span>
            </span>
            <span>
              <span className="text-light-grey">pts: </span>
              <span className="text-hacker-green">
                {currentUserEntry.totalPoints.toLocaleString()}
              </span>
            </span>
          </div>
        </div>
      )}

      {/* Table */}
      <LeaderboardTable entries={entries} currentUserId={currentUserId} />
    </div>
  );
}

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDB } from "@/lib/db";
import { challenges, editions, submissions } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { createAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { ChallengeCard } from "@/components/challenge-card";
import { EditionSelector } from "@/components/edition-selector";
interface Props {
  searchParams: Promise<{ edition?: string }>;
}

export default async function ChallengesPage({ searchParams }: Props) {
  const { edition: editionSlug } = await searchParams;

  const { env } = await getCloudflareContext({ async: true });
  const db = getDB(env.DB as D1Database);

  // Current user
  const auth = await createAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user.id;

  // All editions for the selector
  const allEditions = await db
    .select()
    .from(editions)
    .orderBy(editions.startDate);

  // Resolve which edition to display
  let edition = editionSlug
    ? allEditions.find((e) => e.slug === editionSlug) ?? null
    : allEditions.find((e) => e.isActive) ?? null;

  // Fallback: most recent edition
  if (!edition && allEditions.length > 0) {
    edition = allEditions[allEditions.length - 1];
  }

  if (!edition) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center font-mono">
        <div className="text-light-grey text-sm">{"// no_active_edition"}</div>
        <div className="text-light-grey text-xs mt-2">check back soon</div>
      </div>
    );
  }

  // All challenges for this edition
  const allChallenges = await db
    .select()
    .from(challenges)
    .where(eq(challenges.editionId, edition.id))
    .orderBy(challenges.day, challenges.type);

  // User's submissions for these challenges
  let solvedIds = new Set<string>();
  let attemptedIds = new Set<string>();

  if (userId && allChallenges.length > 0) {
    const challengeIds = allChallenges.map((c) => c.id);
    const userSubs = await db
      .select()
      .from(submissions)
      .where(
        and(
          eq(submissions.userId, userId),
          inArray(submissions.challengeId, challengeIds)
        )
      );
    for (const sub of userSubs) {
      if (sub.isCorrect) solvedIds.add(sub.challengeId);
      else attemptedIds.add(sub.challengeId);
    }
  }

  // Index by day + type
  type ChallengeType = "easy" | "hard" | "sponsored";
  const byDayType: Record<number, Record<string, typeof allChallenges[0]>> = {};
  for (const c of allChallenges) {
    if (!byDayType[c.day]) byDayType[c.day] = {};
    byDayType[c.day][c.type] = c;
  }

  const now = new Date();
  const hasStarted = now >= edition.startDate;
  const hasEnded = now > edition.endDate;
  const isViewingPast = !edition.isActive;

  const solvedCount = solvedIds.size;
  const unlockedCount = allChallenges.filter((c) => now >= c.unlocksAt).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div>
          <div className="font-mono text-xs text-light-grey mb-1">{"// challenges"}</div>
          <h1 className="font-mono text-2xl text-zinc-200">
            <span className="text-light-grey">{"{"}</span>
            <span className="text-hacker-green"> challenges </span>
            <span className="text-light-grey">{"}"}</span>
          </h1>
          <div className="font-mono text-xs text-light-grey mt-1">
            {hasEnded
              ? `/* ${edition.name} — ended ${edition.endDate.toLocaleDateString()} */`
              : hasStarted
              ? `/* ${edition.name} — day ${Math.min(7, Math.ceil((now.getTime() - edition.startDate.getTime()) / 86400000))} of 7 */`
              : `/* ${edition.name} — starts ${edition.startDate.toLocaleDateString()} */`}
          </div>
        </div>

        {/* Edition selector */}
        <EditionSelector
          editions={allEditions}
          currentId={edition.id}
          basePath="/challenges"
        />
      </div>

      {/* Stats bar */}
      {userId && !isViewingPast && (
        <div className="flex gap-6 border border-zinc-800 bg-zinc-900/30 rounded-lg px-4 py-3 font-mono text-xs">
          <span>
            <span className="text-light-grey">solved: </span>
            <span className="text-hacker-green">{solvedCount}</span>
            <span className="text-light-grey">/{unlockedCount}</span>
          </span>
          <span>
            <span className="text-light-grey">attempted: </span>
            <span className="text-amber-400">{attemptedIds.size}</span>
          </span>
          <span>
            <span className="text-light-grey">remaining: </span>
            <span className="text-main-grey">{unlockedCount - solvedCount}</span>
          </span>
        </div>
      )}

      {/* Past edition notice */}
      {isViewingPast && (
        <div className="border border-zinc-800/40 bg-zinc-900/20 rounded-lg px-4 py-3 font-mono text-xs text-light-grey">
          {"/* viewing archived edition — submissions closed */"}
        </div>
      )}

      {/* Day grid */}
      {Array.from({ length: 7 }, (_, i) => i + 1).map((day) => {
        const dayMap = byDayType[day] ?? {};
        const dayUnlockDate = new Date(edition!.startDate);
        dayUnlockDate.setDate(dayUnlockDate.getDate() + (day - 1));
        const dayLocked = !hasStarted || now < dayUnlockDate;
        const types: ChallengeType[] = ["easy", "hard", "sponsored"];

        return (
          <section key={day} className="space-y-3">
            {/* Day header */}
            <div className="flex items-center gap-3">
              <div
                className={`font-mono text-sm ${
                  dayLocked ? "text-light-grey" : "text-main-grey"
                }`}
              >
                <span className="text-light-grey">{"// "}</span>
                <span>day_</span>
                <span className={dayLocked ? "text-light-grey" : "text-hacker-purple"}>
                  {day}
                </span>
              </div>
              {dayLocked ? (
                <span className="font-mono text-xs text-light-grey">locked</span>
              ) : (
                <span className="font-mono text-xs text-light-grey">
                  {dayUnlockDate.toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              )}
              {/* Progress dots for this day */}
              {!dayLocked && (
                <div className="flex gap-1 ml-auto">
                  {types.map((t) => {
                    const c = dayMap[t];
                    if (!c) return null;
                    const solved = solvedIds.has(c.id);
                    const attempted = !solved && attemptedIds.has(c.id);
                    return (
                      <span
                        key={t}
                        className={
                          solved
                            ? "text-hacker-green text-[10px]"
                            : attempted
                            ? "text-amber-400 text-[10px]"
                            : "text-light-grey text-[10px]"
                        }
                        title={`${t}: ${solved ? "solved" : attempted ? "attempted" : "open"}`}
                      >
                        ●
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Challenge slots: easy + hard side by side, sponsored below */}
            <div className="space-y-2">
              {/* Easy + Hard row */}
              <div className="grid sm:grid-cols-2 gap-2">
                {(["easy", "hard"] as ChallengeType[]).map((t) => {
                  const c = dayMap[t];
                  if (c) {
                    return (
                      <ChallengeCard
                        key={c.id}
                        challenge={c}
                        solved={solvedIds.has(c.id)}
                        attempted={attemptedIds.has(c.id)}
                      />
                    );
                  }
                  // Placeholder
                  return (
                    <div
                      key={t}
                      className="border border-zinc-800/30 rounded-lg p-4 bg-zinc-950/20 opacity-25 select-none"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`font-mono text-xs border rounded px-2 py-0.5 ${
                            t === "easy"
                              ? "text-green-800 border-green-900/30 bg-green-950/20"
                              : "text-red-800 border-red-900/30 bg-red-950/20"
                          }`}
                        >
                          {`<${t} />`}
                        </span>
                        <span className="font-mono text-xs text-zinc-800">—</span>
                      </div>
                      <div className="font-mono text-xs text-zinc-800 mb-1">
                        {`// day_${day}`}
                      </div>
                      <div className="font-mono text-xs text-zinc-800">not published</div>
                    </div>
                  );
                })}
              </div>

              {/* Sponsored row (only if it exists or is published) */}
              {dayMap["sponsored"] && (
                <div className="sm:w-1/2">
                  <ChallengeCard
                    challenge={dayMap["sponsored"]}
                    solved={solvedIds.has(dayMap["sponsored"].id)}
                    attempted={attemptedIds.has(dayMap["sponsored"].id)}
                  />
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

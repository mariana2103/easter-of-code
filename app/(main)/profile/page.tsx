import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDB } from "@/lib/db";
import { challenges, editions, submissions } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { createAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const auth = await createAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { env } = await getCloudflareContext({ async: true });
  const db = getDB(env.DB as D1Database);
  const userId = session.user.id;

  // Active edition
  const [edition] = await db
    .select()
    .from(editions)
    .where(eq(editions.isActive, true))
    .limit(1);

  // All user submissions with challenge info
  const subs = edition
    ? await db
        .select({
          submission: submissions,
          challenge: challenges,
        })
        .from(submissions)
        .innerJoin(challenges, eq(submissions.challengeId, challenges.id))
        .where(
          and(
            eq(submissions.userId, userId),
            eq(challenges.editionId, edition.id)
          )
        )
        .orderBy(desc(submissions.submittedAt))
    : [];

  const totalPoints = subs
    .filter((r) => r.submission.isCorrect)
    .reduce((acc, r) => acc + r.submission.pointsAwarded, 0);

  const solvedCount = new Set(
    subs.filter((r) => r.submission.isCorrect).map((r) => r.submission.challengeId)
  ).size;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="font-mono text-xs text-light-grey mb-1">{"// profile"}</div>
        <h1 className="font-mono text-2xl text-zinc-200">
          <span className="text-main-grey">@</span>
          <span className="text-hacker-green">{session.user.name ?? session.user.email}</span>
        </h1>
        <div className="font-mono text-xs text-main-grey mt-1">{session.user.email}</div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "total_pts", value: totalPoints.toLocaleString(), color: "text-hacker-green" },
          { label: "solved", value: String(solvedCount), color: "text-hacker-purple" },
          { label: "attempts", value: String(subs.length), color: "text-main-grey" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="border border-zinc-800 rounded-lg p-4 bg-zinc-950 text-center"
          >
            <div className={`font-mono text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="font-mono text-xs text-light-grey mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Submission history */}
      <div>
        <div className="font-mono text-xs text-main-grey mb-3">{"// submission_history"}</div>
        {subs.length === 0 ? (
          <div className="border border-zinc-800 rounded-lg p-8 text-center font-mono text-xs text-light-grey">
            {"// no submissions yet"}
          </div>
        ) : (
          <div className="border border-zinc-800 rounded-lg overflow-hidden">
            <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-3 px-4 py-2 border-b border-zinc-800 bg-zinc-900/50 font-mono text-xs text-light-grey">
              {["day", "challenge", "type", "result", "pts"].map((h) => (
                <div key={h}>{h}</div>
              ))}
            </div>
            {subs.map(({ submission, challenge }) => (
              <div
                key={submission.id}
                className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-3 px-4 py-2.5 border-b border-zinc-800/50 last:border-0 font-mono text-xs hover:bg-zinc-900/20 transition-colors"
              >
                <div className="text-light-grey">{challenge.day}</div>
                <div className="text-main-grey truncate">{challenge.title}</div>
                <div
                  className={
                    challenge.type === "easy"
                      ? "text-green-500"
                      : challenge.type === "hard"
                      ? "text-red-500"
                      : "text-amber-500"
                  }
                >
                  {challenge.type[0]}
                </div>
                <div>
                  {submission.isCorrect ? (
                    <span className="text-hacker-green">✓</span>
                  ) : (
                    <span className="text-red-400">✗</span>
                  )}
                </div>
                <div className="text-main-grey">
                  {submission.isCorrect ? (
                    <span className="text-hacker-green">+{submission.pointsAwarded}</span>
                  ) : (
                    <span className="text-light-grey">—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

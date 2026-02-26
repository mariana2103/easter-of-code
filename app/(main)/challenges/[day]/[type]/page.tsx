import { notFound } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDB } from "@/lib/db";
import { challenges, editions, submissions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { SubmissionForm } from "@/components/submission-form";
import Link from "next/link";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ day: string; type: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { day, type } = await params;
  return { title: `Day ${day} · ${type} — Easter of code` };
}

export default async function ChallengePage({ params }: Props) {
  const { day: dayStr, type } = await params;
  const day = parseInt(dayStr, 10);

  if (isNaN(day) || day < 1 || day > 7 || !["easy", "hard", "sponsored"].includes(type)) {
    notFound();
  }

  const { env } = await getCloudflareContext({ async: true });
  const db = getDB(env.DB as D1Database);

  // Get active edition
  const [edition] = await db
    .select()
    .from(editions)
    .where(eq(editions.isActive, true))
    .limit(1);

  if (!edition) notFound();

  // Get challenge
  const [challenge] = await db
    .select()
    .from(challenges)
    .where(
      and(
        eq(challenges.editionId, edition.id),
        eq(challenges.day, day),
        eq(challenges.type, type as "easy" | "hard" | "sponsored")
      )
    )
    .limit(1);

  if (!challenge) notFound();

  // Check if locked
  const now = new Date();
  const isLocked = now < challenge.unlocksAt;

  // Current user + submission state
  const auth = await createAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user.id;

  let alreadySolved = false;
  let attemptCount = 0;

  if (userId) {
    const userSubs = await db
      .select()
      .from(submissions)
      .where(
        and(eq(submissions.userId, userId), eq(submissions.challengeId, challenge.id))
      );
    attemptCount = userSubs.length;
    alreadySolved = userSubs.some((s) => s.isCorrect);
  }

  const typeColors = {
    easy: { badge: "text-hacker-green border-green-500/30 bg-green-500/10", accent: "text-hacker-green" },
    hard: { badge: "text-red-400 border-red-500/30 bg-red-500/10", accent: "text-red-400" },
    sponsored: { badge: "text-amber-400 border-amber-500/30 bg-amber-500/10", accent: "text-amber-400" },
  };
  const colors = typeColors[type as keyof typeof typeColors];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Breadcrumb */}
      <nav className="font-mono text-xs text-light-grey flex items-center gap-2">
        <Link href="/challenges" className="hover:text-main-grey transition-colors">challenges</Link>
        <span>/</span>
        <span>day_{day}</span>
        <span>/</span>
        <span className={colors.accent}>{type}</span>
      </nav>

      {/* Challenge header */}
      <div className="space-y-3">
        {/* Sponsor line */}
        {challenge.sponsorName && (
          <div className="flex items-center gap-3">
            {challenge.sponsorLogo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={challenge.sponsorLogo}
                alt={challenge.sponsorName}
                className="h-6 object-contain opacity-70"
              />
            )}
            <span className="font-mono text-xs text-light-grey">
              {`/* sponsored by ${challenge.sponsorName} */`}
            </span>
          </div>
        )}

        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="font-mono text-xs text-light-grey">{`// day_${day}`}</div>
            <h1 className="font-mono text-xl font-semibold text-zinc-100">
              {challenge.title}
            </h1>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className={`font-mono text-xs border rounded px-2 py-0.5 ${colors.badge}`}>
              {`<${type} />`}
            </span>
            <div className="font-mono text-xs text-light-grey">
              <span className="text-main-grey">{challenge.basePoints}</span>
              <span className="text-light-grey"> base</span>
              <span className="text-light-grey"> + bonus</span>
            </div>
          </div>
        </div>
      </div>

      {isLocked ? (
        <div className="border border-zinc-800 rounded-lg p-8 text-center font-mono space-y-2">
          <div className="text-light-grey text-2xl">🔒</div>
          <div className="text-light-grey text-sm">{"// challenge_locked"}</div>
          <div className="text-light-grey text-xs">
            unlocks{" "}
            {challenge.unlocksAt.toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      ) : (
        <>
          {/* Description */}
          <div className="border border-zinc-800 rounded-lg bg-zinc-950">
            {/* Editor header */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-800 bg-zinc-900/50 rounded-t-lg">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/40" />
                <div className="w-3 h-3 rounded-full bg-amber-500/40" />
                <div className="w-3 h-3 rounded-full bg-green-500/40" />
              </div>
              <span className="font-mono text-xs text-light-grey ml-2">
                {`day_${day}_${type}.md`}
              </span>
            </div>
            {/* Content */}
            <div className="p-6">
              <div
                className="challenge-body"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(challenge.description) }}
              />
            </div>
          </div>

          {/* Submission */}
          <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-950 space-y-3">
            <div className="font-mono text-xs text-main-grey">{"// your_answer"}</div>
            {session ? (
              <SubmissionForm
                challengeId={challenge.id}
                alreadySolved={alreadySolved}
                initialAttempts={attemptCount}
              />
            ) : (
              <div className="font-mono text-xs text-light-grey">
                {"// "}
                <Link href="/login" className="text-hacker-green hover:text-green-300 transition-colors">
                  login
                </Link>
                {" to submit"}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Minimal markdown renderer — just enough for challenge descriptions
// (In production, use a library like marked or remark)
function renderMarkdown(md: string): string {
  return md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>[\s\S]*?<\/li>)/g, "<ul>$1</ul>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[hup])(.+)$/gm, "<p>$1</p>")
    .replace(/<p><\/p>/g, "");
}

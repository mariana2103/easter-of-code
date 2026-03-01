import { notFound } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDB } from "@/lib/db";
import { challenges, editions, submissions } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { createAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { SubmissionForm } from "@/components/submission-form";
import Link from "next/link";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ day: string; type: string }>;
  searchParams: Promise<{ edition?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { day, type } = await params;
  return { title: `Day ${day} · ${type} — Easter of code` };
}

export default async function ChallengePage({ params, searchParams }: Props) {
  const { day: dayStr, type } = await params;
  const { edition: editionSlug } = await searchParams;
  const day = parseInt(dayStr, 10);

  if (isNaN(day) || day < 1 || day > 7 || !["easy", "hard", "sponsored"].includes(type)) {
    notFound();
  }

  const { env } = await getCloudflareContext({ async: true });
  const db = getDB(env.DB as D1Database);

  // Resolve edition: by slug → active → most recent
  const allEditions = await db.select().from(editions).orderBy(desc(editions.startDate));
  const edition = editionSlug
    ? (allEditions.find((e) => e.slug === editionSlug) ?? null)
    : (allEditions.find((e) => e.isActive) ?? allEditions[0] ?? null);

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

// Minimal markdown renderer — line-by-line to correctly handle code fences and lists
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inlineFormat(s: string): string {
  return s
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

function renderMarkdown(md: string): string {
  if (!md) return "";
  const lines = md.split("\n");
  const out: string[] = [];
  let inFence = false;
  const fence: string[] = [];
  let inList = false;

  for (const line of lines) {
    if (line.startsWith("```")) {
      if (!inFence) {
        if (inList) { out.push("</ul>"); inList = false; }
        inFence = true;
        fence.length = 0;
      } else {
        inFence = false;
        out.push(`<pre><code>${escapeHtml(fence.join("\n"))}</code></pre>`);
      }
      continue;
    }
    if (inFence) { fence.push(line); continue; }

    if (!line.startsWith("- ") && inList) { out.push("</ul>"); inList = false; }

    if (line === "") {
      out.push("");
    } else if (line.startsWith("### ")) {
      out.push(`<h3>${inlineFormat(escapeHtml(line.slice(4)))}</h3>`);
    } else if (line.startsWith("## ")) {
      out.push(`<h2>${inlineFormat(escapeHtml(line.slice(3)))}</h2>`);
    } else if (line.startsWith("# ")) {
      out.push(`<h1>${inlineFormat(escapeHtml(line.slice(2)))}</h1>`);
    } else if (line.startsWith("- ")) {
      if (!inList) { out.push("<ul>"); inList = true; }
      out.push(`<li>${inlineFormat(escapeHtml(line.slice(2)))}</li>`);
    } else {
      out.push(`<p>${inlineFormat(escapeHtml(line))}</p>`);
    }
  }

  if (inList) out.push("</ul>");
  if (inFence) out.push(`<pre><code>${escapeHtml(fence.join("\n"))}</code></pre>`);

  return out.join("\n");
}

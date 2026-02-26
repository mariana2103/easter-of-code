import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Challenge } from "@/lib/db/schema";

interface ChallengeCardProps {
  challenge: Challenge;
  solved?: boolean;
  attempted?: boolean;
}

const typeStyles = {
  easy: {
    badge: "text-hacker-green border-green-500/30 bg-green-500/10",
    glow: "hover:border-green-500/40 hover:shadow-green-500/5",
    accent: "text-hacker-green",
  },
  hard: {
    badge: "text-red-400 border-red-500/30 bg-red-500/10",
    glow: "hover:border-red-500/40 hover:shadow-red-500/5",
    accent: "text-red-400",
  },
  sponsored: {
    badge: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    glow: "hover:border-amber-500/40 hover:shadow-amber-500/5",
    accent: "text-amber-400",
  },
};

function formatUnlockDelta(unlocksAt: Date, now: Date): string {
  const diffMs = unlocksAt.getTime() - now.getTime();
  if (diffMs <= 0) return "now";
  const diffH = Math.floor(diffMs / 3600000);
  const diffM = Math.floor((diffMs % 3600000) / 60000);
  if (diffH > 48) {
    const days = Math.ceil(diffH / 24);
    return `in ${days}d`;
  }
  if (diffH > 0) return `in ${diffH}h ${diffM}m`;
  return `in ${diffM}m`;
}

export function ChallengeCard({ challenge, solved, attempted }: ChallengeCardProps) {
  const now = new Date();
  const isLocked = now < challenge.unlocksAt;
  const styles = typeStyles[challenge.type];

  if (isLocked) {
    return (
      <div className="border border-zinc-800/40 rounded-lg p-4 bg-zinc-950/40 cursor-not-allowed select-none">
        <div className="flex items-center justify-between mb-3">
          <span
            className={cn(
              "font-mono text-xs border rounded px-2 py-0.5 opacity-30",
              styles.badge
            )}
          >
            {`<${challenge.type} />`}
          </span>
          <span className="font-mono text-xs text-light-grey">
            {formatUnlockDelta(challenge.unlocksAt, now)}
          </span>
        </div>
        <div className="font-mono text-xs text-light-grey mb-1">{`// day_${challenge.day}`}</div>
        <div className="font-mono text-sm text-light-grey">{"???"}</div>
        <div className="mt-3 font-mono text-[10px] text-zinc-800">
          {challenge.unlocksAt.toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    );
  }

  return (
    <Link
      href={`/challenges/${challenge.day}/${challenge.type}`}
      className={cn(
        "block border border-zinc-800 rounded-lg p-4 bg-zinc-950 transition-all duration-200",
        "hover:shadow-lg hover:shadow-black/40",
        styles.glow,
        solved && "border-green-500/30 bg-green-500/5"
      )}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <span className={cn("font-mono text-xs border rounded px-2 py-0.5", styles.badge)}>
          {`<${challenge.type} />`}
        </span>
        {solved ? (
          <span className="font-mono text-xs text-hacker-green">✓ solved</span>
        ) : attempted ? (
          <span className="font-mono text-xs text-amber-400">~ attempted</span>
        ) : (
          <span className="font-mono text-xs text-light-grey">open</span>
        )}
      </div>

      {/* Sponsor line */}
      {challenge.sponsorName && (
        <div className="font-mono text-xs text-light-grey mb-1">
          {`/* sponsored by ${challenge.sponsorName} */`}
        </div>
      )}

      {/* Day + title */}
      <div className="font-mono text-xs text-light-grey mb-1">{`// day_${challenge.day}`}</div>
      <div className={cn("font-mono text-sm font-medium", styles.accent)}>
        {challenge.title}
      </div>

      {/* Points */}
      <div className="mt-3 flex items-center gap-2">
        <span className="font-mono text-xs text-main-grey">
          {challenge.basePoints}
          <span className="text-light-grey"> base_pts</span>
        </span>
        <span className="text-light-grey text-xs">+</span>
        <span className="font-mono text-xs text-light-grey">time_bonus</span>
      </div>
    </Link>
  );
}

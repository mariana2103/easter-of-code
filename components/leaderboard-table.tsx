import { cn } from "@/lib/utils";

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  totalPoints: number;
  solvedCount: number;
  lastCorrectAt: Date | null;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

const rankColors = [
  "text-amber-400",  // 1st
  "text-zinc-300",   // 2nd
  "text-amber-600",  // 3rd
];

export function LeaderboardTable({ entries, currentUserId }: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <div className="font-mono text-sm text-zinc-600 text-center py-12">
        <div className="text-zinc-700 mb-2">{"{ leaderboard: [] }"}</div>
        <div className="text-xs text-zinc-700">{"// no submissions yet"}</div>
      </div>
    );
  }

  return (
    <div className="border border-zinc-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[3rem_1fr_auto_auto_auto] gap-4 px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
        {["rank", "user", "solved", "pts", "last_correct"].map((h) => (
          <div key={h} className="font-mono text-xs text-zinc-600">
            {h}
          </div>
        ))}
      </div>

      {/* Rows */}
      {entries.map((entry) => {
        const isCurrentUser = entry.userId === currentUserId;
        return (
          <div
            key={entry.userId}
            className={cn(
              "grid grid-cols-[3rem_1fr_auto_auto_auto] gap-4 px-4 py-3 border-b border-zinc-800/50 last:border-0 transition-colors",
              isCurrentUser ? "bg-purple-500/5 border-purple-500/10" : "hover:bg-zinc-900/30"
            )}
          >
            {/* Rank */}
            <div
              className={cn(
                "font-mono text-sm font-bold",
                rankColors[entry.rank - 1] ?? "text-zinc-500"
              )}
            >
              #{entry.rank}
            </div>

            {/* Username */}
            <div className="font-mono text-sm">
              <span className="text-zinc-600">@</span>
              <span className={isCurrentUser ? "text-purple-300" : "text-zinc-200"}>
                {entry.username}
              </span>
              {isCurrentUser && (
                <span className="ml-2 text-xs text-purple-500">{"// you"}</span>
              )}
            </div>

            {/* Solved count */}
            <div className="font-mono text-sm text-zinc-400">
              {entry.solvedCount}
              <span className="text-zinc-700 text-xs"> solved</span>
            </div>

            {/* Points */}
            <div className="font-mono text-sm text-green-400 font-semibold">
              {entry.totalPoints.toLocaleString()}
            </div>

            {/* Last correct */}
            <div className="font-mono text-xs text-zinc-600">
              {entry.lastCorrectAt
                ? entry.lastCorrectAt.toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—"}
            </div>
          </div>
        );
      })}
    </div>
  );
}

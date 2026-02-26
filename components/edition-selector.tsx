"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface EditionOption {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

interface EditionSelectorProps {
  editions: EditionOption[];
  currentId: string;
  basePath: "/challenges" | "/leaderboard";
}

export function EditionSelector({ editions, currentId, basePath }: EditionSelectorProps) {
  const router = useRouter();

  if (editions.length <= 1) return null;

  return (
    <div className="flex items-start gap-3 font-mono text-xs">
      <span className="text-light-grey shrink-0 mt-1.5">{"// edition:"}</span>
      <div className="flex flex-wrap gap-1.5">
        {editions.map((ed) => (
          <button
            key={ed.id}
            onClick={() =>
              router.push(
                ed.isActive
                  ? basePath
                  : `${basePath}?edition=${ed.slug}`
              )
            }
            className={cn(
              "px-2.5 py-1 rounded border transition-all duration-150",
              ed.id === currentId
                ? "border-purple-500/40 bg-purple-500/10 text-purple-300"
                : "border-zinc-800 text-light-grey hover:text-zinc-300 hover:border-zinc-600"
            )}
          >
            <span>{ed.name}</span>
            {ed.isActive && (
              <span className="ml-1.5 text-hacker-green text-[10px]">●</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

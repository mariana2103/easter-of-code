"use client";

import { useState, useTransition } from "react";
import { submitAnswer, type SubmitResult } from "@/server/actions/submit";
import { cn } from "@/lib/utils";

interface SubmissionFormProps {
  challengeId: string;
  alreadySolved?: boolean;
  initialAttempts?: number;
}

export function SubmissionForm({
  challengeId,
  alreadySolved = false,
  initialAttempts = 0,
}: SubmissionFormProps) {
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || isPending) return;

    startTransition(async () => {
      const res = await submitAnswer(challengeId, answer);
      setResult(res);
      if (res.success && res.correct) {
        setAnswer("");
      }
    });
  };

  if (alreadySolved || (result?.success && result.correct)) {
    return (
      <div className="border border-green-500/30 bg-green-500/5 rounded-lg p-4 font-mono">
        <div className="text-green-400 text-sm mb-1">{"✓ correct"}</div>
        {result?.success && result.correct && (
          <div className="text-zinc-400 text-xs">
            {"// points_awarded: "}
            <span className="text-purple-400">+{result.pointsAwarded}</span>
            {" // attempt: "}
            <span className="text-zinc-300">#{result.attemptNumber}</span>
          </div>
        )}
        {alreadySolved && !result && (
          <div className="text-zinc-500 text-xs">{"// already_solved"}</div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <label className="font-mono text-xs text-zinc-500">
            {"// submit_answer"}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="your_answer_here"
              disabled={isPending}
              className={cn(
                "flex-1 bg-zinc-900 border rounded px-3 py-2 font-mono text-sm text-zinc-200",
                "placeholder:text-zinc-700 focus:outline-none focus:ring-1 transition-colors",
                result?.success === false && result.error === "wrong"
                  ? "border-red-500/40 focus:ring-red-500/30 focus:border-red-500/60"
                  : result?.success && !result.correct
                  ? "border-red-500/40 focus:ring-red-500/30 focus:border-red-500/60"
                  : "border-zinc-700 focus:ring-green-500/30 focus:border-green-500/40"
              )}
            />
            <button
              type="submit"
              disabled={isPending || !answer.trim()}
              className={cn(
                "font-mono text-sm px-4 py-2 rounded border transition-colors",
                "disabled:opacity-40 disabled:cursor-not-allowed",
                "bg-green-500/10 text-green-400 border-green-500/30",
                "hover:bg-green-500/20 hover:border-green-500/50"
              )}
            >
              {isPending ? "submitting..." : "submit()"}
            </button>
          </div>
        </div>
      </form>

      {/* Feedback */}
      {result && (
        <div
          className={cn(
            "border rounded p-3 font-mono text-xs",
            result.success && !result.correct
              ? "border-red-500/30 bg-red-500/5 text-red-400"
              : !result.success && result.error === "already_solved"
              ? "border-green-500/30 bg-green-500/5 text-green-400"
              : "border-red-500/30 bg-red-500/5 text-red-400"
          )}
        >
          {result.success && !result.correct && (
            <span>
              {"✗ wrong_answer"}
              {" // attempt: "}
              <span className="text-zinc-400">#{result.attemptNumber}</span>
              {" — try again"}
            </span>
          )}
          {!result.success && result.error === "already_solved" && (
            <span className="text-green-400">{"✓ already_solved"}</span>
          )}
          {!result.success && result.error === "not_authenticated" && (
            <span>{"error: not_authenticated — please login"}</span>
          )}
          {!result.success && result.error === "challenge_locked" && (
            <span>{"error: challenge_locked — wait for unlock"}</span>
          )}
          {!result.success &&
            result.error !== "already_solved" &&
            result.error !== "not_authenticated" &&
            result.error !== "challenge_locked" && (
              <span>{`error: ${result.error}`}</span>
            )}
        </div>
      )}

      {/* Attempt counter */}
      {initialAttempts > 0 && !(result?.success && !result.correct) && (
        <div className="font-mono text-xs text-zinc-600">
          {`// previous_attempts: ${initialAttempts}`}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { submitAnswer, type SubmitResult } from "@/server/actions/submit";
import { cn } from "@/lib/utils";

const MAX_ATTEMPTS = 30;

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
  const [attempts, setAttempts] = useState(initialAttempts);

  const maxed = attempts >= MAX_ATTEMPTS;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!answer.trim() || isPending || maxed) return;

    startTransition(async () => {
      const res = await submitAnswer(challengeId, answer);
      setResult(res);
      if (res.success && !res.correct) {
        setAttempts((n) => n + 1);
      }
      if (res.success && res.correct) {
        setAnswer("");
      }
    });
  };

  if (alreadySolved || (result?.success && result.correct)) {
    return (
      <div className="border border-green-500/30 bg-green-500/5 rounded-lg p-4 font-mono">
        <div className="text-hacker-green text-sm mb-1">{"✓ correct"}</div>
        {result?.success && result.correct && (
          <div className="text-main-grey text-xs">
            {"// points_awarded: "}
            <span className="text-hacker-purple">+{result.pointsAwarded}</span>
            {" // attempt: "}
            <span className="text-zinc-300">#{result.attemptNumber}</span>
          </div>
        )}
        {alreadySolved && !result && (
          <div className="text-main-grey text-xs">{"// already_solved"}</div>
        )}
      </div>
    );
  }

  if (maxed) {
    return (
      <div className="border border-red-500/30 bg-red-500/5 rounded-lg p-4 font-mono space-y-1">
        <div className="text-red-400 text-sm">{"✗ max_attempts_reached"}</div>
        <div className="text-light-grey text-xs">{`// ${MAX_ATTEMPTS}/${MAX_ATTEMPTS} attempts used — challenge locked`}</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <label className="font-mono text-xs text-main-grey flex items-center justify-between">
            <span>{"// submit_answer"}</span>
            <span className={cn(
              "text-[10px]",
              attempts >= MAX_ATTEMPTS * 0.8 ? "text-red-400" : "text-light-grey"
            )}>
              {attempts}/{MAX_ATTEMPTS}
            </span>
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
                "placeholder:text-light-grey focus:outline-none focus:ring-1 transition-colors",
                result?.success && !result.correct
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
                "bg-green-500/10 text-hacker-green border-green-500/30",
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
              ? "border-green-500/30 bg-green-500/5 text-hacker-green"
              : "border-red-500/30 bg-red-500/5 text-red-400"
          )}
        >
          {result.success && !result.correct && (
            <span>
              {"✗ wrong_answer"}
              {" // attempt: "}
              <span className="text-main-grey">#{result.attemptNumber}</span>
              {result.attemptNumber >= MAX_ATTEMPTS
                ? " — no attempts remaining"
                : ` — ${MAX_ATTEMPTS - result.attemptNumber} remaining`}
            </span>
          )}
          {!result.success && result.error === "already_solved" && (
            <span className="text-hacker-green">{"✓ already_solved"}</span>
          )}
          {!result.success && result.error === "max_attempts_reached" && (
            <span>{"error: max_attempts_reached — challenge locked"}</span>
          )}
          {!result.success && result.error === "not_authenticated" && (
            <span>{"error: not_authenticated — please login"}</span>
          )}
          {!result.success && result.error === "challenge_locked" && (
            <span>{"error: challenge_locked — wait for unlock"}</span>
          )}
          {!result.success &&
            result.error !== "already_solved" &&
            result.error !== "max_attempts_reached" &&
            result.error !== "not_authenticated" &&
            result.error !== "challenge_locked" && (
              <span>{`error: ${result.error}`}</span>
            )}
        </div>
      )}
    </div>
  );
}

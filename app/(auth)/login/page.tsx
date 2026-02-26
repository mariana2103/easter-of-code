"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      const res = await signIn.email({ email, password });
      if (res.error) {
        setError(res.error.message ?? "login_failed");
      } else {
        router.push("/challenges");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <Link href="/" className="block font-mono text-xs text-light-grey mb-4 hover:text-main-grey">
          {"← Easter of code"}
        </Link>
        <div className="font-mono text-xs text-light-grey">{"// authenticate"}</div>
        <h1 className="font-mono text-xl text-zinc-100">
          <span className="text-hacker-purple">function</span>{" "}
          <span className="text-hacker-green">login</span>
          <span className="text-main-grey">() {"{"}</span>
        </h1>
      </div>

      {/* Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
        <div className="space-y-1">
          <label className="font-mono text-xs text-main-grey">email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@university.edu"
            required
            className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 font-mono text-sm text-zinc-200 placeholder:text-light-grey focus:outline-none focus:ring-1 focus:ring-green-500/30 focus:border-green-500/40 transition-colors"
          />
        </div>

        <div className="space-y-1">
          <label className="font-mono text-xs text-main-grey">password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 font-mono text-sm text-zinc-200 placeholder:text-light-grey focus:outline-none focus:ring-1 focus:ring-green-500/30 focus:border-green-500/40 transition-colors"
          />
        </div>

        {error && (
          <div className="border border-red-500/30 bg-red-500/5 rounded px-3 py-2 font-mono text-xs text-red-400">
            {"✗ error: "}{error}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className={cn(
            "w-full font-mono text-sm py-2.5 rounded border transition-all",
            "bg-green-500/10 text-hacker-green border-green-500/30",
            "hover:bg-green-500/20 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10",
            "disabled:opacity-40 disabled:cursor-not-allowed"
          )}
        >
          {isPending ? "authenticating..." : "login()"}
        </button>
      </form>

      <div className="font-mono text-xs text-light-grey">
        <span className="text-main-grey">{"}"}</span>
        {"  // no account? "}
        <Link href="/register" className="text-hacker-purple hover:text-purple-300 transition-colors">
          register()
        </Link>
      </div>
    </div>
  );
}

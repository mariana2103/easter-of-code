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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
        <Link href="/" className="block font-mono text-xs text-zinc-600 mb-4 hover:text-zinc-400">
          {"← acm{hack}"}
        </Link>
        <div className="font-mono text-xs text-zinc-600">{"// authenticate"}</div>
        <h1 className="font-mono text-xl text-zinc-100">
          <span className="text-purple-400">function</span>{" "}
          <span className="text-green-400">login</span>
          <span className="text-zinc-500">() {"{"}</span>
        </h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="font-mono text-xs text-zinc-500">email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@university.edu"
            required
            className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 font-mono text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-green-500/30 focus:border-green-500/40 transition-colors"
          />
        </div>

        <div className="space-y-1">
          <label className="font-mono text-xs text-zinc-500">password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 font-mono text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-green-500/30 focus:border-green-500/40 transition-colors"
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
            "bg-green-500/10 text-green-400 border-green-500/30",
            "hover:bg-green-500/20 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10",
            "disabled:opacity-40 disabled:cursor-not-allowed"
          )}
        >
          {isPending ? "authenticating..." : "login()"}
        </button>
      </form>

      <div className="font-mono text-xs text-zinc-600">
        <span className="text-zinc-500">{"}"}</span>
        {"  // no account? "}
        <Link href="/register" className="text-purple-400 hover:text-purple-300 transition-colors">
          register()
        </Link>
      </div>
    </div>
  );
}

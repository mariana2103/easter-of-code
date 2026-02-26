"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await signUp.email({
        email,
        password,
        name: username,
      });
      if (res.error) {
        setError(res.error.message ?? "registration_failed");
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
        <div className="font-mono text-xs text-zinc-600">{"// create_account"}</div>
        <h1 className="font-mono text-xl text-zinc-100">
          <span className="text-purple-400">function</span>{" "}
          <span className="text-green-400">register</span>
          <span className="text-zinc-500">() {"{"}</span>
        </h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="font-mono text-xs text-zinc-500">username</label>
          <div className="flex items-center border border-zinc-700 rounded bg-zinc-900 focus-within:ring-1 focus-within:ring-green-500/30 focus-within:border-green-500/40 transition-colors">
            <span className="pl-3 font-mono text-sm text-zinc-600">@</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/[^a-z0-9_-]/g, ""))}
              placeholder="your_handle"
              required
              minLength={2}
              maxLength={20}
              className="flex-1 bg-transparent px-2 py-2 font-mono text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none"
            />
          </div>
        </div>

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
            placeholder="min 8 chars"
            required
            minLength={8}
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
            "bg-purple-500/10 text-purple-400 border-purple-500/30",
            "hover:bg-purple-500/20 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10",
            "disabled:opacity-40 disabled:cursor-not-allowed"
          )}
        >
          {isPending ? "registering..." : "register()"}
        </button>
      </form>

      <div className="font-mono text-xs text-zinc-600">
        <span className="text-zinc-500">{"}"}</span>
        {"  // have account? "}
        <Link href="/login" className="text-green-400 hover:text-green-300 transition-colors">
          login()
        </Link>
      </div>
    </div>
  );
}

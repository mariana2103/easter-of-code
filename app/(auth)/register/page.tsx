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

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      const res = await signUp.email({
        email,
        password,
        name: username,
        username,
      } as Parameters<typeof signUp.email>[0]);
      if (res.error) {
        const msg = res.error.message ?? "";
        if (msg.includes("email") || res.error.status === 422) {
          // Check if it's a duplicate — better-auth returns generic "Failed to create user"
          // Try to give a useful hint based on what's likely conflicting
          setError(msg === "Failed to create user"
            ? "email or username already taken"
            : msg);
        } else {
          setError(msg || "registration_failed");
        }
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
        <div className="font-mono text-xs text-light-grey">{"// create_account"}</div>
        <h1 className="font-mono text-xl text-zinc-100">
          <span className="text-hacker-purple">function</span>{" "}
          <span className="text-hacker-green">register</span>
          <span className="text-main-grey">() {"{"}</span>
        </h1>
      </div>

      {/* Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
        <div className="space-y-1">
          <label className="font-mono text-xs text-main-grey">username</label>
          <div className="flex items-center border border-zinc-700 rounded bg-zinc-900 focus-within:ring-1 focus-within:ring-green-500/30 focus-within:border-green-500/40 transition-colors">
            <span className="pl-3 font-mono text-sm text-light-grey">@</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/[^a-z0-9_-]/g, ""))}
              placeholder="your_handle"
              required
              minLength={2}
              maxLength={20}
              className="flex-1 bg-transparent px-2 py-2 font-mono text-sm text-zinc-200 placeholder:text-light-grey focus:outline-none"
            />
          </div>
        </div>

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
            placeholder="min 8 chars"
            required
            minLength={8}
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
            "bg-purple-500/10 text-hacker-purple border-purple-500/30",
            "hover:bg-purple-500/20 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10",
            "disabled:opacity-40 disabled:cursor-not-allowed"
          )}
        >
          {isPending ? "registering..." : "register()"}
        </button>
      </form>

      <div className="font-mono text-xs text-light-grey">
        <span className="text-main-grey">{"}"}</span>
        {"  // have account? "}
        <Link href="/login" className="text-hacker-green hover:text-green-300 transition-colors">
          login()
        </Link>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { signIn } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type Provider = "github" | "google";

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [active, setActive] = useState<Provider | null>(null);

  const handleOAuth = (provider: Provider) => {
    setActive(provider);
    startTransition(async () => {
      await signIn.social({ provider, callbackURL: "/challenges" });
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <Link href="/" className="block font-mono text-xs text-light-grey mb-4 hover:text-main-grey transition-colors">
          {"← Easter of code"}
        </Link>
        <div className="font-mono text-xs text-light-grey">{"// authenticate"}</div>
        <h1 className="font-mono text-xl text-zinc-100">
          <span className="text-hacker-purple">function</span>{" "}
          <span className="text-hacker-green">sign_in</span>
          <span className="text-main-grey">() {"{"}</span>
        </h1>
        <p className="font-mono text-xs text-light-grey pt-1">
          {"// sign in or register — OAuth only, no passwords stored"}
        </p>
      </div>

      {/* OAuth buttons */}
      <div className="space-y-3">
        {/* GitHub */}
        <button
          onClick={() => handleOAuth("github")}
          disabled={isPending}
          className={cn(
            "w-full flex items-center justify-center gap-3",
            "font-mono text-sm py-2.5 rounded border transition-all",
            "bg-zinc-900 text-zinc-200 border-zinc-700",
            "hover:bg-zinc-800 hover:border-zinc-500 hover:shadow-lg hover:shadow-black/20",
            "disabled:opacity-40 disabled:cursor-not-allowed"
          )}
        >
          <GitHubIcon />
          {isPending && active === "github" ? "redirecting..." : "continue_with_github()"}
        </button>

        {/* Google */}
        <button
          onClick={() => handleOAuth("google")}
          disabled={isPending}
          className={cn(
            "w-full flex items-center justify-center gap-3",
            "font-mono text-sm py-2.5 rounded border transition-all",
            "bg-zinc-900 text-zinc-200 border-zinc-700",
            "hover:bg-zinc-800 hover:border-zinc-500 hover:shadow-lg hover:shadow-black/20",
            "disabled:opacity-40 disabled:cursor-not-allowed"
          )}
        >
          <GoogleIcon />
          {isPending && active === "google" ? "redirecting..." : "continue_with_google()"}
        </button>
      </div>

      <div className="font-mono text-xs text-light-grey">
        <span className="text-main-grey">{"}"}</span>
        {"  // first time? just click above to create an account"}
      </div>
    </div>
  );
}

function GitHubIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

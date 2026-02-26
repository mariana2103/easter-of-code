"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const links = [
  { href: "/challenges", label: "challenges" },
  { href: "/leaderboard", label: "leaderboard" },
  { href: "/profile", label: "profile" },
];

export function Nav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
      <nav className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-mono text-sm">
          <span className="text-main-grey">{"// "}</span>
          <span className="text-hacker-green font-semibold">acm</span>
          <span className="text-main-grey">{"{"}</span>
          <span className="text-hacker-purple">hack</span>
          <span className="text-main-grey">{"}"}</span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "font-mono text-xs px-3 py-1.5 rounded transition-colors",
                pathname.startsWith(l.href)
                  ? "text-hacker-green bg-green-400/10"
                  : "text-main-grey hover:text-zinc-200 hover:bg-zinc-800"
              )}
            >
              {l.label}
            </Link>
          ))}

          {session?.user && (session.user as { role?: string }).role === "admin" && (
            <Link
              href="/admin"
              className={cn(
                "font-mono text-xs px-3 py-1.5 rounded transition-colors",
                pathname.startsWith("/admin")
                  ? "text-amber-400 bg-amber-400/10"
                  : "text-main-grey hover:text-amber-400 hover:bg-zinc-800"
              )}
            >
              admin
            </Link>
          )}
        </div>

        {/* Auth */}
        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              <span className="font-mono text-xs text-main-grey">
                <span className="text-light-grey">@</span>
                <span className="text-zinc-300">{session.user.name ?? session.user.email}</span>
              </span>
              <button
                onClick={() => signOut()}
                className="font-mono text-xs text-main-grey hover:text-zinc-300 transition-colors"
              >
                sign_out()
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="font-mono text-xs text-main-grey hover:text-zinc-200 transition-colors"
              >
                login
              </Link>
              <Link
                href="/register"
                className="font-mono text-xs bg-green-500/10 text-hacker-green border border-green-500/30 px-3 py-1.5 rounded hover:bg-green-500/20 transition-colors"
              >
                register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

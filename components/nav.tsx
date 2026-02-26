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
          <span className="text-zinc-500">{"// "}</span>
          <span className="text-green-400 font-semibold">acm</span>
          <span className="text-zinc-400">{"{"}</span>
          <span className="text-purple-400">hack</span>
          <span className="text-zinc-400">{"}"}</span>
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
                  ? "text-green-400 bg-green-400/10"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
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
                  : "text-zinc-500 hover:text-amber-400 hover:bg-zinc-800"
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
              <span className="font-mono text-xs text-zinc-500">
                <span className="text-zinc-600">@</span>
                <span className="text-zinc-300">{session.user.name ?? session.user.email}</span>
              </span>
              <button
                onClick={() => signOut()}
                className="font-mono text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                sign_out()
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="font-mono text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                login
              </Link>
              <Link
                href="/register"
                className="font-mono text-xs bg-green-500/10 text-green-400 border border-green-500/30 px-3 py-1.5 rounded hover:bg-green-500/20 transition-colors"
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

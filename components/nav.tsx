"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useRef, useState, useEffect } from "react";

const links = [
  { href: "/", label: "home", exact: true },
  { href: "/challenges", label: "challenges" },
  { href: "/leaderboard", label: "leaderboard" },
];

export function Nav() {
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isAdmin = session?.user && (session.user as { role?: string }).role === "admin";

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
      <nav className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-mono text-sm">
          <span className="text-light-grey">{"// "}</span>
          <span className="text-hacker-purple font-semibold">easter</span>
          <span className="text-main-grey">{"{"}</span>
          <span className="text-hacker-green">code</span>
          <span className="text-main-grey">{"}"}</span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "font-mono text-xs px-3 py-1.5 rounded transition-colors",
                (l.exact ? pathname === l.href : pathname.startsWith(l.href))
                  ? "text-hacker-green bg-green-400/10"
                  : "text-main-grey hover:text-zinc-200 hover:bg-zinc-800"
              )}
            >
              {l.label}
            </Link>
          ))}

          {isAdmin && (
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
          {isPending ? null : session?.user ? (
            /* Username button → dropdown */
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="font-mono text-xs flex items-center gap-1 text-main-grey hover:text-zinc-200 transition-colors"
              >
                <span className="text-light-grey">@</span>
                <span className="text-zinc-300">{session.user.name ?? session.user.email}</span>
                <span className={cn("text-light-grey text-[10px] transition-transform duration-150", menuOpen && "rotate-180")}>▾</span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-1.5 min-w-[150px] bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl shadow-black/40 py-1 z-50">
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="block w-full text-left font-mono text-xs text-main-grey hover:text-zinc-200 hover:bg-zinc-800 px-3 py-2 transition-colors"
                  >
                    profile()
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="block w-full text-left font-mono text-xs text-amber-400 hover:bg-zinc-800 px-3 py-2 transition-colors"
                    >
                      admin()
                    </Link>
                  )}
                  <div className="border-t border-zinc-800 mt-1 pt-1">
                    <button
                      onClick={() => { signOut(); setMenuOpen(false); }}
                      className="w-full text-left font-mono text-xs text-hacker-red hover:bg-zinc-800 px-3 py-2 transition-colors"
                    >
                      sign_out()
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="font-mono text-xs bg-green-500/10 text-hacker-green border border-green-500/30 px-3 py-1.5 rounded hover:bg-green-500/20 transition-colors"
            >
              sign_in()
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

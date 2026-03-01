import Link from "next/link";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDB } from "@/lib/db";
import { editions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Countdown } from "@/components/countdown";
import { Nav } from "@/components/nav";
import Footer from "@/components/footer";
import { createAuth } from "@/lib/auth";
import { headers } from "next/headers";

async function getActiveEdition() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = getDB(env.DB as D1Database);
    const [edition] = await db
      .select()
      .from(editions)
      .where(eq(editions.isActive, true))
      .limit(1);
    return edition ?? null;
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const auth = await createAuth();
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null);
  const edition = await getActiveEdition();
  const now = new Date();
  const hasStarted = edition ? now >= edition.startDate : false;
  const hasEnded = edition ? now > edition.endDate : false;
  const status = hasEnded ? "edition_closed" : hasStarted ? "live_now" : "upcoming";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Nav />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-zinc-800/60">
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(90deg, #38bdf8 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Multi-color egg glows */}
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[200px] bg-egg-lilac/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[200px] bg-egg-mint/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 right-1/3 w-[250px] h-[150px] bg-egg-rose/5 rounded-full blur-3xl pointer-events-none" />

        {/* 🥚 Floating Easter Eggs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
          {/* Egg 1 — mint, top right */}
          <div className="egg absolute top-10 right-[8%] w-9 h-11 bg-egg-mint/70 shadow-lg shadow-egg-mint/30"
            style={{ animation: "egg-float 3.2s ease-in-out infinite" }} />
          {/* Egg 2 — rose, mid right */}
          <div className="egg absolute top-1/3 right-[4%] w-7 h-8 bg-egg-rose/60 shadow-lg shadow-egg-rose/30"
            style={{ animation: "egg-sway 4s ease-in-out infinite 0.8s" }} />
          {/* Egg 3 — lemon, bottom right */}
          <div className="egg absolute bottom-16 right-[14%] w-11 h-14 bg-egg-lemon/65 shadow-lg shadow-egg-lemon/30"
            style={{ animation: "egg-drift 3.8s ease-in-out infinite 1.4s" }} />
          {/* Egg 4 — lilac, top left */}
          <div className="egg absolute top-8 left-[6%] w-8 h-10 bg-egg-lilac/65 shadow-lg shadow-egg-lilac/30"
            style={{ animation: "egg-float 4.5s ease-in-out infinite 2s" }} />
          {/* Egg 5 — sky, mid left */}
          <div className="egg absolute top-1/2 left-[2%] w-6 h-7 bg-egg-sky/55 shadow-lg shadow-egg-sky/20"
            style={{ animation: "egg-sway 3.5s ease-in-out infinite 0.4s" }} />
          {/* Egg 6 — petal, bottom left */}
          <div className="egg absolute bottom-10 left-[10%] w-10 h-12 bg-egg-petal/60 shadow-lg shadow-egg-petal/20"
            style={{ animation: "egg-drift 5s ease-in-out infinite 2.5s" }} />
          {/* Egg 7 — lavender, top center-right */}
          <div className="egg absolute top-4 right-[30%] w-5 h-6 bg-egg-lavender/50"
            style={{ animation: "egg-float 4.2s ease-in-out infinite 3s" }} />
          {/* Egg 8 — mint small, lower center-left */}
          <div className="egg absolute bottom-1/3 left-[18%] w-4 h-5 bg-egg-mint/40"
            style={{ animation: "egg-sway 3s ease-in-out infinite 1.8s" }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: title + CTA */}
            <div className="space-y-7">
              {edition && (
                <div className="inline-flex items-center gap-2 border border-green-500/20 bg-green-500/5 rounded-full px-4 py-1.5">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <span className="font-mono text-xs text-hacker-green">
                    {status} {" — "} {edition.name}
                  </span>
                </div>
              )}

              <div className="space-y-2">
                <h1 className="font-mono text-5xl sm:text-6xl font-bold tracking-tight">
                  <span className="text-hacker-purple">easter</span>
                  <span className="text-main-grey">{"{"}</span>
                  <span className="text-hacker-green">code</span>
                  <span className="text-main-grey">{"}"}</span>
                </h1>
                <div className="font-mono text-sm text-main-grey mt-3">
                  <span className="text-hacker-purple">7</span>
                  <span className="text-light-grey"> days · </span>
                  <span className="text-hacker-green">easy</span>
                  <span className="text-light-grey"> + </span>
                  <span className="text-red-400">hard</span>
                  <span className="text-light-grey"> daily · </span>
                  <span className="text-amber-400">sponsored</span>
                  <span className="text-light-grey"> bonus · speed scoring</span>
                </div>
              </div>

              {edition && !hasEnded && (
                <div className="border border-border bg-surface/40 rounded-lg px-5 py-3 inline-block">
                  <Countdown
                    target={hasStarted ? edition.endDate : edition.startDate}
                    label={hasStarted ? "ends in" : "starts in"}
                  />
                </div>
              )}

              <div className="flex items-center gap-3 flex-wrap">
                <Link
                  href="/challenges"
                  className="font-mono text-sm bg-green-500/10 text-hacker-green border border-green-500/30 px-5 py-2.5 rounded hover:bg-green-500/20 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10 transition-all"
                >
                  {"view_challenges()"}
                </Link>
                <Link
                  href="/leaderboard"
                  className="font-mono text-sm text-main-grey border border-zinc-700 px-5 py-2.5 rounded hover:border-zinc-500 hover:text-zinc-200 transition-all"
                >
                  {"leaderboard()"}
                </Link>
                {!session && (
                  <Link
                    href="/login"
                    className="font-mono text-sm text-main-grey hover:text-zinc-300 transition-colors"
                  >
                    {"sign_in →"}
                  </Link>
                )}
              </div>
            </div>

            {/* Right: fake IDE code block */}
            <div className="hidden lg:block">
              <div className="border border-border bg-surface rounded-xl overflow-hidden shadow-2xl shadow-black/60 font-mono text-xs">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-surface-raised/80">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  </div>
                  <span className="text-light-grey text-[11px] ml-2">easter.ts</span>
                  <span className="ml-auto text-light-grey text-[10px]">TypeScript</span>
                </div>
                <div className="p-4 space-y-[3px] leading-5">
                  <div className="flex gap-3"><span className="select-none text-zinc-800 w-4 shrink-0 text-right">1</span><span className="text-light-grey">{"// Easter of code — annual coding challenge"}</span></div>
                  <div className="flex gap-3"><span className="select-none text-zinc-800 w-4 shrink-0 text-right">2</span><span>&nbsp;</span></div>
                  <div className="flex gap-3"><span className="select-none text-zinc-800 w-4 shrink-0 text-right">3</span><span><span className="text-hacker-purple">import</span><span className="text-main-grey"> {"{ compete }"} </span><span className="text-hacker-purple">from</span><span className="text-hacker-green"> &quot;@easter/core&quot;</span><span className="text-light-grey">;</span></span></div>
                  <div className="flex gap-3"><span className="select-none text-zinc-800 w-4 shrink-0 text-right">4</span><span>&nbsp;</span></div>
                  <div className="flex gap-3"><span className="select-none text-zinc-800 w-4 shrink-0 text-right">5</span><span><span className="text-hacker-purple">interface</span><span className="text-cyan-400"> Challenge</span><span className="text-main-grey"> {"{"}</span></span></div>
                  <div className="flex gap-3"><span className="select-none text-zinc-800 w-4 shrink-0 text-right">6</span><span><span className="text-main-grey">{"  type"}</span><span className="text-main-grey">{": "}</span><span className="text-hacker-green">&quot;easy&quot;</span><span className="text-main-grey"> | </span><span className="text-red-400">&quot;hard&quot;</span><span className="text-main-grey"> | </span><span className="text-amber-400">&quot;sponsored&quot;</span><span className="text-main-grey">;</span></span></div>
                  <div className="flex gap-3"><span className="select-none text-zinc-800 w-4 shrink-0 text-right">7</span><span><span className="text-main-grey">{"  pts"}</span><span className="text-main-grey">{": "}</span><span className="text-amber-400">100</span><span className="text-main-grey"> | </span><span className="text-amber-400">300</span><span className="text-main-grey">;</span></span></div>
                  <div className="flex gap-3"><span className="select-none text-zinc-800 w-4 shrink-0 text-right">8</span><span><span className="text-main-grey">{"}"}</span></span></div>
                  <div className="flex gap-3"><span className="select-none text-zinc-800 w-4 shrink-0 text-right">9</span><span>&nbsp;</span></div>
                  <div className="flex gap-3"><span className="select-none text-zinc-800 w-4 shrink-0 text-right">10</span><span className="text-light-grey">{"/**"}</span></div>
                  <div className="flex gap-3"><span className="select-none text-zinc-800 w-4 shrink-0 text-right">11</span><span className="text-light-grey">{" * speed-based scoring: bonus decays over 24h"}</span></div>
                  <div className="flex gap-3"><span className="select-none text-zinc-800 w-4 shrink-0 text-right">12</span><span className="text-light-grey">{" */"}</span></div>
                  <div className="flex gap-3"><span className="select-none text-zinc-800 w-4 shrink-0 text-right">13</span><span><span className="text-hacker-purple">const</span><span className="text-blue-400"> score </span><span className="text-main-grey">= (</span><span className="text-zinc-300">base</span><span className="text-main-grey">, </span><span className="text-zinc-300">hrs</span><span className="text-main-grey">) =&gt;</span></span></div>
                  <div className="flex gap-3"><span className="select-none text-zinc-800 w-4 shrink-0 text-right">14</span><span><span className="text-main-grey">{"  base + "}</span><span className="text-cyan-400">Math</span><span className="text-main-grey">.</span><span className="text-blue-400">floor</span><span className="text-main-grey">{"(base * "}</span><span className="text-cyan-400">Math</span><span className="text-main-grey">.</span><span className="text-blue-400">max</span><span className="text-main-grey">{"(0, 1 - hrs/24))"}</span></span></div>
                  <div className="flex gap-3"><span className="select-none text-zinc-800 w-4 shrink-0 text-right">15</span><span>&nbsp;</span></div>
                  <div className="flex gap-3"><span className="select-none text-zinc-800 w-4 shrink-0 text-right">16</span><span><span className="text-hacker-purple">export default</span><span className="text-main-grey">{" { "}</span><span className="text-blue-400">days</span><span className="text-main-grey">{": "}</span><span className="text-amber-400">7</span><span className="text-main-grey">{", "}</span><span className="text-blue-400">score</span><span className="text-main-grey">{" }"}</span></span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-16 w-full">
        <div className="mb-8">
          <span className="font-mono text-xs text-light-grey">{"// how_it_works"}</span>
          <h2 className="font-mono text-xl text-zinc-300 mt-1">
            <span className="text-light-grey">{"{ "}</span>
            <span className="text-hacker-purple">rules</span>
            <span className="text-light-grey">{" }"}</span>
          </h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { title: "unlock", comment: "// each day at 4pm", desc: "A new easy and hard challenge drops every day. Speed earns bonus points.", color: "text-hacker-green", border: "hover:border-green-500/30" },
            { title: "submit", comment: "// type your answer", desc: "Code the solution locally and find the result. Type your final answer to claim your points.", color: "text-hacker-purple", border: "hover:border-purple-500/30" },
            { title: "score", comment: "// base + time_bonus", desc: "Correct = base pts + time bonus. Bonus decays over 24h from unlock.", color: "text-amber-400", border: "hover:border-amber-500/30" },
          ].map((item) => (
            <div key={item.title} className={`border border-border rounded-lg p-5 bg-surface transition-all duration-200 ${item.border}`}>
              <div className="font-mono text-xs text-light-grey mb-2">{item.comment}</div>
              <div className={`font-mono text-base font-semibold mb-3 ${item.color}`}>{item.title}()</div>
              <p className="font-mono text-xs text-main-grey leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Scoring ───────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 pb-16 w-full">
        <div className="mb-6">
          <span className="font-mono text-xs text-light-grey">{"// scoring_formula"}</span>
          <h2 className="font-mono text-xl text-zinc-300 mt-1">
            <span className="text-light-grey">{"{ "}</span><span className="text-hacker-purple">points</span><span className="text-light-grey">{" }"}</span>
          </h2>
        </div>
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="grid grid-cols-4 gap-4 px-4 py-2 border-b border-border bg-surface/50 font-mono text-xs text-light-grey">
            {["type", "base_pts", "max_bonus", "max_total"].map((h) => <div key={h}>{h}</div>)}
          </div>
          {[
            { type: "easy", base: 100, total: 200, color: "text-hacker-green" },
            { type: "hard", base: 300, total: 600, color: "text-red-400" },
            { type: "sponsored", base: 200, total: 400, color: "text-amber-400" },
          ].map((row) => (
            <div key={row.type} className="grid grid-cols-4 gap-4 px-4 py-3 border-b border-border/50 last:border-0 font-mono text-sm hover:bg-surface/40 transition-colors">
              <div className={row.color}>{`<${row.type} />`}</div>
              <div className="text-zinc-300">{row.base}</div>
              <div className="text-main-grey">+{row.base}</div>
              <div className="text-zinc-200 font-semibold">{row.total}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 border border-border/40 bg-surface/20 rounded px-4 py-3 font-mono text-xs text-light-grey">
          {"// score = base + floor(base * max(0, 1 - hours_elapsed / 24))"}
          <div className="mt-1 text-light-grey">{"// example: hard solved 6h after unlock → 300 + floor(300 * 0.75) = 525 pts"}</div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

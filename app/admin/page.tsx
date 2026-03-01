import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDB } from "@/lib/db";
import { challenges, editions } from "@/lib/db/schema";
import { createAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DeleteChallengeButton } from "@/components/delete-challenge-button";
import { DeleteEditionButton } from "@/components/delete-edition-button";
import {
  createEdition,
  setActiveEdition,
  createChallenge,
  deleteChallenge,
  deleteEdition,
  updateChallenge,
  updateEdition,
} from "@/server/actions/admin";

export default async function AdminPage() {
  const auth = await createAuth();
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || (session.user as { role?: string }).role !== "admin") {
    redirect("/challenges");
  }

  const { env } = await getCloudflareContext({ async: true });
  const db = getDB(env.DB as D1Database);

  const allEditions = await db.select().from(editions).orderBy(editions.createdAt);
  const allChallenges = await db
    .select()
    .from(challenges)
    .orderBy(challenges.day, challenges.type);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <div>
        <div className="font-mono text-xs text-amber-500/60 mb-1">{"// admin_panel"}</div>
        <h1 className="font-mono text-2xl text-zinc-200">
          <span className="text-amber-500">{"{"}</span>
          <span className="text-zinc-200"> admin </span>
          <span className="text-amber-500">{"}"}</span>
        </h1>
      </div>

      {/* ── Editions ────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="font-mono text-xs text-main-grey">{"// editions"}</div>

        {/* Edition list */}
        <div className="border border-zinc-800 rounded-lg overflow-hidden">
          {allEditions.length === 0 ? (
            <div className="p-6 font-mono text-xs text-light-grey text-center">
              {"// no editions yet"}
            </div>
          ) : (
            allEditions.map((ed) => (
              <div key={ed.id} className="border-b border-zinc-800/50 last:border-0">
                <div className="flex items-center justify-between px-4 py-3 hover:bg-zinc-900/20 transition-colors">
                  <div className="space-y-0.5">
                    <div className="font-mono text-sm text-zinc-200 flex items-center gap-2">
                      {ed.name}
                      {ed.isActive && (
                        <span className="font-mono text-xs border border-green-500/30 bg-green-500/10 text-hacker-green rounded px-1.5 py-0.5">
                          active
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-xs text-light-grey">
                      {ed.startDate.toLocaleDateString()} – {ed.endDate.toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!ed.isActive && (
                      <form action={setActiveEdition.bind(null, ed.id)}>
                        <button
                          type="submit"
                          className="font-mono text-xs text-amber-400 border border-amber-500/30 bg-amber-500/5 rounded px-3 py-1.5 hover:bg-amber-500/15 transition-colors"
                        >
                          set_active()
                        </button>
                      </form>
                    )}
                    <form action={deleteEdition.bind(null, ed.id)}>
                      <DeleteEditionButton name={ed.name} />
                    </form>
                  </div>
                </div>
                {/* Inline edit form */}
                <details className="border-t border-zinc-800/40">
                  <summary className="px-4 py-2 font-mono text-xs text-light-grey cursor-pointer hover:text-main-grey transition-colors select-none">
                    {"  edit_edition()"}
                  </summary>
                  <form action={updateEdition.bind(null, ed.id)} className="px-4 pb-4 space-y-3 mt-2">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <FormField label="name" name="name" defaultValue={ed.name} required />
                      <FormField label="description" name="description" defaultValue={ed.description ?? ""} />
                      <FormField
                        label="start_date"
                        name="startDate"
                        type="datetime-local"
                        defaultValue={ed.startDate.toISOString().slice(0, 16)}
                        required
                      />
                      <FormField
                        label="end_date"
                        name="endDate"
                        type="datetime-local"
                        defaultValue={ed.endDate.toISOString().slice(0, 16)}
                        required
                      />
                    </div>
                    <button type="submit" className={adminBtn}>save_edition()</button>
                  </form>
                </details>
              </div>
            ))
          )}
        </div>

        {/* New edition form */}
        <details className="border border-zinc-800 rounded-lg">
          <summary className="px-4 py-3 font-mono text-xs text-main-grey cursor-pointer hover:text-zinc-300 transition-colors select-none">
            {"+ new_edition()"}
          </summary>
          <form action={createEdition} className="px-4 pb-4 space-y-3">
            <div className="grid sm:grid-cols-2 gap-3 mt-3">
              <FormField label="name" name="name" placeholder="ACM Spring Hackathon 2025" required />
              <FormField label="description" name="description" placeholder="optional" />
              <FormField label="start_date" name="startDate" type="datetime-local" required />
              <FormField label="end_date" name="endDate" type="datetime-local" required />
            </div>
            <button type="submit" className={adminBtn}>
              create_edition()
            </button>
          </form>
        </details>
      </section>

      {/* ── Challenges ──────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="font-mono text-xs text-main-grey">{"// challenges"}</div>

        {/* Challenge list */}
        <div className="border border-zinc-800 rounded-lg overflow-hidden">
          {allChallenges.length === 0 ? (
            <div className="p-6 font-mono text-xs text-light-grey text-center">
              {"// no challenges yet"}
            </div>
          ) : (
            allChallenges.map((ch) => {
              const edition = allEditions.find((e) => e.id === ch.editionId);
              return (
                <div
                  key={ch.id}
                  className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50 last:border-0 hover:bg-zinc-900/20 transition-colors gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-xs text-light-grey shrink-0">d{ch.day}</span>
                    <span
                      className={`font-mono text-xs shrink-0 ${
                        ch.type === "easy"
                          ? "text-green-500"
                          : ch.type === "hard"
                          ? "text-red-500"
                          : "text-amber-500"
                      }`}
                    >
                      {`<${ch.type} />`}
                    </span>
                    <span className="font-mono text-sm text-zinc-300 truncate">{ch.title}</span>
                    {ch.sponsorName && (
                      <span className="font-mono text-xs text-light-grey shrink-0">
                        {`/* ${ch.sponsorName} */`}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-xs text-light-grey">
                      {edition?.name.split(" ").pop()}
                    </span>
                    <form action={deleteChallenge.bind(null, ch.id)}>
                      <DeleteChallengeButton title={ch.title} />
                    </form>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* New challenge form */}
        <details className="border border-zinc-800 rounded-lg">
          <summary className="px-4 py-3 font-mono text-xs text-main-grey cursor-pointer hover:text-zinc-300 transition-colors select-none">
            {"+ new_challenge()"}
          </summary>
          <form action={createChallenge} className="px-4 pb-4 space-y-3 mt-3">
            <div className="grid sm:grid-cols-2 gap-3">
              {/* Edition select */}
              <div className="space-y-1">
                <label className="font-mono text-xs text-main-grey">edition</label>
                <select
                  name="editionId"
                  required
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 font-mono text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                >
                  {allEditions.map((ed) => (
                    <option key={ed.id} value={ed.id}>
                      {ed.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Day */}
              <div className="space-y-1">
                <label className="font-mono text-xs text-main-grey">day (1-7)</label>
                <input
                  type="number"
                  name="day"
                  min={1}
                  max={7}
                  required
                  className={inputCls}
                  placeholder="1"
                />
              </div>

              {/* Type */}
              <div className="space-y-1">
                <label className="font-mono text-xs text-main-grey">type</label>
                <select
                  name="type"
                  required
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 font-mono text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                >
                  <option value="easy">easy</option>
                  <option value="hard">hard</option>
                  <option value="sponsored">sponsored</option>
                </select>
              </div>

              <FormField label="title" name="title" placeholder="The Great Fibonacci" required />
              <FormField label="sponsor_name" name="sponsorName" placeholder="Acme Corp (optional)" />
              <FormField label="sponsor_logo_url" name="sponsorLogo" placeholder="https://... (optional)" />
              <FormField label="answer" name="answer" placeholder="exact answer string" required />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="font-mono text-xs text-main-grey">description (markdown)</label>
              <textarea
                name="description"
                required
                rows={8}
                placeholder="## Problem&#10;&#10;Given an array of integers..."
                className={`${inputCls} resize-y`}
              />
            </div>

            <button type="submit" className={adminBtn}>
              create_challenge()
            </button>
          </form>
        </details>
      </section>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────

const inputCls =
  "w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 font-mono text-sm text-zinc-200 placeholder:text-light-grey focus:outline-none focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40 transition-colors";

const adminBtn =
  "font-mono text-sm bg-amber-500/10 text-amber-400 border border-amber-500/30 px-4 py-2 rounded hover:bg-amber-500/20 hover:border-amber-500/50 transition-colors";

function FormField({
  label,
  name,
  placeholder,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1">
      <label className="font-mono text-xs text-main-grey">{label}</label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        className={inputCls}
      />
    </div>
  );
}

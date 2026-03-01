# Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Browser (Client)                             │
│  React 19 (App Router) ── Server Components (RSC)                  │
│  Client Components     ── useSession / signIn.social               │
└──────────────────────────┬──────────────────────────────────────────┘
                           │  HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  Cloudflare Workers (Edge Runtime)                  │
│  Next.js 15 via opennextjs-cloudflare                              │
│  ┌────────────────┐  ┌──────────────────┐  ┌────────────────────┐  │
│  │  App Router    │  │  Server Actions  │  │  /api/auth/[…all] │  │
│  │  (RSC + SSR)   │  │  submit.ts       │  │  Better Auth       │  │
│  └────────────────┘  └──────────────────┘  └────────────────────┘  │
│                              │                        │             │
│                              ▼                        ▼             │
│                   ┌──────────────────────────────────────┐         │
│                   │         Cloudflare D1 (SQLite)       │         │
│                   │  users · sessions · accounts         │         │
│                   │  editions · challenges · submissions │         │
│                   └──────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────────┘
                           │  Error telemetry
                           ▼
              ┌────────────────────────┐
              │   Sentry (edge SDK)    │
              └────────────────────────┘

External OAuth Providers:
  GitHub  ──►  /api/auth/callback/github  ──►  Better Auth  ──►  D1
  Google  ──►  /api/auth/callback/google  ──►  Better Auth  ──►  D1
```

---

## Request Lifecycle

```
User hits /challenges/3/hard
         │
         ▼
[Cloudflare PoP — nearest edge node, ~0ms cold start]
         │
         ▼
[Next.js RSC: app/(main)/challenges/[day]/[type]/page.tsx]
   1. getSession()     → D1 (sessions table)
   2. resolve edition  → D1 (editions table, slug or isActive flag)
   3. fetch challenge  → D1 (challenges table, editionId + day + type)
   4. fetch attempts   → D1 (submissions table, userId + challengeId)
         │
         ▼
[Streamed HTML — zero client JS for data fetching]
         │
         ▼
[SubmissionForm — Client Component, hydrated in browser]
   onClick → Server Action: submitAnswer()
           → session check
           → challenge lock check (unlocksAt server-side)
           → already-solved guard
           → attempt count check  (≤ 30, server-side)
           → rate-limit check     (3s between submissions)
           → normalise + compare answer
           → INSERT submission    (answer text NOT stored)
           → return { correct, pointsAwarded, attempt }
```

---

## Tech Decisions

### Cloudflare Workers over Vercel/Node.js

- **Zero cold starts** — V8 isolates, not containers. No 200–800ms spin-up penalty.
- **Global by default** — 300+ PoPs. D1 read replicas served from same PoP as Worker.
- **Cost** — Free tier handles millions of requests/day.
- **Trade-offs:** No `fs`/`process.env` at runtime, 3 MiB bundle limit, no `BEGIN TRANSACTION` SQL (D1 uses its own JS transaction API — worked around with ordered sequential deletes).

### Next.js App Router + RSC

- **RSC = zero client JS for read paths.** Challenge pages, leaderboard, profile are all server-rendered.
- **Server Actions** replace a traditional REST API. Auth check lives inside the action — impossible to forge without a valid session.
- Client islands: submission form, countdown timer, nav dropdown.

### Cloudflare D1 + Drizzle ORM

- **Native Workers binding** — no TCP, no connection pooling, no extra latency.
- **Drizzle** — fully type-safe, generates raw parameterised SQL, schema-as-code.
- **Indexes:** `challenges(editionId, day)` for grid loads, `submissions(userId, challengeId)` for attempt checks, `submissions(challengeId)` for leaderboard.

### Better Auth (OAuth-only)

- No password storage. Eliminates credential stuffing, bcrypt cost, forgot-password flows.
- GitHub/Google verify email before issuing tokens — safe to trust for admin role assignment.
- CSRF protection built-in (SameSite cookies).

---

## Database Schema

```
┌──────────────┐       ┌──────────────────┐       ┌─────────────────────┐
│    users     │       │    editions      │       │     challenges      │
│──────────────│       │──────────────────│       │─────────────────────│
│ id (PK)      │       │ id (PK)          │       │ id (PK)             │
│ email UNIQUE │       │ name             │◄──────│ editionId (FK)      │
│ username     │       │ slug UNIQUE      │       │ day (1–7)           │
│ name         │       │ description      │       │ type (easy/hard/sp) │
│ image        │       │ startDate        │       │ title               │
│ role         │       │ endDate          │       │ description (md)    │
│ emailVerified│       │ isActive         │       │ answer              │
│ createdAt    │       │ createdAt        │       │ basePoints          │
│ updatedAt    │       └──────────────────┘       │ sponsorName         │
└──────┬───────┘                                  │ sponsorLogo (https) │
       │                                          │ unlocksAt           │
       │         ┌──────────────────┐             └──────────┬──────────┘
       │         │   submissions    │                        │
       │         │──────────────────│                        │
       └────────►│ userId (FK)      │◄───────────────────────┘
                 │ challengeId (FK) │
                 │ isCorrect        │
                 │ attemptNumber    │
                 │ pointsAwarded    │
                 │ submittedAt      │
                 │ answer ("")      │  ← sentinel; raw text never stored
                 └──────────────────┘

Better Auth tables: sessions · accounts · verifications
```

---

## Scoring

```
score = base + floor(base × max(0, 1 − hoursElapsed / 24))
```

| Type | Base | Max Bonus | Max Total |
|---|---|---|---|
| `<easy />` | 100 | +100 | **200** |
| `<hard />` | 300 | +300 | **600** |
| `<sponsored />` | 200 | +200 | **400** |

Bonus decays linearly from unlock time over 24h. After 24h, only base points awarded. Logic lives in `lib/scoring.ts` — pure function, no side effects.

---

## Observability — Sentry

- **Captured:** unhandled exceptions in Server Actions + API routes, edge runtime errors, trace IDs, breadcrumbs, source maps
- **Not captured:** raw answer text, OAuth tokens, session secrets, PII beyond hashed user IDs

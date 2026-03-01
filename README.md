# easter{code}

> Advent-of-Code-style competitive coding platform for university hackathon events. 7 days, daily challenges, speed-based scoring — deployed globally at the edge.

[![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=flat&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-F38020?style=flat&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com)
[![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=flat&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=flat&logo=drizzle&logoColor=black)](https://orm.drizzle.team)
[![Better Auth](https://img.shields.io/badge/Better_Auth-7C3AED?style=flat)](https://better-auth.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

---

## What it does

Each day unlocks one `<easy />` and one `<hard />` challenge (plus optional sponsored challenges). Participants submit answers directly and are ranked by points with a time-decay bonus — first correct answer earns the most.

| Feature | |
|---|---|
| **Multi-edition** | Isolated editions per event (Spring 2025, Fall 2025…) |
| **Speed scoring** | `score = base + floor(base × max(0, 1 − hours/24))` |
| **OAuth-only** | GitHub & Google — no passwords stored |
| **Attempt limiting** | Max 30 attempts, 3s rate limit — server-enforced |
| **Admin panel** | Create/manage editions and challenges inline |
| **Edge-native** | Cloudflare Workers — global, zero cold starts |

---

## Quick start

```bash
# Install
npm install

# Copy env file and fill in values (see docs/DEPLOYMENT.md)
cp .dev.vars.example .dev.vars

# Set up local DB
wrangler d1 create acm-hackathon-db --local
npm run db:migrate:local

# Run
npm run dev
```

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Runtime | Cloudflare Workers | Zero cold starts, global edge, co-located D1 |
| Framework | Next.js 15 (App Router + RSC) | Server components, Server Actions, streaming |
| Database | Cloudflare D1 + Drizzle ORM | Native Workers integration, type-safe queries |
| Auth | Better Auth (OAuth) | No password storage, CSRF protection built-in |
| Styling | Tailwind CSS v4 | Monospace dark theme, custom hacker palette |

---

## Docs

- [**Architecture**](docs/ARCHITECTURE.md) — request lifecycle, diagrams, tech decisions, DB schema
- [**Security**](docs/SECURITY.md) — OWASP Top 10 coverage, HTTP headers, abuse prevention
- [**Deployment**](docs/DEPLOYMENT.md) — environment variables, Cloudflare secrets, OAuth setup

---

## Database commands

```bash
npm run db:generate          # Regenerate migration SQL from schema changes
npm run db:migrate:local     # Apply to local D1
npm run db:migrate:remote    # Apply to production D1
npm run db:studio            # Open Drizzle Studio
```

---

<div align="center">
Built for <strong>ACM{hack}</strong> · Deployed on Cloudflare Workers · © 2025
</div>

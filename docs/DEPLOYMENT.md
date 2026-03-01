# Deployment

## Prerequisites

- Node.js ≥ 20
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) — `npm i -g wrangler`
- A Cloudflare account (free tier)
- Separate GitHub and Google OAuth Apps for dev and prod

## Deploy to Cloudflare Workers

```bash
# Build for Workers
npm run build:cloudflare

# Preview locally (Miniflare — full Worker simulation)
npm run preview

# Deploy
npm run deploy
```

## OAuth Callback URLs

Register in your GitHub/Google OAuth App settings:

| Provider | Production | Development |
|---|---|---|
| GitHub | `https://your-domain.workers.dev/api/auth/callback/github` | `http://localhost:3000/api/auth/callback/github` |
| Google | `https://your-domain.workers.dev/api/auth/callback/google` | `http://localhost:3000/api/auth/callback/google` |

> Use **separate OAuth Apps** for dev and production. Never share secrets between environments.

## Environment Variables

### Production — Cloudflare Secrets

Set via `wrangler secret put <NAME>`. Never put these in `wrangler.jsonc`.

```bash
wrangler secret put BETTER_AUTH_SECRET    # 32+ char random string: openssl rand -base64 32
wrangler secret put BETTER_AUTH_URL       # https://your-domain.workers.dev
wrangler secret put ADMIN_EMAIL           # email that gets admin role on first sign-in
wrangler secret put GITHUB_CLIENT_ID
wrangler secret put GITHUB_CLIENT_SECRET
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET
wrangler secret put SENTRY_DSN
```

### Local Dev — `.dev.vars`

```env
BETTER_AUTH_SECRET=any-local-secret-at-least-32-chars
BETTER_AUTH_URL=http://localhost:3000
ADMIN_EMAIL=you@example.com
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
SENTRY_DSN=
```

`.dev.vars` is gitignored. Never commit secrets.

## Database Migrations

```bash
npm run db:generate          # Regenerate SQL from schema changes
npm run db:migrate:local     # Apply to local D1
npm run db:migrate:remote    # Apply to production D1
```

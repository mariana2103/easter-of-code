# Security

This platform targets CS students expected to probe it.

## Authentication & Authorization

| Measure | Detail |
|---|---|
| **OAuth-only** | No passwords stored. Credentials never touch our servers. |
| **Provider-verified email** | GitHub/Google verify email — safe to trust for admin role assignment. |
| **Server-side session on every action** | Every Server Action calls `auth.api.getSession()` before touching data. Role from session, never client input. |
| **8-hour sessions** | Short window limits stolen-cookie blast radius. |
| **CSRF protection** | Built into Better Auth's session cookie flow (SameSite, CSRF tokens). |
| **Dev-only localhost CORS** | `trustedOrigins` includes localhost only when `NODE_ENV === "development"`. |

## Input Validation & Injection Prevention

| Measure | Detail |
|---|---|
| **Parameterised queries** | Drizzle ORM — no string concatenation, no SQL injection surface. |
| **Admin form validation** | `requireString()` / `requireHttpsUrl()` enforce type, presence, max length before any DB write. |
| **Sponsor logo URL scheme** | `new URL(value).protocol === "https:"` — `javascript:` and `data:` rejected. |
| **String length caps** | `title ≤ 200`, `description ≤ 20 000`, `answer ≤ 500` chars. |
| **Enum validation** | `day` rejected outside 1–7; `type` rejected if not `easy \| hard \| sponsored`. |
| **Date ordering** | `endDate ≤ startDate` throws before INSERT. |

## Submission Abuse Prevention

| Measure | Detail |
|---|---|
| **Max 30 attempts** | Server-enforced in `submitAnswer()`. Client UI mirrors state but is never trusted. |
| **3-second rate limit** | Requests within 3s are rejected with `rate_limited`. |
| **Answer text not persisted** | Compared in memory, then discarded. DB stores empty sentinel — a breach exposes attempt counts, not what users tried. |
| **Challenge lock check** | `unlocksAt` verified server-side on every submission. Client countdown is cosmetic. |
| **Already-solved guard** | Further submissions after a correct answer return `already_solved` without touching scoring. |

## HTTP Security Headers

Applied to every response via `next.config.ts`:

```
X-Frame-Options:           DENY
X-Content-Type-Options:    nosniff
Referrer-Policy:           strict-origin-when-cross-origin
Permissions-Policy:        camera=(), microphone=(), geolocation=()
Content-Security-Policy:
  default-src 'self';
  style-src 'self' 'unsafe-inline';
  script-src 'self' 'unsafe-inline';   ← 'unsafe-eval' stripped in production
  img-src 'self' data: https:;
  font-src 'self';
  connect-src 'self';
  frame-ancestors 'none'
```

## OWASP Top 10

| # | Category | Status | How |
|---|---|---|---|
| A01 | Broken Access Control | ✅ | Server-side session + role on every action |
| A02 | Cryptographic Failures | ✅ | No passwords; OAuth tokens at providers; HTTPS-only cookies |
| A03 | Injection | ✅ | Drizzle parameterised queries; URL scheme check; length caps |
| A04 | Insecure Design | ✅ | Server-enforced limits; rate limiting; date/enum validation |
| A05 | Security Misconfiguration | ✅ | Localhost CORS dev-only; security headers on all routes |
| A06 | Vulnerable Components | ✅ | Minimal dependency surface; no direct SQL driver exposure |
| A07 | XSS | ✅ | CSP; React escapes by default; markdown renderer escapes HTML |
| A08 | Software & Data Integrity | ✅ | Server Actions replace API endpoints — no client-controlled server logic |
| A09 | Security Logging & Monitoring | ✅ | Sentry captures all unhandled errors with full context |
| A10 | SSRF | ✅ | Sponsor logo validated `https://` only; no server-side URL fetching |

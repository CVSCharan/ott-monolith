<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# StreamForge – Gemini Assistant & Developer Guidelines

> **Source of Truth:** [AGENTS.md](./AGENTS.md) · [docs/00-README.md](./docs/00-README.md) · [docs/implementation-tracker.md](./docs/implementation-tracker.md)  
> All work in this repository must strictly adhere to the standards outlined in [AGENTS.md](./AGENTS.md).

---

## 1. Core Architecture & Tech Stack

| Layer | Technology | Key Constraint |
|---|---|---|
| **Framework** | Next.js 16 (App Router), React 19, TypeScript | Server Components by default; `src/` directory layout ([ADR-0010](./docs/adr/0010-repo-layout-src-directory.md)). |
| **Styling** | Tailwind CSS v4 (`@tailwindcss/postcss`) | Top-level `@theme static` tokens only; no raw inline colors/sizes in `.tsx`. |
| **Database** | PostgreSQL 16 + Prisma 6 | `directUrl` for migrations; partial indexes and GIN indexes in raw migration SQL. |
| **Auth** | Custom JWT + Argon2id | `httpOnly` cookies; refresh cookie scoped to `Path=/api/auth` with family rotation. |
| **Storage** | MinIO (local dev) / Cloudflare R2 (prod) | Buckets NOT publicly accessible; all HLS served via manifest proxy route handler. |
| **Transcoding** | Docker Node worker + FFmpeg | Bounded 50 GB host scratch disk (`worker-scratch`); allowlisted egress; magic-byte check. |
| **Job Queue** | pg-boss (Postgres-backed) | Worker uses `DATABASE_DIRECT_URL`; 2h timeout; heartbeat monitoring. |
| **Rate Limiting** | Redis token bucket in `src/proxy.ts` | 100/min general; 10/15m IP + 5/15m account on auth; fail-closed for auth endpoints. |
| **Video Engine** | `hls.js` + bespoke React controls | Custom player chrome; quality picker with locked plan tiers; dynamically imported. |

---

## 2. Strict Module Boundary Rules (ESLint Enforced)

Code is partitioned into four explicit module layers:
```
src/modules/<name>/index.ts    ← Public API for the module (only allowed export)
src/modules/<name>/dal.ts      ← Data-Access Layer (ONLY file that may import Prisma/db)
src/modules/<name>/service.ts  ← Business logic and validation
src/modules/<name>/actions.ts  ← Server Actions (thin wrappers calling services)
```

1. **Prisma Isolation:** Only `*.dal.ts` may import `@prisma/client` or `@/lib/db`.
2. **Encapsulation:** No module imports another module's internals — import only from `src/modules/<name>/index.ts`.
3. **Layer Hierarchy:** Server Actions and Route Handlers call service functions, never DAL directly.
4. **Client Boundaries:** Client components (`'use client'`) must NEVER import from `src/modules/*/` — use REST API or Server Actions.

---

## 3. Critical Developer Constraints (The DON'Ts)

- ❌ **No raw colors / sizes / spacing in `.tsx`:** Reference `--color-*`, `--space-*`, `--radius-*` tokens from `docs/design/design-tokens.md`.
- ❌ **No unguarded Server Actions:** First line must be `await requireSession()` or `await requireAdmin()`.
- ❌ **No secrets in client code:** Never use `NEXT_PUBLIC_*` for signing secrets, database credentials, or private keys.
- ❌ **No `console.log` in production code:** Use `src/lib/logger.ts` (structured Pino logging with PII redaction).
- ❌ **No FFmpeg invoked from Next.js serverless functions:** FFmpeg runs strictly inside the Docker worker container.
- ❌ **No unrecorded architectural changes:** If an implementation requires modifying an earlier decision, document it in `docs/decision-register.md`.

---

## 4. Essential Commands

```bash
# Development Environment
docker compose up          # Boot Postgres, MinIO, Redis, and pg-boss worker
npm run dev                # Next.js web application (port 3000)
npm run worker             # Transcode + stats worker (separate process)

# Database & Migrations
npm run db:generate        # prisma generate
npm run db:migrate:dev     # prisma migrate dev (DATABASE_DIRECT_URL)
npm run db:seed            # Seed plans, admin account, and sample titles

# Quality Gates (Mandatory CI checks)
npm run lint               # ESLint with module boundary enforcement
npm run type-check         # TypeScript type check (tsc --noEmit)
npm test                   # Vitest unit test suite
npm run test:e2e           # Playwright end-to-end matrix tests
npm run test:a11y          # axe-core accessibility audit
```

For the complete contributor contract, consult [AGENTS.md](./AGENTS.md).

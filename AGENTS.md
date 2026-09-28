<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# StreamForge – Agent & Contributor Contract

> **Read this file before touching any code.**  
> **Docs are the source of truth.** Update the relevant doc in the same PR/commit as any code change.  
> Tags: **MVP** = Phase 1 · **P2** = Phase 2 · **Later** = Phase 3+. Never implement P2 in MVP milestones.

---

## Stack

| Layer | Technology | Key constraint |
|-------|-----------|---------------|
| Framework | Next.js 16, App Router, TypeScript | Read `node_modules/next/dist/docs/` before any RSC/routing decision |
| Styling | Tailwind CSS v4 | `@theme` block only — no raw values in `.tsx`; reference tokens |
| Database | PostgreSQL 16 + Prisma 6 | `directUrl` for migrations; never `migrate deploy` in Vercel build step |
| Auth | Custom JWT, httpOnly cookies | No `Authorization` header for browser clients; no `NEXT_PUBLIC_*` secrets |
| Storage | MinIO (local) / Cloudflare R2 (prod) | Bucket NOT publicly accessible in demo; all HLS via proxy Route Handler |
| Video | FFmpeg Docker worker + hls.js player | Worker is always-on VPS; never Vercel Functions (60 s limit) |
| Queue | pg-boss (Postgres-backed) | Worker uses `DATABASE_DIRECT_URL`; Neon pooler cannot run migrations |
| Search | Postgres FTS + pg_trgm | Extensions in first migration; GIN/BRIN indexes hand-edited in SQL |
| Rate limiting | Redis token bucket in `src/proxy.ts` | No in-memory / Edge rate limiting |

---

## Essential Commands

```bash
# Local dev
docker compose up          # Postgres · MinIO · Redis · pg-boss worker
npm run dev                # Next.js (port 3000)
npm run worker             # Transcode + stats worker (separate process)

# Database
npm run db:generate        # prisma generate
npm run db:migrate:dev     # prisma migrate dev  (DATABASE_DIRECT_URL)
npm run db:migrate:deploy  # prisma migrate deploy  (CI/CD only — not Vercel build)
npm run db:seed            # Seed plans + admin account + sample content
npm run seed:media         # Download BBB HLS to local MinIO (see doc 18)
npm run demo:reset         # Wipe + re-seed (dev/staging only — blocked in prod)

# Tests & quality
npm test                   # Vitest unit tests
npm run test:e2e           # Playwright integration tests
npm run test:a11y          # axe-core a11y audit
npm run lint               # ESLint (module boundary rules enforced — CI gate)
npm run type-check         # tsc --noEmit
npm run db:orphan-check    # Every US in doc 03 + endpoint in doc 06 must appear in traceability
```

---

## Module Boundary Rules (ESLint enforced — CI gate)

```
src/modules/<name>/index.ts    ← public API for the module
src/modules/<name>/dal.ts      ← Data-access layer (only file that may import Prisma/db)
src/modules/<name>/service.ts  ← Business logic
src/modules/<name>/actions.ts  ← Server Actions (thin adapters, call service only)
```

1. Only `*.dal.ts` may import `@prisma/client` or `src/lib/db`
2. No module imports another module's internals — only its `index.ts`
3. Server Actions call service functions, never DAL directly
4. Route Handlers call service functions, never DAL directly
5. Client components (`'use client'`) must NOT import from `src/modules/*/` — use REST API or Server Actions

---

## Docs Are the Source of Truth

- Every code change that adds, removes, or changes behaviour must update the relevant doc in the **same commit**.
- If doc conflicts with code, the **doc wins** — fix the code.
- Breaking changes (API shape, DB schema, env var) require a new ADR in `docs/adr/`.
- After Milestone 0 (walking skeleton), docs are tagged `v1`. Changes go through `docs/decision-register.md`.

---

## Definition of Done

- [ ] All acceptance criteria in doc 03 checked
- [ ] `docs/traceability.md` updated (Surface, Status, Milestone columns)
- [ ] Relevant doc updated in same commit
- [ ] Unit test for any non-trivial business logic
- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes (includes module boundary rules)
- [ ] axe-core passes for any new UI (`npm run test:a11y`)
- [ ] Reviewed against NFRs in doc 03 (performance, security, DB, responsiveness)

---

## DON'Ts

| Rule | Why |
|------|-----|
| ❌ No raw colors / sizes / spacing in `.tsx` | Reference `--color-*` / `--space-*` / `--radius-*` tokens |
| ❌ No deep cross-module imports | Use the module's public `index.ts` |
| ❌ No unguarded Server Actions | First line must be `await requireSession()` or `await requireAdmin()` |
| ❌ No secrets in client code | Never `NEXT_PUBLIC_*` for signing keys, DB URLs, API secrets |
| ❌ No `prisma migrate deploy` in Vercel build | CI/CD pipeline only (see doc 14) |
| ❌ No offset pagination on large tables | Cursor-based only (see doc 06) |
| ❌ No direct DB writes without a migration | Every schema change needs `migrate dev --create-only` + hand-edit SQL |
| ❌ No P2 features in MVP milestones | Tag it, document in decision register, ship in correct milestone |
| ❌ No `console.log` in production code | Use `src/lib/logger.ts` (Pino) |
| ❌ No hardcoded admin credentials | Admin password from `SEED_ADMIN_PASSWORD` env var only |
| ❌ No inline styles except `style={{ '--token': value }}` | Only permitted pattern for dynamic CSS custom property overrides |
| ❌ No FFmpeg invoked from Next.js server | FFmpeg runs only in the Docker worker (security + resource isolation) |

---

## Quick Reference: Which Layer Does What

| Need | Use |
|------|-----|
| Fetch public cached content | RSC + `fetch()` with `next: { revalidate: N }` |
| Fetch per-profile content | RSC `async` with `requireSession()` → service call |
| Mutate from a form | Server Action in `src/modules/*/actions.ts` |
| Mutate from a client event (player, beacon) | `POST /api/…` Route Handler |
| Check session in middleware | `proxy.ts` JWT decode (no DB hit) |
| Check session in a Server Component | `requireSession()` from `src/modules/auth` |
| Rate limit | Redis token bucket in `proxy.ts` |
| Enqueue background job | `pgBoss.send(jobName, data)` from a Route Handler or Server Action |
| Log an error | `logger.error({ err }, 'description')` (Pino) |

---

## Environment Variables

Required vars documented in `docs/14-devops-and-environments.md`.  
Adding a new var requires: `.env.example` entry + CI secret + doc 14 update, all in the same PR.

---

## Key Decisions (ADR Index)

| ADR | Decision |
|-----|---------|
| 0001 | Next.js 16 App Router monolith |
| 0002 | Prisma 6 as ORM |
| 0003 | HLS + manifest-rewrite HMAC signing |
| 0004 | Custom JWT auth (no third-party) |
| 0005 | MinIO (local) / R2 (prod) |
| 0006 | Postgres FTS + pg_trgm |
| 0007 | Tailwind CSS v4 |
| 0008 | Monolith-first with microservices exit |
| 0009 | Frontend library selections (Radix · Motion · hls.js · TanStack) |
| 0010 | Standardized `src/` directory layout (`src/app`, `src/modules`, `src/lib`, `src/proxy.ts`) |

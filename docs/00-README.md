# OTT Monolith – Documentation Index

> **Status:** Milestones 0–4 Completed (Foundation, Auth, Video Engine, Catalog, Discovery, Subscriptions & Admin CMS) · Production Standards Live · Milestone 5 (Production Hardening & Launch) Core Complete  
> **Last updated:** 2026-09-30  
> **Stack:** Next.js 16 (App Router, TypeScript) · Prisma 7 (@prisma/adapter-pg) · PostgreSQL (Neon Cloud) · MinIO/R2 · hls.js · Redis · Pino

---

## How to read these docs

| Order | When to read |
|-------|-------------|
| 01 → 02 | Start here: understand *why* we're building this and what it covers |
| 03 | Product: user stories and acceptance criteria |
| 04 → 06 | Engineering: architecture, DB, API — read before touching code |
| 07 | Video pipeline: read before implementing upload or playback |
| 08 | Design system: read before writing a single component |
| 09 → 11 | Feature deep-dives: search, auth/billing, security |
| 12 → 13 | Quality: performance, observability, testing |
| 14 → 15 | Operations: infra, DevOps, roadmap |
| adr/ | Decision log — read an ADR before questioning a tech choice |

---

## Document Map

| # | File | Summary |
|---|------|---------|
| 01 | [01-vision-and-scope.md](./01-vision-and-scope.md) | Goals, personas, non-goals, demo vs production delta |
| 02 | [02-feature-benchmark.md](./02-feature-benchmark.md) | Netflix / Prime / Disney+ / Hotstar feature matrix with MVP priority |
| 03 | [03-product-requirements.md](./03-product-requirements.md) | Epics, user stories, acceptance criteria |
| 04 | [04-architecture.md](./04-architecture.md) | Module boundaries, folder structure, request flow, Mermaid diagrams |
| 05 | [05-database-design.md](./05-database-design.md) | ERD, tables, indexes, constraints, migration strategy, seed plan |
| 06 | [06-api-design.md](./06-api-design.md) | REST + Server Actions, shapes, errors, pagination, rate limits |
| 07 | [07-video-pipeline.md](./07-video-pipeline.md) | Upload (S3 multipart) → FFmpeg → HLS/ABR → MinIO → hls.js; HMAC signing; DRM upgrade path |
| 08 | [08-ux-and-design-system.md](./08-ux-and-design-system.md) | Design tokens, component inventory, page wireframes, accessibility, motion |
| 09 | [09-search-and-recommendations.md](./09-search-and-recommendations.md) | FTS, pg_trgm, personalised rails, pgvector path |
| 10 | [10-auth-billing-entitlements.md](./10-auth-billing-entitlements.md) | JWT auth, multi-profile, subscriptions, Razorpay upgrade path |
| 11 | [11-security-and-compliance.md](./11-security-and-compliance.md) | OWASP, signed URLs, RBAC, rate limiting, GDPR basics |
| 12 | [12-performance-and-caching.md](./12-performance-and-caching.md) | ISR/SSR/streaming, image optimisation, Redis/HTTP caching, DB tuning |
| 13 | [13-observability-and-testing.md](./13-observability-and-testing.md) | Logging, metrics, analytics events (QoE), test pyramid, CI |
| 15 | [implementation-tracker.md](./implementation-tracker.md) | Implementation & pipeline tracker: done, in-progress, pending items |
| — | [traceability.md](./traceability.md) | Story → endpoint → tables → route → UI component map |
| — | [future/](./future/) | Phase 2+ design docs (AI pipeline, DRM, live streaming) |

### Architecture Decision Records

| ADR | Title |
|-----|-------|
| [0001](./adr/0001-nextjs-monolith.md) | Next.js 16 App Router monolith |
| [0002](./adr/0002-prisma-orm.md) | Prisma as ORM |
| [0003](./adr/0003-hls-over-mp4.md) | HLS over direct MP4 for streaming |
| [0004](./adr/0004-jwt-custom-auth.md) | Custom JWT auth over third-party providers |
| [0005](./adr/0005-minio-r2-storage.md) | MinIO locally, Cloudflare R2 in production |
| [0006](./adr/0006-postgres-search.md) | Postgres FTS + pg_trgm over Elasticsearch |
| [0007](./adr/0007-tailwind-v4.md) | Tailwind CSS v4 design system |
| [0008](./adr/0008-monolith-to-services.md) | Monolith-first with defined microservices exit |

---

## Tech Stack at a Glance

```
Frontend        Next.js 16 App Router · React 19 · Tailwind CSS v4
Backend         Next.js Route Handlers + Server Actions
Database        PostgreSQL 16 (Neon in prod, Docker in dev)
ORM             Prisma 7 (@prisma/adapter-pg) · prisma.config.ts
Video           FFmpeg · HLS (hls.js) · MinIO/R2
Auth            Custom JWT (access + refresh) stored in httpOnly cookies
Billing         In-app dummy transactions → Razorpay (Phase 2)
Cache           Next.js built-in caching + Redis (Phase 2)
Queue           Postgres-backed job queue (pg-boss) for transcoding + stats aggregation
Search          Postgres FTS + pg_trgm; pgvector (Phase 2)
Rate Limiting   Redis token bucket (Phase 1: docker compose + Upstash; replaces Edge in-memory)
Observability   Pino logging · OpenTelemetry · Core Web Vitals RUM
Testing         Vitest (Unit) · Playwright (E2E & axe-core a11y)
CI/CD           GitHub Actions (lint, type-check, vitest, build) · Husky + lint-staged
Local Dev       docker compose (Postgres + MinIO + Redis + pg-boss worker)
```

---

## Conventions

- **Bold** = must-have for milestone
- _Italic_ = nice-to-have / stretch goal
- `[MVP]` `[P2]` `[Later]` tags used throughout for priority
- All Mermaid diagrams are in docs; rendered by GitHub and the IDE
- ADRs follow the [MADR](https://adr.github.io/madr/) format

---

## Glossary

| Term | Meaning |
|------|---------|
| ABR | Adaptive Bitrate streaming |
| HLS | HTTP Live Streaming (Apple) |
| VOD | Video On Demand |
| CMS | Content Management System (admin panel) |
| QoE | Quality of Experience (playback metrics) |
| Rail | Horizontal scroll row of content cards (Netflix-style) |
| Billboard | Large hero/feature section at top of home page |
| Profile | Sub-user under an account (up to 5) |
| Entitlement | Which content a user is allowed to watch based on plan |
| `min_tier_rank` | Integer 0/1/2 on content; compared against plan.max_tier_rank for access |
| `min_age` | Internal maturity int (0=G, 7=PG, 13=PG-13, 16=R, 18=NC-17); display label mapped at render time |
| pg_trgm | Postgres trigram extension for fuzzy text search |
| HMAC | Hash-based Message Authentication Code; used for HLS URL signing |
| BRIN | Block Range Index; efficient for append-only time-sorted tables |

---

> **Next step for a new developer:** Read [01-vision-and-scope.md](./01-vision-and-scope.md) then [04-architecture.md](./04-architecture.md) — you'll have the full mental model in under 30 minutes.

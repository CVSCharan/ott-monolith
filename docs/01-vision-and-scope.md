# 01 – Vision and Scope

---

## Problem Statement

Building a full-stack OTT (Over-The-Top) video streaming platform from scratch is one of the most technically demanding portfolio projects possible. It touches video engineering, distributed systems, UX, payments, search, and real-time personalisation — all the skills hiring teams care about. This project is designed to demonstrate each of those areas while staying production-credible enough to actually become a startup if needed.

---

## Vision

> **"A Netflix-quality streaming experience built by one team, runnable on a laptop, deployable in 10 minutes — and extensible into a real product."**

---

## Product Name (placeholder)

**StreamForge** _(working title — rename before launch)_

---

## Goals

| # | Goal | Success Metric |
|---|------|---------------|
| G1 | Demonstrate full OTT feature parity with industry leaders at the architecture level | All features in `02-feature-benchmark.md` are addressed |
| G2 | Impressive portfolio / investor demo | Feels like Netflix in 60 seconds of use |
| G3 | Free-tier content (ad-supported or open) + paid subscription tiers | User can watch without paying; must subscribe for premium |
| G4 | Real video pipeline: upload, transcode, stream | A real `.mp4` becomes a watchable HLS stream via admin upload |
| G5 | Multi-profile per account (family sharing) | Up to 5 profiles, kids mode, parental PIN |
| G6 | Admin CMS | Non-developer can add content, schedule releases, curate rails |
| G7 | Startup-ready architecture | Clear documented path from monolith to microservices |

---

## Personas

### P1 – Casual Viewer (Free Tier)
- Browses open/free content without paying
- Expects YouTube-like UX: search, autoplay, history
- On mobile 70% of the time

### P2 – Premium Subscriber
- Pays for HD + premium catalog
- Creates family profiles, sets kids mode for children
- Watches on TV, tablet, laptop — expects cross-device resume

### P3 – Content Admin / Publisher
- Uploads videos, enters metadata, sets release date
- Monitors transcoding status, manages thumbnails and subtitles
- Non-technical; needs a clean CMS dashboard

### P4 – Platform Developer (you)
- Reads `/docs` and understands system in 30 min
- Runs `docker compose up` and is developing in < 5 min
- Confident adding features without fear of breakage (tests)

---

## Scope

### In Scope – MVP (Phase 1)

- [x] Browse home page: billboard hero, genre rails, top-10, new releases
- [x] Title detail page: metadata, trailer autoplay, seasons/episodes
- [x] Video playback: HLS ABR, continue watching, subtitles, quality selector
- [x] HLS access control: **manifest-rewrite signing** — worker rewrites `.ts` segment URLs in variant playlists to include short-lived HMAC query tokens (`?token=...&exp=...`); master `m3u8` served via signed URL (1 h). No CDN signed-cookie required. See [07-video-pipeline.md §HLS Signing](./07-video-pipeline.md#hls-access-control--signing-strategy).
- [x] Search: full-text with autocomplete, genre/rating filters
- [x] Auth: email + password, JWT, refresh tokens, httpOnly cookies
- [x] Multi-profile: up to 5 profiles per account, kids mode, parental PIN
- [x] Watchlist ("My List"), watch history, likes/dislikes
- [x] Free tier (open content, **no login required**; watchlist/history require login — see closed OQ1 below)
- [x] Basic subscription: Free / Standard / Premium (dummy payment — no downloads on any tier)
- [x] Admin CMS: content upload, metadata, transcoding status, rails curation
- [x] Video pipeline: MP4 **multipart** upload via S3 Multipart API → FFmpeg HLS → MinIO/R2 → hls.js player
- [x] Home page: static shell (ISR, public, no session) + streamed per-profile rails (dynamic, auth-gated Suspense segments)

### In Scope – Phase 2

- [ ] Razorpay payment integration (real charges in test mode)
- [ ] Hover preview / autoplay on card hover (Netflix-style)
- [ ] Skip intro / recap detection (timestamp-based initially)
- [ ] Next episode autoplay countdown
- [ ] Recommendations: "Because you watched", trending algorithm
- [ ] Redis caching layer
- [ ] Subtitles upload (SRT → VTT conversion)
- [ ] Multi-audio track support in HLS
- [ ] Basic analytics dashboard in admin (play counts, watch time)
- [ ] Email notifications (welcome, subscription receipt)

### In Scope – Phase 3 / Later

- [ ] pgvector semantic similarity recommendations
- [ ] Live channel (simulated static HLS stream)
- [ ] DRM (Widevine/FairPlay) — architecture documented, not built
- [ ] Mobile PWA / installable
- [ ] CDN integration (Cloudflare, Bunny.net)
- [ ] Microservices extraction (transcoding worker as standalone service)
- [ ] SCTE-35 ad insertion markers

### Out of Scope (this project)

- Real live streaming ingest (RTMP → FFmpeg in production)
- Native iOS / Android apps
- Real DRM implementation (documented as upgrade path only)
- Content licensing / rights management
- Load testing / production SRE

---

## Demo vs Production Delta

| Area | Demo (what we build) | Production upgrade needed |
|------|---------------------|--------------------------|
| Auth | Custom JWT, email/password | Add OAuth (Google, Apple), MFA |
| Payments | Dummy in-app → Razorpay test mode | Razorpay/Stripe production keys, webhooks, invoicing |
| Video storage | MinIO locally, R2 in prod | CDN egress optimisation, multi-region replication |
| DRM | Not built | Widevine/FairPlay via Shaka Player |
| Transcoding | Synchronous FFmpeg in worker | AWS MediaConvert or cloud transcoding farm |
| Search | Postgres FTS + pg_trgm | Elasticsearch / OpenSearch for scale |
| Recommendations | Rule-based + pgvector | ML pipeline (Vertex AI, SageMaker) |
| Rate Limiting | Redis (local Docker / Upstash in prod) | Redis cluster, multi-region replication |
| Caching | Next.js built-in + ISR | Redis cluster, Varnish |
| Secrets | `.env` + Vercel env | HashiCorp Vault / AWS Secrets Manager |
| Database | Single Neon Postgres | Postgres read replicas, PgBouncer |
| Observability | Pino + Vercel Analytics | Datadog / Grafana Cloud full stack |

---

## Assumptions (recorded from discovery)

| # | Assumption |
|---|-----------|
| A1 | VOD only for MVP (movies + series); no real live ingest |
| A2 | Seed content = open-licensed films (Big Buck Bunny, Blender Institute catalog) + user-supplied MP4s via admin |
| A3 | Deployment target: **Vercel** (Next.js app) + **Neon** (Postgres, direct-connection URL required for pg-boss worker — not pooled) + **Cloudflare R2** (object storage, production). Admin CMS upload uses S3-compatible multipart API against R2. |
| A4 | Local dev: `docker compose` runs **5 services**: Postgres, MinIO (S3-compatible), Redis (rate limiting), pg-boss worker container (Node + FFmpeg). FFmpeg is inside the worker Docker image — **not** a host-side dependency. |
| A5 | Billing in Phase 1 = fully dummy (hardcoded plan assignment, no real payment gateway) |
| A6 | No AI/LangChain pipeline in Phase 1 for video content; documented as Phase 2+ |
| A7 | Auth is fully custom JWT — no Auth.js, Clerk, or Auth0 |
| A8 | Tailwind CSS v4 (already in `package.json`) is the styling system |
| A9 | **Free-tier content is fully anonymous** (no login wall). Watchlist, history, ratings, and continue-watching require a logged-in profile. _(Closes OQ1)_ |
| A10 | **Plan limits** (aligned with US-303 / US-703): Free = 480p max / 1 concurrent stream / `free` content only; Standard = 720p max / 2 streams / `free + standard`; Premium = 1080p max / 4 streams / all content. **No download feature on any tier** (deferred to Later). |
| A11 | **Maturity rating scale** — internal canonical values: `G`, `PG`, `PG-13`, `R`, `NC-17`. Regional display mappings: India → `U`, `U/A 7+`, `U/A 13+`, `U/A 16+`, `A`; UK → `U`, `PG`, `12`, `15`, `18`. Mapping applied at render time; stored value is always the internal canonical. |
| A12 | **Home page caching**: the public HTML shell (nav, billboard layout, static rails) is server-rendered with ISR (`revalidate: 3600`). Per-profile dynamic rails (continue watching, My List) are streamed via Suspense after hydration — they are **never** in the ISR cache. |
| A13 | **Redis is MVP**: Required in Milestone 0+ for token-bucket rate limiting in `src/proxy.ts` (10 req/15 min per IP, 5 req/15 min per account on auth endpoints). If Redis is unreachable, auth limits fail-closed (reject with 503) or fallback to atomic Postgres counters to protect against brute-force attacks. |

---

## Open Questions

| # | Status | Question | Owner | Due |
|---|--------|----------|-------|-----|
| OQ1 | ✅ **Closed** | Free-tier content is anonymous (no login). Watchlist/history require login. | — | — |
| OQ2 | Open | Do we need multi-language (i18n) for the UI in Phase 1? | Product | M1 planning |
| OQ3 | Open | Will you supply MP4 files for seed content or use open-licensed ones? | CVS | Before M2 |
| OQ4 | ✅ **Closed** | Free tier is purely freemium (no ads) in Phase 1; ad-insertion deferred to Later. | — | — |
| OQ5 | Open | Region/country content restrictions — needed for demo? | Product | M2 planning |
| OQ6 | ✅ **Closed** | Product name working title: **StreamForge** until launch. | — | — |

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| FFmpeg transcoding is slow on dev machine | High | Medium | FFmpeg runs in Docker worker; async pg-boss queue; dev mode can serve raw MP4 as fallback |
| Neon free tier connection limit (20 pooled) | Medium | High | Worker uses **direct** (non-pooled) Neon URL; app uses pooled. Prisma Accelerate as upgrade path. |
| Vercel function timeout (10–60 s) for large uploads | High | High | Browser uploads directly to R2/MinIO via S3 multipart presigned URLs — no Vercel proxy involved |
| Multipart upload left incomplete (browser closed) | Medium | Medium | R2 lifecycle rule aborts incomplete multiparts after 24 h; worker HEAD-verifies before enqueuing |
| Scope creep from feature richness | High | High | Hard gate on MVP features; P2/Later backlog enforced |
| Video copyright for seed content | Low | High | Only use Creative Commons / open-licensed content (Big Buck Bunny, Blender catalog) |
| HLS signed token leakage (token in URL → logs) | Low | Medium | Short expiry (15 min for segments); tokens scoped to `assetId`; access logs on object storage reviewed |

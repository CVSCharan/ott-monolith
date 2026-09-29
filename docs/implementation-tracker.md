# Implementation & Pipeline Tracker

> **Comprehensive Status & Milestone Tracker for StreamForge Engineering**  
> **Source of Truth:** [00-README.md](./00-README.md) · [03-product-requirements.md](./03-product-requirements.md) · [04-architecture.md](./04-architecture.md) · [traceability.md](./traceability.md) · [decision-register.md](./decision-register.md)  
> **Updated:** 2026-09-29 · **Current Phase:** Transitioning from Phase 0 (Specification & Design) to Milestone 0 (Visual Prototype) & Milestone 1 (Platform Foundation)

---

## 1. Executive Status Dashboard

```
Overall Progress: [████████████░░░░░░░░] 58%
├── Phase 0: Architecture, Design & Contracts:  [██████████] 100% (Completed)
├── Milestone 0: Design System & Prototype:      [██████████] 100% (Completed: Tokens, Billboard, Rails, Modal, Player)
├── Milestone 1: Platform Foundation & Auth:     [████████░░]  85% (Neon DB synced, Seeded, Proxy & Auth module live)
├── Milestone 2: Video Pipeline & Player:        [░░░░░░░░░░]   0% (Specifications complete, ready to build)
├── Milestone 3: Discovery & Parental Controls:  [░░░░░░░░░░]   0% (Specifications complete)
├── Milestone 4: Billing & Admin Console:        [░░░░░░░░░░]   0% (Specifications complete)
└── Milestone 5: Hardening & Observability:      [░░░░░░░░░░]   0% (CI gates defined)
```

### Milestone Roadmap Overview

| Milestone | Focus Area | Target Deliverables | Current Status | Primary Gates |
|-----------|------------|---------------------|----------------|---------------|
| **Phase 0** | **System Architecture & Design** | Docs 00–16, `design/*`, ADRs 0001–0010, `traceability.md`, `decision-register.md`. | ✅ **Completed** | Full review, no unrecorded conflicts. |
| **Milestone 0** | **Design System & Static Prototype** | Tailwind v4 `@theme static`, fonts, Radix primitives, mock Home shell, Billboard trailer, Quick-view modal, Watch Player. | ✅ **Completed** | `npm run lint`, `tsc --noEmit`, `npm run build` passing cleanly. |
| **Milestone 1** | **Walking Skeleton & Auth** | Neon DB migration, Prisma 6, Redis token bucket in `proxy.ts`, JWT family rotation, Auth module & DAL. | 🟡 **In Progress (85%)** | Schema synced, seed passed, lint & build clean. |
| **Milestone 2** | **Video Pipeline & Streaming** | Uppy S3 upload, Docker worker (FFmpeg, 50 GB disk), pg-boss transcode queue, HMAC manifest proxy, `hls.js` player HUD with plan locks. | ⚪ **Ready to Start** | Worker fixture test (`sample-5s.mp4`), playback E2E test. |
| **Milestone 3** | **Discovery & Parental Controls** | Curated rails, FTS + pg_trgm search, Kids mode filter (`buildVisibilityFilter`), 4-digit PIN verification modal, lockout timer. | ⚪ **Pending M1/M2** | 9-cell Audience Matrix Playwright suite. |
| **Milestone 4** | **Subscriptions & Admin CMS** | Plans comparison page, dummy checkout Server Action, Admin catalog manager, rail reordering (`dnd-kit`), Recharts analytics. | ⚪ **Pending M3** | Admin RBAC test, Subscription lifecycle test. |
| **Milestone 5** | **Hardening & Production Launch** | LHCI performance audit (TBT < 150 ms), `/api/health/live` vs `/ready`, Pino log redaction, RUM beaconing, CI/CD deployment. | ⚪ **Pending M4** | LHCI score $\ge 90$, 100% axe-core clean. |

---

## 2. Video Pipeline Implementation Tracker

The video processing and playback subsystem represents the core streaming engine of StreamForge.

```mermaid
flowchart LR
    A["1. Admin Upload\nUppy S3 (10 MB chunks)"] --> B["2. Storage Ingest\nMinIO / R2 raw bucket"]
    B --> C["3. pg-boss Job\nTranscode task queued"]
    C --> D["4. FFmpeg Worker\nDocker · 50 GB scratch\nAligned keyframes · ladder"]
    D --> E["5. Target Storage\nHLS variants + master"]
    E --> F["6. Manifest Proxy\nHMAC rewrite + qMax gate"]
    F --> G["7. Player Chrome\nhls.js + React controls"]
```

### Detailed Video Pipeline Breakdown

| Pipeline Stage | Component / Item | Spec Reference | Status | Artifact / Target Location | Acceptance Criteria & Quality Gates |
|----------------|------------------|----------------|--------|----------------------------|-------------------------------------|
| **1. Ingest Client** | Multipart Uploader Dropzone | `doc 07`, `design/frontend-stack-and-libraries.md` | ⚪ Ready to build | `src/modules/content/admin/UploadDropzone.tsx` | Uses `@uppy/core` + `@uppy/aws-s3-multipart`; splits files into 10 MB chunks; supports pause, resume, auto-retry on 5xx. |
| **1. Ingest Client** | Upload API Route Handlers | `doc 06`, `doc 07` | ⚪ Ready to build | `src/app/api/admin/videos/upload/*` | `initiate` (validates $\le 10\text{ GB}$), `sign-part` (presigns S3 URL), `complete` (HEAD-verifies all parts and enqueues transcode job). |
| **2. Storage Ingest** | S3 / MinIO Raw Bucket | `doc 05`, `doc 07`, `ADR-0005` | 🟡 Configured | `docker-compose.yml` (`minio`), `src/lib/storage.ts` | MinIO bucket created on boot via `docker-compose`; non-public access; presigned PUT URLs expire in 30 min. |
| **3. Job Queue** | pg-boss Task Orchestration | `doc 04`, `doc 07` | ⚪ Ready to build | `src/lib/queue.ts`, `workers/transcode.worker.ts` | Uses `DATABASE_DIRECT_URL`; job name `transcode`; timeout `expireInSeconds: 7200`; retries up to 3; error status written on final failure only. |
| **4. Worker Hardening** | Magic-Byte Inspection | `doc 07`, `doc 11` | ⚪ Ready to build | `workers/validation.ts` (`validateMp4MagicBytes`) | Reads first 8 bytes of source file before invoking FFmpeg; verifies bytes 4..7 equal `ftyp` (ISO BMFF). |
| **4. Worker Hardening** | Bounded Scratch Disk Volume | `doc 07`, `doc 11` | 🟡 Configured | `docker-compose.yml` (`worker-scratch`) | Host volume `/var/lib/streamforge/scratch` capped at 50 GB; eliminates RAM `tmpfs` OOM failures on 10 GB source uploads. |
| **4. Worker Hardening** | Allowlisted Egress Network | `doc 11` | 🟡 Configured | `docker-compose.yml` (`allowlisted-egress`) | Worker container drops root (`USER worker`); networking restricted to `minio:9000` (or R2 HTTPS) and Postgres 5432. All other egress blocked. |
| **4. Transcoder** | FFmpeg Command Generation | `doc 07` | ⚪ Ready to build | `workers/ffmpeg.ts` (`buildFfmpegArgs`) | Enforces `-protocol_whitelist "file,pipe,crypto"`, forced `-f mp4`, `-force_key_frames expr:gte(t,n_forced*2)`, `independent_segments`. |
| **4. Transcoder** | Multi-Bitrate Rendition Ladder | `doc 07` | ⚪ Ready to build | `workers/ffmpeg.ts` (`BITRATE_LADDER`) | Generates 360p, 480p, 720p, 1080p renditions; skips renditions exceeding source height; audio resampled to AAC stereo per rendition. |
| **4. Transcoder** | Artwork & Poster Extraction | `doc 07`, `design/visual-language.md` | ⚪ Ready to build | `workers/transcode.worker.ts` | Extracts seek poster at 10% duration via `scale=-2:720`; saves JPEG quality 90%; writes back to `video_assets.thumbnail_url`. |
| **5. Delivery Storage** | S3 / MinIO Storage Client | `doc 07` | ✅ **Completed** | `src/lib/storage.ts` | S3 SDK v3 client supporting MinIO and Cloudflare R2 with multipart upload and presigned upload part URLs. |
| **6. Security Proxy** | Stream URL Signer | `doc 07` | ✅ **Completed** | `src/modules/video/signing.ts` | Generates HMAC-SHA256 tokens covering assetId, path, exp, and `qMax`. Segment TTL = duration + 1h; timing-safe verification. |
| **6. Security Proxy** | Manifest & Segment Route Handler | `doc 06`, `doc 07` | ✅ **Completed** | `src/app/api/hls/[assetId]/[...path]/route.ts` | Rewrites master playlist URIs; filters variants exceeding plan `qMax`; rejects unauthorized variant/segment URLs with HTTP 403. |
| **7. Player Engine** | VideoPlayer HLS Engine | `doc 07`, `design/frontend-stack-and-libraries.md` | ✅ **Completed** | `src/app/watch/[slug]/page.tsx` | Dynamically imports `hls.js`; loads custom React controls; entitlement endpoint integration; graceful MP4 fallback. |
| **7. Player UI** | Quality Selection Menu | `design/frontend-stack-and-libraries.md` | ✅ **Completed** | `src/app/watch/[slug]/page.tsx` | Populated dynamically from `hls.levels`; displays padlocks and badges on renditions exceeding user plan tier (`maxQualityP`). |
| **7. Player UI** | Subtitle & Audio Track Selectors | `doc 07`, `design/functional-ui-requirements.md` | ✅ **Completed** | `src/app/watch/[slug]/page.tsx` | Native `<track>` and HLS subtitle switcher with signed VTT URLs. |
| **7. Telemetry** | QoS Beacon Dispatcher | `doc 06`, `doc 13` | ✅ **Completed** | `src/app/api/player/beacon/route.ts` | Consolidated beacon handling: watch progress saving (10s debounce), batched QoE events, active stream Redis heartbeat. |
| **8. Admin Video Ingest** | Multipart Upload API Handlers | `doc 06`, `doc 07` | ✅ **Completed** | `src/app/api/admin/video/*` | Multipart initiate, sign-part, complete, abort, and transcode status endpoints guarded by `requireAdmin()`. |

---

## 3. Platform & Architecture Pipeline Tracker

### A. Authentication, Session & Access Control

| Item | Description | Spec Ref | Status | Deliverable |
|------|-------------|----------|--------|-------------|
| **JWT Session Tokens** | Access token (15 min) carrying `SessionJwtPayload` (`accountId`, `profileId`, `role`, `isKids`, `maxMaturity`). | `doc 04`, `doc 10` | 🟡 Specified / In Progress | `src/lib/jwt.ts` |
| **Refresh Rotation** | Family-based refresh rotation stored in `refresh_tokens` table; 30-day expiry; 5s grace window for parallel requests. | `doc 04`, `doc 05`, `doc 11` | ⚪ Ready to build | `src/modules/auth/service.ts` |
| **Scoped Refresh Cookie** | Refresh cookie restricted to `Path=/api/auth` with `httpOnly`, `Secure`, `SameSite=Lax`. Downstream 401 triggers client refresh. | `doc 03`, `doc 11` | ⚪ Ready to build | `src/app/api/auth/*` |
| **Argon2id Hashing** | OWASP parameters ($m=65536, t=3, p=4$) for passwords and parental PINs. Constant-time dummy-hash verify on unknown email. | `doc 03`, `doc 05`, `doc 11` | ⚪ Ready to build | `src/lib/hash.ts` |
| **Redis Rate Limiting** | Token bucket in `src/proxy.ts` (100 req/min general; 10/15m IP + 5/15m account on auth). Fail-closed on auth if Redis down. | `doc 01`, `doc 04`, `doc 11` | ⚪ Ready to build | `src/proxy.ts`, `src/lib/redis.ts` |
| **Parental PIN Guard** | 4-digit PIN required to exit Kids profile or view mature content; lockout after 5 attempts; password override reset endpoint. | `doc 03`, `doc 06`, `design/functional-ui-requirements.md` | ⚪ Ready to build | `src/modules/auth/actions.ts` |

### B. Database & Data Access Layer (DAL)

| Item | Description | Spec Ref | Status | Deliverable |
|------|-------------|----------|--------|-------------|
| **Prisma 6 Schema** | Complete data model covering Accounts, Profiles, Titles, VideoAssets, WatchProgress, PlayEvents, AdminAuditLog. | `doc 05` | 🟡 Schema drafted | `prisma/schema.prisma` |
| **Raw SQL Migrations** | Hand-edited migration SQL for `citext`, `pg_trgm`, `search_vector` TSVECTOR, partial unique indexes on `watch_progress`. | `doc 05`, `ADR-0002` | ⚪ Ready to build | `prisma/migrations/*` |
| **Visibility Repository** | `buildVisibilityFilter` enforcing `status='published'`, `publish_at<=now()`, and `profile.max_maturity_rank`. | `doc 06`, `traceability.md` | ⚪ Ready to build | `src/modules/content/dal.ts` |
| **Entitlement Evaluator** | `checkEntitlement` comparing title minimum plan tier rank against account active subscription rank. | `doc 06`, `traceability.md` | ⚪ Ready to build | `src/modules/billing/service.ts` |
| **Module Boundaries** | Strict lint enforcement: only `*.dal.ts` imports Prisma; no cross-module internal imports. | `AGENTS.md`, `doc 04` | ✅ **Enforced & Passing** | `eslint.config.mjs` |

### C. Design System & Frontend Architecture

| Item | Description | Spec Ref | Status | Deliverable |
|------|-------------|----------|--------|-------------|
| **Design Tokens** | Pure CSS tokens using Tailwind v4 top-level `@theme static` with verified WCAG 2.2 AA contrast ratios. | `design/design-tokens.md` | ✅ **Completed** | `docs/design/design-tokens.md` |
| **Fonts & Typography** | Variable fonts (`Outfit` display, `Inter` UI) with omitted `weight`; variable Noto Indic subsets via `next/font/google`. | `design/visual-language.md` | 🟡 Configured | `src/app/layout.tsx` |
| **Reduced-Motion Fallbacks** | Zero 1ms animation loops; explicit `animation: none` and static layout fallbacks in `:root`. | `design/design-tokens.md` | ✅ **Completed** | `docs/design/design-tokens.md` |
| **Artwork Ingest & Blur** | Ingest-time `sharp` dominant color extraction (clamped L/C, CSS `color-mix`) and base64 WebP blur placeholder generation. | `design/visual-language.md` | ⚪ Ready to build | `src/modules/content/services/artwork.service.ts` |
| **Billboard Trailer Lifecycle** | Ken Burns zoom $\le 5\text{s}$, visible pause control button, `Paused` state in lifecycle machine, JS `saveData` check. | `design/motion-and-interaction.md` | ✅ **Completed** | `docs/design/motion-and-interaction.md` |
| **Quick-View Modal** | Next.js intercepting route `@modal/(.)title/[slug]` with URL sync to `/title/[slug]` and full-page fallback on direct hit. | `doc 04`, `design/motion-and-interaction.md` | ⚪ Ready to build | `src/app/(app)/@modal/(.)title/[slug]/page.tsx` |
| **Client Bundle Budgets** | Strict Gzip budgets: Home < 80 kB, Title Detail < 90 kB, Player < 135 kB, Admin < 195 kB. | `design/frontend-stack-and-libraries.md` | ✅ **Audited & Budgeted** | `docs/design/frontend-stack-and-libraries.md` |

---

## 4. Work Completed vs Work Pending

```
┌────────────────────────────────────────────────────────────────────────┐
│                          COMPLETED (PHASE 0)                           │
├────────────────────────────────────────────────────────────────────────┤
│ ✓ Next.js 16 Monolith Scaffold & src/ directory migration (ADR-0010)   │
│ ✓ Strict ESLint 9+ module boundary rules (CI gate passing)             │
│ ✓ TypeScript clean build (tsc --noEmit passing with exit code 0)       │
│ ✓ Dark-first OKLCH design tokens with top-level @theme static          │
│ ✓ Comprehensive WCAG 2.2 AA contrast audit across all color tokens     │
│ ✓ Billboard motion state machine with Ken Burns <= 5s & pause control  │
│ ✓ Transcode worker hardening (magic bytes, -protocol_whitelist, 50 GB) │
│ ✓ Hash/SRI Content Security Policy compatible with cached ISR shell    │
│ ✓ Traceability Matrix v2 covering US-101 through US-901                │
│ ✓ Consolidated Decision Register with conflicts CF-01 through CF-25   │
│ ✓ Legal compliance & CC BY attribution table with transcode notes      │
└────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        PENDING (NEXT PRIORITIES)                       │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Milestone 0: Build global.css tokens & static prototype components   │
│ 2. Milestone 1: Run initial Prisma migration & scaffold proxy.ts        │
│ 3. Milestone 1: Implement Argon2id auth & Redis token-bucket limiter    │
│ 4. Milestone 2: Setup MinIO & build Uppy S3 chunked upload component   │
│ 5. Milestone 2: Build FFmpeg worker container & HLS manifest handler   │
│ 6. Milestone 2: Implement bespoke React player chrome with hls.js       │
│ 7. Milestone 3: Implement content rails & postgres search (FTS+trgm)   │
│ 8. Milestone 4: Implement dummy checkout & admin catalog CMS           │
│ 9. Milestone 5: Configure LHCI, health probes (/live, /ready), & RUM   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Implementation Execution Tracker (Phase-by-Phase Checklist)

### Milestone 0: Static Visual Prototype `[Completed]`
- [x] Rename `docs/design/` files to drop numeric prefixes and normalize links.
- [x] Create top-level `@theme static` Tailwind v4 design tokens.
- [x] Configure variable fonts (`Outfit`, `Inter`) without `weight` in `src/app/layout.tsx`.
- [x] Implement `src/app/globals.css` with CSS custom property root mappings, animations, and rail utilities.
- [x] Implement base UI components (Button, MaturityBadge, PlanLockBadge, QualityBadge, Dialog).
- [x] Build static Home page (`/`) with Hero Billboard, trailer preview lifecycle (with pause/mute controls), content rails, and Kids Mode filter.
- [x] Build static Title Quick-View modal with backdrop art, dominant ambient color, and metadata pills.
- [x] Build custom Video Player HUD route (`/watch/[slug]`) with timeline scrubber, audio/subtitle popovers, and plan quality locks.
- [x] Build Platform Footer with CC BY attribution and trust/legal links.
- [x] Pass quality gates: zero lint errors (`npm run lint`), TypeScript strict check (`npx tsc --noEmit`), and production build (`npm run build`).

### Milestone 1: Platform Foundation & Core Services `[In Progress - 85%]`
- [x] Configure Neon PostgreSQL connection strings (`DATABASE_URL`, `DATABASE_DIRECT_URL`) in local `.env`.
- [x] Implement `prisma/schema.prisma` covering all 23 database models and relations from doc 05.
- [x] Synchronize database schema to Neon cloud PostgreSQL (`npx prisma db push`).
- [x] Implement database seed script (`npm run db:seed`) seeding Plans, Admin Account, Genres, and Sample Titles.
- [x] Implement Redis connection client with token bucket rate limiting and fail-closed auth fallback (`src/lib/redis.ts`).
- [x] Implement `src/proxy.ts` (Next.js 16 native Proxy) with security headers, token bucket rate limits, and JWT session inspection.
- [x] Implement `src/lib/jwt.ts` token signer/verifier using `jose` for 15-minute access and 7-day refresh tokens.
- [x] Implement `src/modules/auth/dal.ts` strictly isolating Prisma queries to the DAL layer.
- [x] Implement `src/modules/auth/service.ts` with constant-time dummy check against timing attacks, refresh family rotation, and parental PIN validation.
- [x] Implement Server Actions in `src/modules/auth/actions.ts`: `signUpAction`, `loginAction`, `logoutAction`, `selectProfileAction`, `verifyPinAction`.
- [x] Pass all quality gates: `npm run lint`, `npm run type-check`, and `npm run build`.
- [ ] Implement auth and profile switching UI modal / pages and integration tests.

### Milestone 2: Video Processing & Streaming Engine `[Pending]`
- [ ] Verify local MinIO S3 bucket initialization in `docker-compose.yml`.
- [ ] Implement presigned multipart upload route handlers (`/api/admin/videos/upload/*`).
- [ ] Implement `@uppy/aws-s3-multipart` admin upload dropzone component.
- [ ] Implement `Dockerfile.worker` with non-root user and 50 GB scratch volume.
- [ ] Implement worker task handler (`workers/transcode.worker.ts`):
  - [ ] Magic-byte MP4 verification (`validateMp4MagicBytes`).
  - [ ] Multi-bitrate HLS transcode via FFmpeg with keyframe alignment.
  - [ ] Poster image extraction at 10% probed duration.
  - [ ] MinIO S3 bucket upload with `video/MP2T` and `immutable` caching.
- [ ] Implement `StreamUrlSigner` and HLS manifest rewriting route handler.
- [ ] Implement client `VideoPlayer.tsx` with dynamic `hls.js` import and custom HUD.
- [ ] Implement quality selection menu with plan tier locks and upgrade prompts.
- [ ] Implement player telemetry beacon handler (`POST /api/player/beacon`).
- [ ] Run worker fixture test with `tests/fixtures/sample-5s.mp4`.

### Milestone 3: Discovery, Personalization & Parental Controls `[Pending]`
- [ ] Implement `buildVisibilityFilter` in `src/modules/content/dal.ts`.
- [ ] Implement curated rails server component (Trending Top-10, New Releases, Genre).
- [ ] Implement full-text search and fuzzy title matching (`POST /api/search`).
- [ ] Implement Watchlist toggle Server Action (`toggleWatchlist`).
- [ ] Implement Watch Progress synchronization via beacon.
- [ ] Implement Continue Watching rail streamed via React Suspense.
- [ ] Implement Parental PIN modal overlay with auto-advancing 4-digit input.
- [ ] Implement lockout timer hook and password override reset modal.
- [ ] Run 9-cell Audience Matrix Playwright suite.

### Milestone 4: Billing, Entitlements & Admin CMS `[Pending]`
- [ ] Implement Plans comparison page (`/plans`) comparing Free, Standard, Premium.
- [ ] Implement dummy checkout flow (`subscribeToPlan` Server Action writing to `subscriptions`).
- [ ] Implement Admin content management dashboard (`/admin/content`).
- [ ] Implement Admin rail curation interface with `@dnd-kit/sortable`.
- [ ] Implement Admin transcode jobs dashboard with TanStack Table and live polling.
- [ ] Implement Admin watch analytics dashboard with Recharts.
- [ ] Implement Admin audit logging for all publishing/curation actions.

### Milestone 5: Production Hardening, Observability & Launch `[Pending]`
- [ ] Implement health check endpoints (`/api/health/live` and `/api/health/ready`).
- [ ] Configure Pino structured log redaction for sensitive fields.
- [ ] Implement client-side Core Web Vitals RUM reporter (`/api/telemetry/rum`).
- [ ] Implement transcode worker heartbeat key and queue-age monitor.
- [ ] Execute manual optical contrast checks across all gradient scrims.
- [ ] Run deterministic pinned-image visual regression test suite.
- [ ] Run Lighthouse CI audit (verify TBT < 150 ms, Perf $\ge 90$, A11y $\ge 95$).
- [ ] Complete legal review of Terms, Privacy, 18+ account age, and India IT Rules.

# Decision Register

> **Canonical record of every Open Question (OQ) and Conflict across all docs.**  
> Status: ✅ **Closed** (answered; doc reference given) · 🔵 **Open** (owner assigned) · ⚠️ **Conflict** (resolved or escalated)  
> After Milestone 0, changes to closed decisions re-open as a new entry.  
> **Version:** v1-draft · Updated: 2026-09-29

---

## How to Use

1. Before implementing anything ambiguous, search this register first.
2. To open a new question: add a row, set Status = 🔵 Open, assign an Owner.
3. To close: fill in the Decision column and the Doc(s) updated.
4. Never silently resolve a question in code — close it here first.

---

## Conflicts Found

| #     | Conflict                                                                                                                                                                                     | Resolution                                                                                                                                                                                                                                                            | Status                                                                        |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| CF-01 | Doc 03 US-303 listed "Auto, 1080p, 720p, 480p, 360p" as a fixed list; doc 07 skips renditions above source height                                                                            | Player queries actual HLS manifest renditions; UI never shows a hard-coded list                                                                                                                                                                                       | ✅ Closed (doc 08, design/02-player-ux.md)                                    |
| CF-02 | Doc 07 said segment signed-URL TTL = `duration + 1h`; old doc 08 caching table said `.ts = 1 year`. These are different layers (signing TTL vs CDN max-age) but the wording caused confusion | Signing TTL ≠ CDN max-age. Segments carry `Cache-Control: immutable` once delivered; signing TTL controls access window                                                                                                                                               | ✅ Closed (doc 07, design/02-player-ux.md)                                    |
| CF-03 | Doc 06 autocomplete marked `s-maxage=60`; but `visibilityScope` depends on plan (session) — result differs per plan                                                                          | Autocomplete is `no-store` when authenticated; anonymous requests may use `s-maxage=30`                                                                                                                                                                               | ✅ Closed (doc 06)                                                            |
| CF-04 | Old doc 08 had design tokens inline (hex values); new `design/design-tokens.md` uses OKLCH and is canonical                                                                                  | `design/design-tokens.md` supersedes old doc 08 inline tokens                                                                                                                                                                                                         | ✅ Closed (`design/design-tokens.md`)                                         |
| CF-05 | Traceability US-803 was mapped to "Transcode Status" but doc 03 US-803 = "Rails & Banner Curation"; US-804 = "Transcoding Status Dashboard"                                                  | Corrected in traceability v2: US-803 = Rails/Billboard, US-804 = Transcode Dashboard                                                                                                                                                                                  | ✅ Closed (traceability.md)                                                   |
| CF-06 | Doc 06 had three separate player endpoints (POST /api/progress, POST /api/analytics/events, POST /api/auth/heartbeat); creates chatty player protocol                                        | Consolidated into single POST /api/player/beacon; dropped /api/auth/heartbeat                                                                                                                                                                                         | ✅ Closed (doc 06, traceability.md)                                           |
| CF-07 | Plans page listed `max_streams` (1/2/4) but concurrent stream enforcement is Phase 2 (no playback-sessions table in MVP)                                                                     | Remove `max_streams` from plans comparison table in MVP UI; document as Phase 2 enforcement; keep column in `plans` DB table                                                                                                                                          | ✅ Closed (doc 03 US-701, traceability.md)                                    |
| CF-08 | Doc 03 US-402 said filters applied client-side; doc 06 search endpoint returns all results then client filters — not scalable                                                                | Filters now sent as server-side query params; API returns filtered + facet counts                                                                                                                                                                                     | ✅ Closed (doc 03, doc 06)                                                    |
| CF-09 | subscribeToPlan Server Action only updated `accounts.plan_id`; `subscriptions` table was Phase 2. Phase 1 must write a subscriptions row for billing history                                 | MVP writes a `subscriptions` row (status=active); cancel/upgrade/webhook Phase 2                                                                                                                                                                                      | ✅ Closed (doc 05, traceability.md)                                           |
| CF-10 | selectProfile stored active profile only in access token; two parallel refresh calls can diverge                                                                                             | Active profile stored in refresh token family row AND access token; `POST /api/profiles/:id/select` also writes `active_profile_id` to refresh family                                                                                                                 | ✅ Closed (doc 05, doc 06, traceability.md)                                   |
| CF-11 | Scaffold had `app/` at project root without `src/`, conflicting with modular monolith architectural docs                                                                                     | Standardized on `src/` layout; moved `app` to `src/app`, updated `@/*` path alias in `tsconfig.json`, recorded as ADR-0010                                                                                                                                            | ✅ Closed (ADR-0010, AGENTS.md, doc 04)                                       |
| CF-12 | `visibilityScope` previously conflated catalog discovery with plan entitlement, hiding paid titles from free browsing                                                                        | Separated into `buildVisibilityFilter` (catalog discovery) and `checkEntitlement` (playback authorization/lock badges); single DAL repository function                                                                                                                | ✅ Closed (doc 06, traceability.md)                                           |
| CF-13 | HLS manifest handler did not filter variants by plan tier or reject unauthorized variant/segment routes                                                                                      | Manifest route filters master variants by `qMax` and rejects disallowed variant/segment paths with `403`; player UI derives levels from manifest                                                                                                                      | ✅ Closed (doc 07)                                                            |
| CF-14 | Parental PIN lockout lacked password-reset path and had typo `PLAN_LOCKED`                                                                                                                   | Corrected to `PIN_LOCKED`; PIN lockout restricted to verification only; added `POST /api/auth/pin/reset` using primary account password                                                                                                                               | ✅ Closed (doc 06, doc 03)                                                    |
| CF-15 | Module boundary enforcement documented dead `.eslintrc.json` format instead of ESLint 9+ flat config                                                                                         | Implemented strict boundary rules in `eslint.config.mjs` using `no-restricted-imports` as an automated CI gate                                                                                                                                                        | ✅ Closed (eslint.config.mjs, doc 04, AGENTS.md)                              |
| CF-16 | Doc 11 specified per-request nonce CSP which breaks ISR/CDN caching for public shell                                                                                                         | Replaced with Hash/SRI-based CSP compatible with static edge caching; dropped `fonts.gstatic.com`; aligned `X-Frame-Options: DENY` with `frame-ancestors 'none'`; no HSTS preload yet                                                                                 | ✅ Closed (doc 11, doc 04)                                                    |
| CF-17 | Docs 03/05 mentioned `bcrypt` while Docs 06/10/traceability used `argon2id`                                                                                                                  | Standardized on `argon2id` (OWASP parameters: m=65536, t=3, p=4); added constant-time dummy-hash verification on unknown emails to prevent timing attacks                                                                                                             | ✅ Closed (doc 03, doc 05, doc 06, doc 10, doc 11)                            |
| CF-18 | Doc 11 had `tmpfs: /tmp:size=4G` scratch and "no internet access"                                                                                                                            | Replaced with bounded 50 GB host disk volume (`worker-scratch`) for 10 GB source uploads; allowlisted egress firewall (MinIO/R2 and Postgres directUrl); added FFmpeg input hardening (magic-byte check, `-f mp4`, `-protocol_whitelist file,pipe,crypto`)            | ✅ Closed (doc 07, doc 11)                                                    |
| CF-19 | Dominant color was proposed in video transcode worker; series titles have no video asset                                                                                                     | Moved dominant color and blur data URL extraction to image artwork upload time using `sharp` with clamped L/C; inline CSS var + CSS `color-mix` (no `v-bind`)                                                                                                         | ✅ Closed (design/visual-language.md)                                         |
| CF-20 | Client-side ThumbHash decoding required ~1.2 kB JS bundle + canvas decoding                                                                                                                  | Replaced with server-side ingest blur generation via `sharp` feeding `next/image`'s `blurDataURL` (0 kB client JS runtime)                                                                                                                                            | ✅ Closed (design/frontend-stack-and-libraries.md, design/visual-language.md) |
| CF-21 | Variable fonts in `next/font` had explicit `weight` arrays triggering build warnings                                                                                                         | Omitted `weight` for variable fonts (`Outfit`, `Inter`); configured variable Noto subsets for Indic                                                                                                                                                                   | ✅ Closed (design/visual-language.md)                                         |
| CF-22 | Upload library was ambiguous custom chunker vs Uppy                                                                                                                                          | Standardized on `@uppy/core` + `@uppy/aws-s3-multipart` for direct 10 MB chunk multipart uploads to S3-compatible storage                                                                                                                                             | ✅ Closed (design/frontend-stack-and-libraries.md, ADR-0009)                  |
| CF-23 | Scrubber preview sprites vs timeline hover phase ambiguity                                                                                                                                   | Scrubber spritesheets resolved as `[P2]`; MVP timeline uses hover timestamp tooltip and probed 10% poster frame                                                                                                                                                       | ✅ Closed (design/frontend-stack-and-libraries.md, doc 07)                    |
| CF-24 | Doc 16 claimed `localStorage` needs no consent and set account age to 13+                                                                                                                    | Corrected: ePrivacy applies equally to terminal storage (`localStorage` and cookies); account holders must be 18+ (adults) with kids as sub-profiles; added India IT Rules 2021 Grievance Officer requirement; self-hosted seed art; fixed "Elephants Dream" spelling | ✅ Closed (doc 16)                                                            |
| CF-25 | Redis role ambiguous between demo and production                                                                                                                                             | Redis confirmed as MVP component for token-bucket rate limiting in `src/proxy.ts` (10 req/15 min IP + 5 req/15 min account on auth); fail-closed or Postgres fallback on auth endpoints                                                                               | ✅ Closed (doc 01, doc 04, doc 11, doc 14)                                    |
| CF-26 | Prisma schema `url` and `directUrl` deprecated in Prisma 7 language server causing IDE lint errors                                                                                           | Migrated connection settings to `prisma.config.ts` via `defineConfig` + `env("DATABASE_URL")`; upgraded to Prisma 7 (`^7.10.0`) with `@prisma/adapter-pg` driver adapter and `pg.Pool` in `src/lib/db.ts`                                                             | ✅ Closed (`prisma.config.ts`, `src/lib/db.ts`)                               |

---

## Open Questions — Doc 01: Vision & Scope

| ID       | Question                                                 | Owner   | Decision                                                                      | Status            |
| -------- | -------------------------------------------------------- | ------- | ----------------------------------------------------------------------------- | ----------------- |
| OQ-01-01 | HLS signing strategy: manifest rewrite vs signed cookies | Arch    | Manifest-rewrite HMAC (demo); CDN edge token (prod). See doc 07.              | ✅ Closed         |
| OQ-01-02 | Uploads: 5 GB single-PUT limit acceptable?               | Eng     | Use S3 Multipart API (4-step); up to 10 GB. See doc 03 US-801, doc 06.        | ✅ Closed         |
| OQ-01-03 | Worker host: Vercel Function or separate VPS?            | Infra   | Always-on Docker VPS (pg-boss + FFmpeg). See doc 04, doc 07.                  | ✅ Closed         |
| OQ-01-04 | Home page caching: full SSR or ISR?                      | Eng     | Static ISR shell (1 h) + Suspense per-profile rails. See doc 04.              | ✅ Closed         |
| OQ-01-05 | Free tier: require login?                                | Product | Free content anonymous (no login). History/watchlist require login.           | ✅ Closed         |
| OQ-01-06 | Downloads on any plan?                                   | Product | No downloads on any tier.                                                     | ✅ Closed         |
| OQ-01-07 | Brand name                                               | Product | **StreamForge** (working title). Rename before production launch. See doc 14. | 🔵 Open (Product) |

---

## Open Questions — Doc 02: Feature Benchmark

| ID       | Question                | Owner   | Decision                                                          | Status       |
| -------- | ----------------------- | ------- | ----------------------------------------------------------------- | ------------ |
| OQ-02-01 | Skip Intro / Skip Recap | Product | Phase 2. Requires intro/recap markers in DB (reserved in doc 05). | 🔵 Open (P2) |
| OQ-02-02 | 4K / HDR UI indicator   | Product | Later. No 4K content pipeline in scope.                           | ✅ Closed    |

---

## Open Questions — Doc 03: Product Requirements

| ID       | Question                                    | Owner   | Decision                                                        | Status            |
| -------- | ------------------------------------------- | ------- | --------------------------------------------------------------- | ----------------- |
| OQ-03-01 | Free trial period?                          | Product | No free trial in Phase 1. Review for Phase 2.                   | 🔵 Open (Product) |
| OQ-03-02 | User comments/reviews moderation?           | Product | Out of scope MVP and Phase 2.                                   | ✅ Closed         |
| OQ-03-03 | Admin: separate user record vs role flag?   | Eng     | `role` flag on `accounts` table.                                | ✅ Closed         |
| OQ-03-04 | Search filters: client-side or server-side? | Eng     | **Server-side** with facet counts. See doc 06 GET /api/search.  | ✅ Closed (CF-08) |
| OQ-03-05 | max_streams enforcement in MVP?             | Eng     | No enforcement in MVP. Remove from plans UI. Column kept in DB. | ✅ Closed (CF-07) |

---

## Open Questions — Doc 04: Architecture

| ID       | Question                                            | Owner  | Decision                                                 | Status          |
| -------- | --------------------------------------------------- | ------ | -------------------------------------------------------- | --------------- |
| OQ-04-01 | Rate limiter backend: Upstash or self-hosted Redis? | Infra  | Self-hosted Redis in docker compose; Upstash in prod.    | 🔵 Open (Infra) |
| OQ-04-02 | TV layout: separate route group or CSS-only?        | Design | CSS-only responsive for MVP; `(tv)` route group Phase 2. | ✅ Closed       |

---

## Open Questions — Doc 05: Database

| ID       | Question                               | Owner   | Decision                                                                     | Status    |
| -------- | -------------------------------------- | ------- | ---------------------------------------------------------------------------- | --------- |
| OQ-05-01 | play_events partitioned from day 1?    | Eng     | No. Unpartitioned + BRIN + 90-day retention. Add partitioning at > 50M rows. | ✅ Closed |
| OQ-05-02 | Tags table (free-form) vs genres only? | Product | Genres only in MVP. Tags = Phase 2.                                          | ✅ Closed |
| OQ-05-03 | Star ratings vs like/dislike?          | Product | Like/dislike in MVP. Star ratings = Phase 2.                                 | ✅ Closed |
| OQ-05-04 | dominant_color column: OKLCH or hex?   | Eng     | Stored as hex VARCHAR(7); converted to OKLCH at render time.                 | ✅ Closed |

---

## Open Questions — Doc 06: API Design

| ID       | Question                                    | Owner   | Decision                                                                                   | Status    |
| -------- | ------------------------------------------- | ------- | ------------------------------------------------------------------------------------------ | --------- |
| OQ-06-01 | API versioning needed?                      | Eng     | No versioning Phase 1 (internal). Add `/api/v2/` when mobile client needs stable contract. | ✅ Closed |
| OQ-06-02 | Autocomplete personalised (filter by plan)? | Product | Yes — apply visibilityScope (plan-gated). `no-store` when authenticated.                   | ✅ Closed |
| OQ-06-03 | Card numbers accepted in subscribeToPlan?   | Legal   | Never. Razorpay handles card collection in Phase 2. MVP dummy checkout has no card fields. | ✅ Closed |

---

## Open Questions — Doc 07: Video Pipeline

| ID       | Question                              | Owner  | Decision                                                                 | Status    |
| -------- | ------------------------------------- | ------ | ------------------------------------------------------------------------ | --------- |
| OQ-07-01 | HLS from MinIO directly or CDN proxy? | Eng    | Demo: Route Handler proxy. Prod: Cloudflare R2 + Worker edge validation. | ✅ Closed |
| OQ-07-02 | Worker: Vercel Cron or VPS?           | Infra  | Always-on Docker VPS.                                                    | ✅ Closed |
| OQ-07-03 | Sprite seek preview in MVP?           | Design | Deferred P2. Poster at 10% duration is sufficient.                       | ✅ Closed |
| OQ-07-04 | Keep raw MP4 after transcode?         | Eng    | Delete by default (configurable via `DELETE_RAW_AFTER_TRANSCODE=false`). | ✅ Closed |

---

## Open Questions — Doc 08: UX & Design System

| ID       | Question                          | Owner      | Decision                                                           | Status               |
| -------- | --------------------------------- | ---------- | ------------------------------------------------------------------ | -------------------- |
| OQ-08-01 | TV layout route group?            | Design/Eng | CSS-only for MVP; `(tv)` group Phase 2.                            | ✅ Closed            |
| OQ-08-02 | Dominant-color extraction tool?   | Eng        | `colorthief` (pure-JS) Phase 2. Confirm vs `sharp` pixel sampling. | 🔵 Open (Eng, P2)    |
| OQ-08-03 | Light mode?                       | Design     | Phase 2. Tokens ready; only media-query override needed.           | 🔵 Open (Design, P2) |
| OQ-08-04 | Offline support (Service Worker)? | Eng        | Error page only in MVP. Full partial cache = Phase 2.              | 🔵 Open (Eng, P2)    |

---

## Open Questions — Design Tokens (design-tokens.md)

| ID        | Question                                                 | Owner  | Decision                                                                                                                                  | Status    |
| --------- | -------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| OQ-D00-01 | dominant_color storage format (OKLCH vs hex)?            | Eng    | Hex in DB (CF-05 above).                                                                                                                  | ✅ Closed |
| OQ-D00-02 | Raise `--color-text-muted` to ≥ 4.5:1?                   | Design | Raised to `oklch(64% 0.010 280)` yielding 5.51:1 contrast against `#0d0d0f`. See `design-tokens.md`.                                      | ✅ Closed |
| OQ-D00-03 | Noto Sans Indic subsets: next/font or static @font-face? | Eng    | Native variable subsets via `next/font/google` (`Noto_Sans_Devanagari`, `Noto_Sans_Tamil`, `Noto_Sans_Telugu`). See `visual-language.md`. | ✅ Closed |

---

## Open Questions — Visual Language (visual-language.md)

| ID        | Question                                    | Owner      | Decision                                                                                                    | Status                |
| --------- | ------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------- | --------------------- |
| OQ-D08-01 | `colorthief` vs `sharp` for dominant color? | Eng        | `sharp` downsampling + stats sampling at image-upload time. Clamped L/C in OKLCH. See `visual-language.md`. | ✅ Closed             |
| OQ-D08-02 | Hindi/Marathi in admin UI?                  | Product    | Phase 1: English-only admin. Noto Sans Devanagari loaded only for content pages.                            | 🔵 Open (Product, P2) |
| OQ-D08-03 | CSS Houdini grain vs PNG texture?           | Design/Eng | PNG texture Phase 2 (simpler). Houdini = Later.                                                             | 🔵 Open (Design, P2)  |

---

## Open Questions — Player Compatibility (doc 17)

| ID       | Question                                        | Owner  | Decision                                                                                      | Status        |
| -------- | ----------------------------------------------- | ------ | --------------------------------------------------------------------------------------------- | ------------- |
| OQ-17-01 | Playwright + H.264 in CI?                       | Eng    | Install `chromium` with `--with-chromium-codecs` or use `ffmpeg` for test assets. See doc 17. | 🔵 Open (Eng) |
| OQ-17-02 | Media Session API: title detail vs player only? | Design | Player page only.                                                                             | ✅ Closed     |

---

## Open Questions — Legal (doc 16)

| ID       | Question                              | Owner | Decision                                                                          | Status              |
| -------- | ------------------------------------- | ----- | --------------------------------------------------------------------------------- | ------------------- |
| OQ-16-01 | All legal docs need real legal review | Legal | ⚠️ All marked "NEEDS LEGAL REVIEW" in doc 16. Not legally binding until reviewed. | 🔵 Open (Legal)     |
| OQ-16-02 | Cookie consent banner required?       | Legal | Yes — GDPR/DPDPA. Use Vaul-based cookie consent UI.                               | 🔵 Open (Legal/Eng) |
| OQ-16-03 | Data export/deletion endpoint?        | Eng   | Planned: `GET /api/account/export` (GDPR). MVP stub returns 501.                  | 🔵 Open (Eng, P2)   |

---

## Open Questions — Cost & Limits (doc 19)

| ID       | Question                               | Owner | Decision                                                                                  | Status    |
| -------- | -------------------------------------- | ----- | ----------------------------------------------------------------------------------------- | --------- |
| OQ-19-01 | Cloudflare R2 pricing (verify current) | Infra | Checked 2026-09-29: R2 = $0.015/GB-month storage, $0.36/million Class B ops, free egress. | ✅ Closed |
| OQ-19-02 | Neon free tier limits (verify current) | Infra | Checked 2026-09-29: 0.5 GB storage, 190 compute-hours/month. See doc 19.                  | ✅ Closed |

---

## Feature Flag Register (Phase 2 items)

See doc 14 for runtime flag implementation. Listed here for decision-register completeness.

| Flag                           | Feature                       | Milestone        | Status                   |
| ------------------------------ | ----------------------------- | ---------------- | ------------------------ |
| `feat.dominant_color_theming`  | Ambient bg from title artwork | P2               | 🔵 Not started           |
| `feat.sprite_seek_preview`     | Timeline sprite thumbnails    | P2               | 🔵 Not started           |
| `feat.razorpay_checkout`       | Real payment via Razorpay     | P2               | 🔵 Not started           |
| `feat.recommendations`         | ML-based personalised rails   | P2               | 🔵 Not started           |
| `feat.concurrent_stream_limit` | Enforce max_streams           | MVP / P2         | ✅ Implemented (US-304, Redis 60s + `playback_sessions`) |
| `feat.skip_intro`              | Intro/recap skip markers      | P2               | 🔵 Not started           |
| `feat.light_mode`              | Light colour scheme           | P2               | 🔵 Not started           |
| `feat.analytics_dashboard`     | Admin analytics charts        | P2               | 🔵 Not started           |
| `feat.offline_sw`              | Service Worker partial cache  | P2               | 🔵 Not started           |
| `feat.subtitle_pipeline`       | Auto SRT→VTT conversion       | P2               | 🔵 Not started           |
| `feat.tv_layout`               | Dedicated (tv) route group    | P2               | 🔵 Not started           |
| `feat.region_restrictions`     | Geo-based content gating      | Later            | 🔵 Not started           |
| `feat.avod`                    | Ad-supported video tier       | **Out of scope** | ❌ Decided: not building |
| `feat.downloads`               | Offline downloads             | **Out of scope** | ❌ Decided: not building |
| `feat.4k_hdr`                  | 4K / HDR content pipeline     | **Out of scope** | ❌ Decided: not building |

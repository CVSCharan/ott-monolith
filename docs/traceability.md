# Traceability Matrix

> **Comprehensive mapping of every User Story (Doc 03) and API Endpoint / Surface (Doc 06) to Database Tables, Routes, and UI Components.**  
> **Source of truth:** [03-product-requirements.md](./03-product-requirements.md) · [06-api-design.md](./06-api-design.md) · [04-architecture.md](./04-architecture.md) · [implementation-tracker.md](./implementation-tracker.md)  
> Status: `[MVP]` = Phase 1 · `[P2]` = Phase 2 · `[Later]` = Phase 3+  
> Routes assume `src/app/` as root per Next.js 16 App Router monolith architecture.

---

## Architectural Rules & Policies

### 1. Mutation Surfaces (Single Source of Truth)
To adhere to the App Router monolith architecture:
- **Server Actions** are the canonical mutation surface for user interactions, forms, account mutations, watchlist, ratings, and CMS administration.
- **REST Route Handlers** are reserved strictly for high-frequency client beacons (`/api/progress`, `/api/analytics/events`), S3 multipart upload chunking (`/api/admin/video/multipart/*`), HLS manifest/segment proxies (`/api/hls/*`), and auth cookie exchanges (`/api/auth/login`, `/api/auth/signup`, `/api/auth/refresh`, `/api/auth/logout`).
- Duplicate mutation surfaces have been removed; each capability has exactly one primary mutation handler.

### 2. Visibility & Kids Scoping Rules
Every content-returning query enforces the following database scoping filter:
```sql
WHERE status = 'published'
  AND publish_at <= NOW()
  AND (
    -- If active profile is kids (or mode=kids):
    (is_kids = TRUE OR maturity_rating IN ('U', 'U/A 7+'))
    -- Else if active profile is adult:
    maturity_rating_rank <= profile.max_maturity_rank
  )
```
- **Public Shell Cache Variants:**
  - `General Shell` (`tag: rails-general`, ISR `revalidate: 3600`): Served to anonymous users and standard adult profiles.
  - `Kids Shell` (`tag: rails-kids`, ISR `revalidate: 3600`): Served when browsing in kids mode (`/kids` or `x-profile-mode=kids` cookie).
  - **Anonymous Access:** Anonymous visitors receive the `General Shell` with public rails. Personalised rails (`Continue Watching`, `My List`) are omitted until login.
- **Lock Badge Resolution on User-Agnostic Shell:**
  - The static public shell renders all cards with their minimum required tier badge (`Free` = 0, `Standard` = 1, `Premium` = 2).
  - During client-side hydration, the client compares `user.tier_rank >= title.min_tier_rank`. If entitled, the lock icon is dismissed and the card is marked playable; if unentitled or anonymous, the lock badge remains visible and triggers the plan upgrade modal on click/Enter.

### 3. Profile Switching & Parental PIN Verification
- Switching into a Kids profile is always allowed without a PIN.
- Switching **out** of a Kids profile to any non-kids profile requires parental PIN verification via `selectProfile(profileId, pin)` Server Action or prior PIN clearance token from `POST /api/auth/pin/verify`.
- Active profile state (`profileId`, `isKids`, `maxMaturity`) is stored directly in the `access_token` JWT cookie (re-issued on selection) and persisted in `refresh_tokens.active_profile_id`.

### 4. Watch Progress Debounce Standard (10 Seconds)
- Position updates (`POST /api/progress`) use a **10-second debounce interval** during steady-state playback.
- **Immediate flush** is triggered on `pause`, `seek`, and `pagehide`/`visibilitychange` (exit).
- *Rationale:* Halves database write RPS across thousands of concurrent streams compared to a 5-second interval, while zero position data is lost on exit due to lifecycle event flushing.

### 5. Content Card Interactions
- **Visuals:** Poster/backdrop image, title label, duration, maturity badge, and lock badge (Free vs Standard/Premium lock).
- **Preview:** Hovering or focusing for > 800ms triggers a muted 15-second video preview if available.
- **Keyboard Navigation:** 
  - Standard focus ring: `focus-visible:ring-2 focus-visible:ring-(--accent-primary) outline-none`.
  - `Enter`: Navigate to playback (`/watch/[id]`), or trigger Plan Upgrade modal if locked.
  - `Space`: Open Quick-View / Title Detail modal (`/title/[slug]`).

---

## 1. Discovery & Browsing (Epic 1)

| Story | Feature / Capability | Surface | Data Access | Visibility Scope | Tables | Route / File | UI Component | Status | Milestone |
|-------|----------------------|---------|-------------|------------------|--------|--------------|--------------|--------|-----------|
| **US-101** | Home Page Static Shell | Route Handler (`GET /api/rails`) | RSC Service Call (`getRails`) | Published, `publish_at <= NOW()`, General or Kids cache tag | `rails`, `rail_items`, `titles`, `billboards` | `src/app/(public)/page.tsx` | `Billboard`, `ContentRail` | Active | `[MVP]` |
| **US-101** | Per-Profile Rails (Continue / List) | Route Handler (`GET /api/profile-rails`) | Client fetch after hydration | Profile-scoped, published, maturity filter | `watch_progress`, `watchlist_items`, `titles` | `src/app/(public)/page.tsx` | `ProfileRails`, `Suspense` | Active | `[MVP]` |
| **US-102** | Top-10 Trending Rail | Route Handler (`GET /api/rails/top-10`) | RSC Service Call (`getTop10Rail`) | Published, 7-day plays, maturity filter | `title_stats_daily`, `titles` | `src/app/(public)/page.tsx` | `ContentRail` (type=top10) | Active | `[MVP]` |
| **US-103** | Genre Browse Pages | Route Handler (`GET /api/content`) | RSC Service Call (`getTitlesByGenre`) | Published, `publish_at <= NOW()`, genre match, maturity filter | `titles`, `title_genres`, `genres` | `src/app/(public)/browse/[genre]/page.tsx` | `ContentCard` grid, `InfiniteScroll` | Active | `[MVP]` |
| **US-103** | Genre List Directory | Route Handler (`GET /api/genres`) | RSC Service Call (`getAllGenres`) | Active genres with published titles | `genres`, `title_genres`, `titles` | `src/app/(public)/browse/page.tsx` | `GenrePillList`, `NavDropdown` | Active | `[MVP]` |

---

## 2. Title Detail & Metadata (Epic 2)

| Story | Feature / Capability | Surface | Data Access | Visibility Scope | Tables | Route / File | UI Component | Status | Milestone |
|-------|----------------------|---------|-------------|------------------|--------|--------------|--------------|--------|-----------|
| **US-201** | Title Detail (Public Metadata) | Route Handler (`GET /api/content/:slug`) | RSC Service Call (`getTitleBySlug`) | Published, `publish_at <= NOW()`, maturity check | `titles`, `genres`, `persons`, `title_cast`, `seasons`, `episodes` | `src/app/(public)/title/[slug]/page.tsx` | `TitleHero`, `CastList`, `MetadataPills` | Active | `[MVP]` |
| **US-201** | Title Profile State (Watchlist/Rating) | Route Handler (`GET /api/content/:slug/me`) | Client fetch after hydration | Active profile scoped | `watchlist_items`, `ratings`, `watch_progress` | `src/app/(public)/title/[slug]/page.tsx` | `WatchlistToggle`, `RatingButtons` | Active | `[MVP]` |
| **US-201** | SEO Structured Data (JSON-LD) | RSC Static Generation | RSC metadata generator | Published titles | `titles`, `persons`, `title_cast` | `src/app/(public)/title/[slug]/page.tsx` | `<script type="application/ld+json">` | Active | `[MVP]` |
| **US-202** | Episode List for Series | Route Handler (`GET /api/content/:slug`) | RSC Service Call (`getTitleEpisodes`) | Published episodes, sorted by season/number | `seasons`, `episodes`, `video_assets`, `watch_progress` | `src/app/(public)/title/[slug]/page.tsx` | `SeasonSelector`, `EpisodeList`, `EpisodeCard` | Active | `[MVP]` |

---

## 3. Playback & Video Delivery (Epic 3)

| Story | Feature / Capability | Surface | Data Access | Visibility Scope | Tables | Route / File | UI Component | Status | Milestone |
|-------|----------------------|---------|-------------|------------------|--------|--------------|--------------|--------|-----------|
| **US-301** | Playback Entitlement & Manifest URL | Route Handler (`GET /api/video/playback/:assetId`) | Client fetch | Published, plan rank >= title min tier, kids maturity check | `video_assets`, `titles`, `episodes`, `accounts`, `plans`, `subtitle_tracks` | `src/app/api/video/playback/[assetId]/route.ts` | `VideoPlayer`, `PlayerLoader` | Completed | `[MVP]` |
| **US-301** | HLS Manifest & Segment Delivery | Route Handler (`GET /api/hls/:assetId/[...path]`) | Streaming HTTP Proxy | Valid HMAC signature, unexpired segment token | MinIO / S3 Storage (`video_assets`) | `src/app/api/hls/[assetId]/[...path]/route.ts` | Video engine (hls.js / native) | Completed | `[MVP]` |
| **US-302** | Consolidated Player Beacon (Progress, QoE, Session) | Route Handler (`POST /api/player/beacon`) | Client beacon / fetch (10s debounce) | Active profile or anonymous (with anonId) | `watch_progress`, `play_events` | `src/app/api/player/beacon/route.ts` | `usePlayerProgress` hook | Completed | `[MVP]` |
| **US-302** | Continue Watching History Rail | Route Handler (`GET /api/history`) | Client fetch / RSC | Active profile, completed < 95% | `watch_progress`, `titles`, `episodes` | `src/app/(public)/page.tsx` & `/history` | `ContinueWatchingRail`, `ProgressCard` | Active | `[MVP]` |
| **US-303** | Adaptive Quality Selector | Route Handler (`GET /api/video/playback/:assetId`) | Client fetch (`maxQualityP`) | Plan tier cap (Free: 480p, Standard: 720p, Premium: 1080p) | `plans`, `accounts` | `src/app/watch/[slug]/page.tsx` | `PlayerSettingsMenu`, `QualitySubmenu` | Completed | `[MVP]` |

---

## 4. Search & Discovery (Epic 4)

| Story | Feature / Capability | Surface | Data Access | Visibility Scope | Tables | Route / File | UI Component | Status | Milestone |
|-------|----------------------|---------|-------------|------------------|--------|--------------|--------------|--------|-----------|
| **US-401** | Full-Text & Fuzzy Search | Route Handler (`GET /api/search?q=...`) | Client fetch / RSC | Published, `publish_at <= NOW()`, maturity filtered | `titles` (Postgres tsvector + pg_trgm) | `src/app/(public)/search/page.tsx` | `SearchBar`, `SearchResultsGrid` | Active | `[MVP]` |
| **US-402** | Search Multi-Facet Filtering | Route Handler (`GET /api/search?genre=&type=`) | Client fetch | Published, facet counts computed server-side | `titles`, `genres`, `title_genres` | `src/app/(public)/search/page.tsx` | `FilterChips`, `TypeToggle` | Active | `[MVP]` |
| **US-402** | Instant Search Autocomplete | Route Handler (`GET /api/search/autocomplete`) | Client fetch (150ms debounce) | Published, top 5 matches | `titles` | `src/app/api/search/autocomplete/route.ts` | `SearchAutocompleteOverlay` | Active | `[MVP]` |

---

## 5. Authentication, Profiles & Parental Controls (Epic 5)

| Story | Feature / Capability | Surface | Data Access | Visibility Scope | Tables | Route / File | UI Component | Status | Milestone |
|-------|----------------------|---------|-------------|------------------|--------|--------------|--------------|--------|-----------|
| **US-501** | Account Registration | Route Handler (`POST /api/auth/signup`) | Client form submit | New account validation | `accounts`, `plans`, `profiles` | `src/app/(public)/signup/page.tsx` | `SignupForm`, `PlanPickerCard` | Active | `[MVP]` |
| **US-502** | Login Authentication | Route Handler (`POST /api/auth/login`) | Client form submit | Credential check, family token init | `accounts`, `refresh_tokens`, `profiles` | `src/app/(public)/login/page.tsx` | `LoginForm`, `SocialLoginPlaceholder` | Active | `[MVP]` |
| **US-502** | Logout & Token Invalidation | Route Handler (`POST /api/auth/logout`) | Client fetch | Active token family revocation | `refresh_tokens` | `src/app/api/auth/logout/route.ts` | `HeaderUserMenu`, `SignOutButton` | Active | `[MVP]` |
| **US-502** | Silent Token Refresh | Route Handler (`POST /api/auth/refresh`) | Proxy / Transparent client fetch | Valid refresh token with 5s grace window | `refresh_tokens` | `src/app/api/auth/refresh/route.ts` | Automatic proxy background flow | Active | `[MVP]` |
| **US-502** | Session State Hydration | Route Handler (`GET /api/auth/me`) | Client fetch | Active account + selected profile | `accounts`, `profiles`, `plans` | `src/app/api/auth/me/route.ts` | `AuthProvider`, `UserProfileBadge` | Active | `[MVP]` |
| **US-503** | List Account Profiles | Route Handler (`GET /api/profiles`) | RSC Service Call / Client fetch | Active account profiles | `profiles`, `accounts` | `src/app/(auth)/profiles/page.tsx` | `ProfileGrid`, `ProfileAvatar` | Active | `[MVP]` |
| **US-503** | Select Active Profile | Server Action (`selectProfile`) | Server Action call | PIN required if exiting kids profile | `refresh_tokens`, `profiles` | `src/app/(auth)/profiles/page.tsx` | `ProfileCard`, `PinModal` | Active | `[MVP]` |
| **US-503** | Create Profile | Server Action (`createProfile`) | Server Action call | Max profiles allowed by plan check | `profiles`, `accounts`, `plans` | `src/app/(auth)/profiles/page.tsx` | `AddProfileModal`, `AvatarSelector` | Active | `[MVP]` |
| **US-503** | Update Profile | Server Action (`updateProfile`) | Server Action call | Profile ownership check | `profiles` | `src/app/(auth)/profiles/[id]/edit/page.tsx` | `EditProfileForm` | Active | `[MVP]` |
| **US-503** | Delete Profile | Server Action (`deleteProfile`) | Server Action call | Cannot delete last profile | `profiles`, `watchlist_items`, `watch_progress`, `ratings` | `src/app/(auth)/profiles/[id]/edit/page.tsx` | `DeleteProfileButton`, `ConfirmDialog` | Active | `[MVP]` |
| **US-504** | Verify Parental PIN | Route Handler (`POST /api/auth/pin/verify`) | Client fetch | Rate limited: 5 attempts per 15 min | `accounts`, `parental_pin_events` | `src/app/api/auth/pin/verify/route.ts` | `PinEntryModal`, `PinPad` | Active | `[MVP]` |
| **US-504** | Set / Update Parental PIN | Server Action (`updateParentalPin`) | Server Action call | Account password re-authentication | `accounts`, `parental_pin_events` | `src/app/(auth)/account/page.tsx` | `ParentalControlsForm` | Active | `[MVP]` |

---

## 6. Personalisation, Watchlist & Ratings (Epic 6)

| Story | Feature / Capability | Surface | Data Access | Visibility Scope | Tables | Route / File | UI Component | Status | Milestone |
|-------|----------------------|---------|-------------|------------------|--------|--------------|--------------|--------|-----------|
| **US-601** | Add to Watchlist | Server Action (`addToWatchlist`) | Server Action call | Active profile | `watchlist_items` | `src/app/(public)/title/[slug]/page.tsx` | `WatchlistToggle` | Active | `[MVP]` |
| **US-601** | Remove from Watchlist | Server Action (`removeFromWatchlist`) | Server Action call | Active profile | `watchlist_items` | `src/app/(auth)/my-list/page.tsx` | `WatchlistRemoveButton` | Active | `[MVP]` |
| **US-601** | List Watchlist Items | Route Handler (`GET /api/watchlist`) | RSC Service Call / Client fetch | Active profile, published titles only | `watchlist_items`, `titles` | `src/app/(auth)/my-list/page.tsx` | `MyListGrid`, `ContentCard` | Active | `[MVP]` |
| **US-602** | Get Watch History | Route Handler (`GET /api/history`) | RSC Service Call / Client fetch | Active profile, cursor paginated | `watch_progress`, `titles`, `episodes` | `src/app/(auth)/history/page.tsx` | `HistoryTable`, `ResumeButton` | Active | `[MVP]` |
| **US-602** | Clear History Item | Server Action (`removeHistoryItem`) | Server Action call | Active profile | `watch_progress` | `src/app/(auth)/history/page.tsx` | `HistoryItemDeleteButton` | Active | `[MVP]` |
| **US-603** | Rate Title (Like/Dislike) | Server Action (`rateTitle`) | Server Action call | Active profile, updates denormalized counters | `ratings`, `titles` | `src/app/(public)/title/[slug]/page.tsx` | `RatingThumbs` | Active | `[MVP]` |

---

## 7. Plans, Billing & Subscriptions (Epic 7)

| Story | Feature / Capability | Surface | Data Access | Visibility Scope | Tables | Route / File | UI Component | Status | Milestone |
|-------|----------------------|---------|-------------|------------------|--------|--------------|--------------|--------|-----------|
| **US-701** | List Subscription Plans | Route Handler (`GET /api/plans`) | RSC Service Call (`getPlans`) | Active publicly available plans | `plans` | `src/app/(public)/plans/page.tsx` | `PlanComparisonTable`, `PlanCard` | Active | `[MVP]` |
| **US-702** | Subscribe / Switch Plan | Server Action (`subscribeToPlan`) | Server Action call | Active account | `accounts`, `subscriptions` | `src/app/(auth)/checkout/[planId]/page.tsx` | `CheckoutSummary`, `DummyPaymentButton` | Active | `[MVP]` |
| **US-703** | Playback Entitlement Gate | Route Handler (`GET /api/video/playback/:assetId`) | Server-side gate check | Checks account plan `tier_rank` vs title `min_tier_rank` | `titles`, `plans`, `accounts` | `src/app/(public)/watch/[id]/page.tsx` | `UpgradeGateModal`, `PlanBadge` | Active | `[MVP]` |

---

## 8. Admin, Content Ingestion & Operations (Epic 8)

| Story | Feature / Capability | Surface | Data Access | Visibility Scope | Tables | Route / File | UI Component | Status | Milestone |
|-------|----------------------|---------|-------------|------------------|--------|--------------|--------------|--------|-----------|
| **US-801** | Multipart Upload: Initiate | Route Handler (`POST /api/admin/video/multipart/initiate`) | Client fetch (admin) | Admin only, <= 10 GB validation | `video_assets` | `src/app/api/admin/video/multipart/initiate/route.ts` | `UploadDropzone`, `UploadWizard` | Completed | `[MVP]` |
| **US-801** | Multipart Upload: Get Part URL | Route Handler (`POST /api/admin/video/multipart/part-url`) | Client fetch (admin) | Admin only, part 1..10000 | MinIO / S3 Presigned URL | `src/app/api/admin/video/multipart/part-url/route.ts` | Upload progress chunker | Completed | `[MVP]` |
| **US-801** | Multipart Upload: Complete | Route Handler (`POST /api/admin/video/multipart/complete`) | Client fetch (admin) | Admin only, S3 HEAD verify | `video_assets`, `transcode_jobs` | `src/app/api/admin/video/multipart/complete/route.ts` | `TranscodeQueuedBanner` | Completed | `[MVP]` |
| **US-801** | Multipart Upload: Abort | Route Handler (`POST /api/admin/video/multipart/abort`) | Client fetch (admin) | Admin only | `video_assets` | `src/app/api/admin/video/multipart/abort/route.ts` | `UploadCancelButton` | Completed | `[MVP]` |
| **US-801** | Multipart Upload: List Parts | Route Handler (`GET /api/admin/video/multipart/parts`) | Client fetch (admin) | Admin only, resumes in-flight parts | MinIO / S3 Multipart state | Upload Wizard hook | Resumption state detector | Active | `[MVP]` |
| **US-802** | Create Content Metadata | Server Action (`createTitle`) | Server Action call | Admin only, creates draft title | `titles`, `title_genres`, `title_cast` | `src/app/(admin)/admin/content/new/page.tsx` | `TitleMetadataForm` | Active | `[MVP]` |
| **US-802** | Update Content Metadata | Server Action (`updateTitle`) | Server Action call | Admin only | `titles`, `title_genres`, `title_cast` | `src/app/(admin)/admin/content/[id]/edit/page.tsx` | `TitleEditForm` | Active | `[MVP]` |
| **US-802** | Admin Content List | Route Handler (`GET /api/admin/content`) | RSC Service Call / Client fetch | Admin only, includes drafts/archived | `titles`, `video_assets`, `genres` | `src/app/(admin)/admin/content/page.tsx` | `AdminContentTable`, `StatusFilter` | Active | `[MVP]` |
| **US-802** | Archive Title (Soft Delete) | Server Action (`archiveTitle`) | Server Action call | Admin only, sets status='archived' | `titles` | `src/app/(admin)/admin/content/page.tsx` | `ArchiveConfirmDialog` | Active | `[MVP]` |
| **US-802** | Publish / Schedule Title | Server Action (`publishTitle`, `scheduleTitle`) | Server Action call | Admin only, updates status/publish_at | `titles` | `src/app/(admin)/admin/content/[id]/edit/page.tsx` | `PublishControls`, `SchedulePicker` | Active | `[MVP]` |
| **US-802** | Image Upload (Thumb/Poster) | Route Handler (`POST /api/admin/content/:id/images`) | Client form-data fetch | Admin only, max 5 MB image/webp/jpeg | `titles` | `src/app/(admin)/admin/content/[id]/edit/page.tsx` | `ImageUploadDropzone`, `ImagePreview` | Active | `[MVP]` |
| **US-803** | Rails List & Order | Route Handler (`GET /api/admin/rails`) | RSC Service Call (`getAdminRails`) | Admin only, all active/inactive rails | `rails`, `rail_items` | `src/app/(admin)/admin/rails/page.tsx` | `RailReorderList`, `DragHandle` | Active | `[MVP]` |
| **US-803** | Curate Rail & Items | Server Action (`updateRail`, `addRailItem`, `removeRailItem`) | Server Action call | Admin only | `rails`, `rail_items` | `src/app/(admin)/admin/rails/page.tsx` | `RailItemPicker`, `RailConfigModal` | Active | `[MVP]` |
| **US-803** | Billboard Hero Curation | Route Handler / Action (`getAdminBillboard`, `updateBillboard`) | Server Action call | Admin only | `billboards`, `titles` | `src/app/(admin)/admin/billboard/page.tsx` | `BillboardManager`, `TitlePicker` | Active | `[MVP]` |
| **US-804** | Transcode Job Status | Route Handler (`GET /api/admin/video/assets/:assetId/status`) | Client polling fetch (3s interval) | Admin only | `video_assets`, `transcode_jobs` | `src/app/api/admin/video/assets/[assetId]/status/route.ts` | `TranscodeProgressBar`, `JobBadge` | Completed | `[MVP]` |
| **US-804** | Admin Jobs Queue List | Route Handler (`GET /api/admin/jobs`) | RSC Service Call (`getTranscodeJobs`) | Admin only | `transcode_jobs`, `video_assets` | `src/app/(admin)/admin/jobs/page.tsx` | `JobsTable`, `FailureReasonCallout` | Active | `[MVP]` |
| **US-804** | Retry Transcode Job | Server Action (`retryTranscodeJob`) | Server Action call | Admin only, resets attempts & sends to pg-boss | `transcode_jobs`, `video_assets` | `src/app/(admin)/admin/jobs/page.tsx` | `RetryJobButton` | Active | `[MVP]` |

---

## 9. Analytics, Platform Health & SEO (Epic 9)

| Story | Feature / Capability | Surface | Data Access | Visibility Scope | Tables | Route / File | UI Component | Status | Milestone |
|-------|----------------------|---------|-------------|------------------|--------|--------------|--------------|--------|-----------|
| **US-901** | Player Analytics & QoE Event Ingest | Route Handler (`POST /api/player/beacon`) | Consolidated client beacon | Authenticated or anonymous (with anonId) | `play_events` | `src/app/api/player/beacon/route.ts` | Player telemetry sender | Completed | `[MVP]` |
| **US-901** | Basic Analytics Overview `[P2]` | Route Handler (`GET /api/admin/analytics/overview`) | RSC Service Call (`getAnalyticsOverview`) | Admin only | `title_stats_daily`, `play_events` | `src/app/(admin)/admin/analytics/page.tsx` | `PlaysChart`, `TopTitlesMetricCard` | Deferred | `[P2]` |
| System | Platform Liveness Probe | Route Handler (`GET /api/health/live`) | Route Handler call | Public (probes HTTP process) | None | `src/app/api/health/live/route.ts` | Uptime monitor / Docker liveness probe | Completed | `[MVP]` |
| System | Platform Readiness Probe | Route Handler (`GET /api/health/ready`) | Route Handler call | Public (probes DB, Redis connectivity) | None (SELECT 1 + PING) | `src/app/api/health/ready/route.ts` | Uptime monitor / Ingress router | Completed | `[MVP]` |
| System | Interactive OpenAPI / Swagger UI | Route Handler (`GET /api/docs`) | Route Handler call | Public | None | `src/app/api/docs/route.ts` | Swagger UI Explorer | Completed | `[MVP]` |
| System | OpenAPI 3.1 JSON Specification | Route Handler (`GET /api/docs/spec`) | Route Handler call | Public | None | `src/app/api/docs/spec/route.ts` | OpenAPI Spec | Completed | `[MVP]` |
| System | Dynamic Sitemap XML | Route Handler (`GET /sitemap.xml`) | Static / ISR revalidated | Published titles, genres | `titles`, `genres` | `src/app/sitemap.ts` | Next.js Metadata Route | Active | `[MVP]` |
| System | Robots Exclusion Protocol | Route Handler (`GET /robots.txt`) | Static Route | Public | None | `src/app/robots.ts` | Next.js Metadata Route | Active | `[MVP]` |

---

## 10. Admin User Management

| Story | Feature / Capability | Surface | Data Access | Visibility Scope | Tables | Route / File | UI Component | Status | Milestone |
|-------|----------------------|---------|-------------|------------------|--------|--------------|--------------|--------|-----------|
| Admin | List Accounts | Route Handler (`GET /api/admin/users`) | RSC Service Call / Client fetch | Admin only, cursor paginated | `accounts`, `plans`, `profiles` | `src/app/(admin)/admin/users/page.tsx` | `UserTable`, `UserSearchInput` | Active | `[MVP]` |
| Admin | Force-Assign Plan | Server Action (`adminSetAccountPlan`) | Server Action call | Admin only | `accounts`, `subscriptions` | `src/app/(admin)/admin/users/page.tsx` | `PlanAssignModal` | Active | `[MVP]` |
| Admin | Soft-Ban / Reactivate Account | Server Action (`adminToggleUserBan`) | Server Action call | Admin only, revokes active tokens | `accounts`, `refresh_tokens` | `src/app/(admin)/admin/users/page.tsx` | `BanUserButton`, `BanConfirmDialog` | Active | `[MVP]` |

---

## 11. Canonical Server Actions Index

| Action Name | Module | Primary Purpose | Mutation Performed | Tables |
|-------------|--------|-----------------|---------------------|--------|
| `selectProfile(profileId, pin?)` | `src/modules/profile` | Switch active profile; enforce PIN if leaving kids | Sets `access_token` JWT cookie + updates family | `refresh_tokens` |
| `createProfile(data)` | `src/modules/profile` | Add profile to account | Plan max profile check + insert profile | `profiles` |
| `updateProfile(id, data)` | `src/modules/profile` | Update profile name, avatar, maturity | Updates profile record | `profiles` |
| `deleteProfile(id)` | `src/modules/profile` | Remove profile | Cascade deletes profile items | `profiles`, `watchlist_items`, `watch_progress`, `ratings` |
| `updateParentalPin(pin, currentPass)` | `src/modules/auth` | Set or update 4-digit parental PIN | Re-hashes PIN with argon2id | `accounts`, `parental_pin_events` |
| `addToWatchlist(titleId)` | `src/modules/watchlist` | Save title to My List | Upserts watchlist row | `watchlist_items` |
| `removeFromWatchlist(titleId)` | `src/modules/watchlist` | Remove title from My List | Deletes watchlist row | `watchlist_items` |
| `removeHistoryItem(titleId)` | `src/modules/history` | Delete title from continue watching | Deletes progress row | `watch_progress` |
| `rateTitle(titleId, value)` | `src/modules/ratings` | Rate title (+1 or -1) | Upserts rating; updates denormalized title counts | `ratings`, `titles` |
| `subscribeToPlan(planId)` | `src/modules/billing` | Subscribe / change plan tier | Updates `accounts.plan_id`, creates `subscriptions` row | `accounts`, `subscriptions` |
| `createTitle(data)` | `src/modules/admin` | Create new title draft | Inserts title, cast, and genre associations | `titles`, `title_genres`, `title_cast` |
| `updateTitle(id, data)` | `src/modules/admin` | Edit title metadata | Updates title details | `titles`, `title_genres`, `title_cast` |
| `archiveTitle(id)` | `src/modules/admin` | Soft delete title | Sets `status = 'archived'` | `titles` |
| `publishTitle(titleId)` | `src/modules/admin` | Publish title immediately | Sets `status = 'published'`, `publish_at = NOW()` | `titles` |
| `scheduleTitle(titleId, date)` | `src/modules/admin` | Schedule title for future publish | Sets `status = 'scheduled'`, `publish_at = date` | `titles` |
| `updateRail(id, data)` | `src/modules/admin` | Update rail title, order, or active state | Updates rail metadata | `rails` |
| `addRailItem(railId, titleId)` | `src/modules/admin` | Add title to curated manual rail | Inserts rail item | `rail_items` |
| `removeRailItem(railId, titleId)` | `src/modules/admin` | Remove title from manual rail | Deletes rail item | `rail_items` |
| `updateBillboard(data)` | `src/modules/admin` | Update active hero billboard | Updates billboard title reference and headline | `billboards` |
| `retryTranscodeJob(jobId)` | `src/modules/admin` | Retry failed transcode | Re-enqueues job in pg-boss | `transcode_jobs`, `video_assets` |
| `adminSetAccountPlan(userId, planId)` | `src/modules/admin` | Admin override of account plan | Updates `accounts.plan_id` | `accounts`, `subscriptions` |
| `adminToggleUserBan(userId, ban)` | `src/modules/admin` | Ban or unban user | Updates `accounts.is_banned`, revokes tokens | `accounts`, `refresh_tokens` |

---

## 12. Phase 2 Endpoint Reservations

| Endpoint | Story | Purpose |
|----------|-------|---------|
| `POST /api/billing/checkout` | US-702 P2 | Razorpay live checkout order creation |
| `POST /api/billing/webhook` | — | Razorpay payment confirmation webhook |
| `GET /api/billing/invoices` | — | PDF invoices and payment receipt download |
| `GET /api/recommend/:profileId` | — | Vector / collaborative filtering personalised rail |
| `POST /api/admin/content/:id/subtitles` | — | Subtitle track upload + automated SRT to WebVTT conversion |
| `GET /api/playback-sessions` | — | Real-time concurrent stream validation |
| `DELETE /api/playback-sessions/:id` | — | Force terminate remote playback session |

# 03 – Product Requirements

> Format: **Epic → User Story → Acceptance Criteria**  
> Status legend: `[MVP]` `[P2]` `[Later]`

---

## Epic 1: Discovery & Browsing

### US-101 Home Page Rails
> **As a** viewer, **I want** to see curated rows of content on the home page **so that** I can discover something to watch without searching.

**Acceptance Criteria:**
- [ ] Page loads with at least: Hero Billboard, Continue Watching (logged-in only, Suspense streamed), Trending Now, New Releases, genre rail × 3 (Action, Drama, Comedy)
- [ ] Public shell (billboard, static rails) is ISR-cached (`revalidate: 3600`); per-profile rails (Continue Watching, My List) streamed in separately — never part of the ISR cache
- [ ] Each rail is horizontally scrollable with arrow navigation
- [ ] Rail cards show: thumbnail, title, duration/episode count, maturity badge (display label uses regional mapping per A11), and lock badge
- [ ] **Content Card Lock Badge Behavior:**
  - Free titles: Marked 'Free' or no lock badge; playable anonymously without account or subscription
  - Paid titles (Standard / Premium): Static shell displays lock icon badge with required tier label. On client hydration, if `user.tier_rank >= title.min_tier_rank`, lock badge is dismissed and title marked playable. If user is unentitled or anonymous, clicking or pressing Enter triggers the Plan Upgrade modal
  - Video Preview: Hovering or focusing a card for > 800ms autoplays a muted 15-second teaser preview (if asset has preview clip)
- [ ] **Content Card Keyboard Navigation:**
  - Standard accessible focus ring: `focus-visible:ring-2 focus-visible:ring-(--accent-primary) outline-none`
  - `Enter`: Navigate directly to playback (`/watch/[id]`), or open Plan Upgrade modal if locked
  - `Space`: Open Quick-View / Title Detail modal (`/title/[slug]`) without full navigation
- [ ] Billboard autoplays trailer at mute after 2s delay (desktop only)
- [ ] Billboard has Play button, "More Info" button, maturity badge, and description
- [ ] Empty rails are hidden gracefully (no blank whitespace)

### US-102 Top-10 Rail
> **As a** viewer, **I want** to see what's popular right now **so that** I don't miss trending content.

**Acceptance Criteria:**
- [ ] Shows top 10 titles by total watch count in last 7 days
- [ ] Cards show a large rank number (1–10) overlaid on thumbnail
- [ ] Updated every 6 hours (ISR with `revalidate: 21600`)

### US-103 Genre / Category Pages
> **As a** viewer, **I want** to browse all content in a specific genre **so that** I can find movies I like.

**Acceptance Criteria:**
- [ ] URL: `/browse/[genre]` (e.g., `/browse/action`)
- [ ] Shows all published titles in that genre, paginated (24 per page)
- [ ] Filter by sub-genre, maturity rating, year range (Phase 2)
- [ ] Sort by: Trending, New, A–Z, Rating

---

## Epic 2: Title Detail

### US-201 Title Detail Page
> **As a** viewer, **I want** to see full details about a title **so that** I can decide whether to watch it.

**Acceptance Criteria:**
- [ ] URL: `/title/[slug]` for movies, `/title/[slug]/season/[n]` for series
- [ ] Shows: hero image or trailer, title, year, duration/seasons, maturity rating, genres, description, cast & crew list
- [ ] "Play" button → player; "More Info" → scroll to episodes/details
- [ ] "Add to My List" toggle (heart/+ icon); persisted per profile
- [ ] "Like" / "Dislike" thumbs
- [ ] For series: season selector tabs + episode list with thumbnails, titles, air dates, synopses
- [ ] Related titles section (same genre, randomised in Phase 1 → personalised in Phase 2)
- [ ] Trailer player (embedded or inline)
- [ ] Structed data (JSON-LD) for SEO

### US-202 Episode List for Series
> **As a** viewer, **I want** to browse episodes by season **so that** I can continue where I left off.

**Acceptance Criteria:**
- [ ] Season tabs; selecting a season loads episodes for that season
- [ ] Each episode card: thumbnail, episode number, title, duration, synopsis (truncated)
- [ ] Watched episodes have a progress bar overlay
- [ ] "Continue" button on partially watched episodes
- [ ] "Next to Watch" highlighted for logged-in users

---

## Epic 3: Playback

### US-301 Video Player
> **As a** viewer, **I want** smooth, high-quality playback **so that** I can enjoy content without interruption.

**Acceptance Criteria:**
- [ ] hls.js player with ABR enabled
- [ ] Player URL: `/watch/[contentId]` or `/watch/[contentId]/episode/[episodeId]`
- [ ] Controls: play/pause, volume, mute, seek bar, 10s forward/back, quality selector, subtitle selector, fullscreen
- [ ] Keyboard shortcuts: `Space` = play/pause, `←/→` = ±10s, `↑/↓` = volume, `f` = fullscreen, `m` = mute, `c` = subtitles
- [ ] Player remembers last quality preference in localStorage
- [ ] Subtitle track selector (when SRT/VTT available)
- [ ] Buffer state shows loading spinner; stall event logged (QoE analytics)
- [ ] Player hides controls after 3s of inactivity, shows on mouse move
- [ ] Mobile: touch-to-show controls, swipe left/right for ±10s

### US-302 Continue Watching / Resume
> **As a** logged-in viewer, **I want** to resume where I left off **so that** I don't lose my place.

**Acceptance Criteria:**
- [ ] Playback position saved every 10s to server via debounced POST (`POST /api/progress`)
- [ ] Immediate progress flush triggered on `pause`, `seek`, and `pagehide`/`visibilitychange` (exit/unload)
- [ ] *Debounce Rationale:* 10-second interval halves DB write throughput (RPS) compared to 5s under high concurrency, while immediate flush guarantees zero loss of resume precision on sudden exit
- [ ] "Continue Watching" rail shows titles with a progress bar overlay
- [ ] Clicking "Play" on a partially-watched title resumes from saved position
- [ ] Position cleared when title reaches >90% completion (mark as watched)

### US-303 Quality Selector
> **As a** viewer, **I want** to manually change video quality **so that** I can manage my bandwidth.

**Acceptance Criteria:**
- [ ] Options displayed: Auto, 1080p, 720p, 480p, 360p (from HLS manifest; only show renditions actually present)
- [ ] Selection persisted to `localStorage`; applied on next load
- [ ] "Auto" mode is default; shows current resolution as a small badge in Auto mode
- [ ] **Entitlement cap enforced server-side** when issuing the signed playback URL:
  - Free plan → max 480p rendition served (720p/1080p segments not signed)
  - Standard plan → max 720p
  - Premium plan → max 1080p
- [ ] Attempting to manually select a higher quality than the plan allows: option shown as greyed-out with a lock icon + upgrade CTA tooltip

---

## Epic 4: Search

### US-401 Keyword Search
> **As a** viewer, **I want** to search for specific titles **so that** I can find content I have in mind.

**Acceptance Criteria:**
- [ ] Search bar accessible from global nav (click or `Cmd+K` / `Ctrl+K`)
- [ ] Debounced autocomplete suggestions appear after 150ms / 2+ characters
- [ ] Results include: movies, series, genres, cast members (Phase 2)
- [ ] Full results page at `/search?q=...`
- [ ] Fuzzy matching (pg_trgm) for typos: "Avangers" → Avengers
- [ ] Results ordered by: relevance score, then trending rank

### US-402 Search Filters
> **As a** viewer, **I want** to filter search results **so that** I can narrow down by type or rating.

**Acceptance Criteria:**
- [ ] Filter chips: Type (Movie / Series), Genre (multi-select), Maturity Rating
- [ ] Filters applied client-side on the existing result set (no new search)
- [ ] Active filter chips shown as badges; each removable

---

## Epic 5: Authentication & Profiles

### US-501 Sign Up
> **As a** new user, **I want** to create an account **so that** I can access personalised features.

**Acceptance Criteria:**
- [ ] Fields: Name, Email, Password (min 8 chars, 1 uppercase, 1 number)
- [ ] Email uniqueness validation (async, on blur)
- [ ] On success: creates account + default "Main" profile → redirects to home
- [ ] Passwords hashed with argon2id (OWASP parameters: m=65536, t=3, p=4); non-existent emails run dummy-hash verification to prevent timing attacks
- [ ] Rate limited: max 5 sign-up attempts per IP per hour (Redis token bucket; fail-closed on auth)

### US-502 Login / Logout
> **As a** returning user, **I want** to sign in **so that** I can access my account.

**Acceptance Criteria:**
- [ ] Email + password login (dummy-hash verification on unknown email)
- [ ] Returns access token (15min) + refresh token (30d) in httpOnly cookies; refresh cookie scoped to `Path=/api/auth` for client-driven refresh
- [ ] Refresh token rotation on every refresh request (5-second grace window for parallel requests)
- [ ] Logout clears both cookies and invalidates the refresh token in DB
- [ ] "Remember me" not needed (refresh token already persists 30d)

### US-503 Profile Picker
> **As a** subscriber, **I want** to pick or create a profile **so that** I can keep my watchlist separate from others in my household.

**Acceptance Criteria:**
- [ ] After login: profile picker screen (Netflix-style grid of avatars)
- [ ] Up to 5 profiles per account
- [ ] "Add Profile" button if < 5 profiles
- [ ] Kids profile: shows lock icon, requires PIN to edit or delete
- [ ] Switching **out** of a Kids profile to any non-kids profile requires entering the 4-digit parental PIN
- [ ] Selected profile state (`profileId`, `isKids`, `maxMaturity`) is stored directly in the `access_token` JWT cookie (re-issued on profile change) and persisted in `refresh_tokens.active_profile_id`
- [ ] All subsequent API calls and RSC queries scoped to the selected profile

### US-504 Kids Profile & Parental Controls
> **As a** parent, **I want** to create a kids profile with content restrictions **so that** my children can't access adult content.

**Acceptance Criteria:**
- [ ] Kids profile restricts content to internal maturity rating `G` or `PG` (display label per regional mapping, A11)
- [ ] **Account-level** parental PIN (4-digit) stored on the account, not the profile; required to: exit kids mode (switch to any non-kids profile), edit any profile's settings, change plan
- [ ] PIN verification required in `selectProfile(profileId, pin)` Server Action or via clearance token from `POST /api/auth/pin/verify`
- [ ] PIN attempt lockout: 5 failed attempts → lock for 15 minutes; logged to `parental_pin_events`
- [ ] Kids profile home page shows only age-appropriate content (filtered by `min_age ≤ 7` or rating `G`/`PG`)
- [ ] Cannot access Settings → Account from kids profile without PIN

---

## Epic 6: My List, History & Ratings

### US-601 Watchlist (My List)
> **As a** viewer, **I want** to save titles to a list **so that** I can watch them later.

**Acceptance Criteria:**
- [ ] Toggle add/remove from any card (hover) or title detail page
- [ ] "My List" rail shown on home page and on `/my-list` page
- [ ] Persisted per profile (not account-wide)
- [ ] Works without page reload (optimistic UI update)

### US-602 Watch History
> **As a** viewer, **I want** to see what I've watched **so that** I can rewatch or remember titles.

**Acceptance Criteria:**
- [ ] `/history` page lists all watched titles, sorted by most recent
- [ ] Shows progress bar if partially watched
- [ ] "Remove from history" option
- [ ] History is per-profile

### US-603 Like / Dislike
> **As a** viewer, **I want** to rate titles **so that** the system can recommend better content.

**Acceptance Criteria:**
- [ ] Thumbs up / thumbs down on title detail page and hover card
- [ ] Rating stored per profile
- [ ] Used as signal for recommendations engine (Phase 2)

---

## Epic 7: Subscription & Billing

### US-701 Subscription Plans
> **As a** user, **I want** to see available plans **so that** I can choose one that suits me.

**Acceptance Criteria:**
- [ ] Plans page at `/plans` (accessible without login)
- [ ] **Three plans** (no downloads on any tier, aligned with A10):
  - **Free** — 480p max, 1 concurrent stream, `free`-tier content only, 1 profile
  - **Standard** — 720p max, 2 concurrent streams, `free + standard` content, 3 profiles
  - **Premium** — 1080p max, 4 concurrent streams, all content (`free + standard + premium`), 5 profiles
- [ ] Clear feature comparison table; maturity labels use canonical internal scale (A11)
- [ ] CTA: "Get Standard" → payment flow

### US-702 Dummy Subscription Checkout
> **As a** user, **I want** to subscribe **so that** I can access premium content.

**Acceptance Criteria:**
- [ ] Checkout page at `/checkout/[planId]`
- [ ] Form: card number (dummy validation), expiry, CVV → any input accepted in dev
- [ ] On submit: update `account.planId` + `account.planExpiresAt` in DB
- [ ] Show success screen; redirect to home
- [ ] Phase 2: replace with Razorpay SDK

### US-703 Entitlement Check
> **As the** platform, **I want** to gate premium content behind subscriptions **so that** free users can't access paid content.

**Acceptance Criteria:**
- [ ] Each piece of content has a `min_tier_rank` field: `0` (free), `1` (standard), `2` (premium)
- [ ] Each plan has a `max_tier_rank`: Free=0, Standard=1, Premium=2
- [ ] **Playback route `/watch/[id]`** is **publicly routable** for free-tier content (A9); entitlement check is inside the Route Handler:
  - Unauthenticated request + `free` content → sign HLS URL at 480p cap → allow
  - Unauthenticated request + standard/premium content → 401 with login prompt
  - Authenticated, insufficient plan → 403 `ENTITLEMENT_ERROR` + inline upgrade modal
- [ ] Lock badge shown on standard/premium content cards for anonymous and free-plan users
- [ ] Quality cap enforced at URL-signing time (see US-303)

---

## Epic 8: Admin CMS

### US-801 Content Upload
> **As an** admin, **I want** to upload a video file **so that** it becomes available on the platform.

**Acceptance Criteria:**
- [ ] Admin-only route: `/admin/content/new`
- [ ] Upload MP4 (up to **10 GB**) directly to MinIO/R2 using the **S3 Multipart Upload API** — browser never sends bytes through the Next.js server:
  1. Client calls `POST /api/video/multipart/initiate` → receives `uploadId` + `s3Key`
  2. Client splits file into 8 MB chunks; calls `POST /api/video/multipart/part-url?part=N` per chunk → gets presigned part URL (30-min expiry each)
  3. Client uploads each chunk directly to storage via `PUT`
  4. Client calls `POST /api/video/multipart/complete` with `{ uploadId, s3Key, parts: [{ETag, PartNumber}] }` → server calls `CompleteMultipartUpload`; server HEAD-verifies the object exists before enqueuing
- [ ] Upload progress bar driven by `XHR.upload.onprogress` across all parts
- [ ] On completion: `VideoAsset` created with `status: 'pending'`; transcode job enqueued via pg-boss
- [ ] Transcoding status shown: `pending | processing | ready | error`

### US-802 Metadata Management
> **As an** admin, **I want** to edit title metadata **so that** viewers see accurate information.

**Acceptance Criteria:**
- [ ] Fields: title, slug, description, genres (multi-select), cast & crew, year, duration, maturity rating, content tier, release date
- [ ] Thumbnail upload (JPEG/WebP, min 1280×720)
- [ ] Poster upload (portrait, min 500×750)
- [ ] Trailer video URL (YouTube embed or internal)
- [ ] Save as draft or publish immediately

### US-803 Rails & Banner Curation
> **As an** admin, **I want** to manage what appears in featured rails and hero banners **so that** I can promote specific content.

**Acceptance Criteria:**
- [ ] Rail editor: name, position, content type (manual picks, genre auto, trending auto)
- [ ] Drag-and-drop reorder of titles within manual rails
- [ ] Hero billboard: pick up to 5 featured titles with rotation order
- [ ] Schedule: "show from date X to date Y" per rail item

### US-804 Transcoding Status Dashboard
> **As an** admin, **I want** to see transcoding progress **so that** I know when content is ready.

**Acceptance Criteria:**
- [ ] Table of all jobs: title, status, started at, completed at, error message
- [ ] Auto-refreshes every 30s
- [ ] "Retry" button for failed jobs
- [ ] Progress percentage for in-flight jobs

---

## Epic 9: Admin Analytics

### US-901 Basic Analytics Dashboard `[P2]`
> **As an** admin, **I want** to see key metrics **so that** I can understand platform usage.

**Acceptance Criteria:**
- [ ] Metrics: total plays, unique viewers today/week/month, top 10 titles by plays, average watch time, new sign-ups
- [ ] Simple bar chart (play counts by day, last 30 days)
- [ ] Date range picker (last 7d / 30d / 90d)
- [ ] Export as CSV

---

## Non-Functional Requirements

| Category | Requirement |
|----------|------------|
| Performance | Home page LCP < 2.5s on desktop (Core Web Vitals "Good"); static shell served from ISR cache |
| Performance | Player ready (first frame) < 3s on 10 Mbps connection |
| Availability | 99.5% uptime target (Vercel SLA) |
| Security | All auth tokens in httpOnly, Secure, SameSite=Lax cookies |
| Security | HLS access: signed master.m3u8 (1 h) + manifest-rewrite HMAC tokens on `.ts` URLs (15 min). See doc 07. |
| Security | S3 multipart part URLs: 30-min expiry; `CompleteMultipartUpload` verified server-side via HEAD |
| Accessibility | WCAG 2.1 AA compliance for all user-facing pages |
| Responsiveness | Fully functional on mobile (375px wide) and desktop (1440px+) |
| SEO | Title detail pages indexed; structured data (JSON-LD); `robots.txt` and `sitemap.xml` generated |
| DB | No N+1 queries; all list queries use `include` / joins correctly |
| Uploads | Video upload: S3 multipart, up to 10 GB, progress tracked client-side |
| Maturity | Internal canonical scale: G / PG / PG-13 / R / NC-17. Regional display mapping applied at render time (A11). |

---

## Open Questions

| # | Status | Question |
|---|--------|---------|
| OQ1 | ✅ Closed | Free-tier content is **anonymous** (no login required). Watchlist, history, and continue-watching require a logged-in profile (A9). |
| OQ2 | Open | Is there a content moderation workflow needed for user-generated comments/reviews? |
| OQ3 | ✅ Closed | Admin accounts use a `role` flag (`'admin'`) on the `accounts` table — not a separate user record. |

---

## Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Acceptance criteria scope creep | High | Strict P1/P2 tagging; scope reviews per milestone |
| Kids content filtering requires content tagging upfront | Medium | Add maturity rating as required field in admin CMS |
| Entitlement checks missed server-side | High | Middleware-level check + API-level double check |

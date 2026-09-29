# 06 – API Design

> **Architecture:** Next.js 16 App Router — Route Handlers for REST; Server Actions for mutations.  
> **Base URL (local):** `http://localhost:3000`  
> **Auth:** httpOnly cookies (`access_token`, `refresh_token`). No `Authorization` header for browser clients.  
> **Versioning:** No public versioning in Phase 1 — this is an internal API consumed by our own UI.

---

## Conventions

### Response Envelope

All Route Handler responses use a consistent envelope:

```typescript
// Success
{ "data": <payload>, "meta"?: { "cursor": string, "hasMore": boolean } }

// Error
{ "error": { "code": "SNAKE_CASE_CODE", "message": "Human-readable description", "details"?: any } }
```

### Error Codes

| Code                | HTTP | When                                                           |
| ------------------- | ---- | -------------------------------------------------------------- |
| `UNAUTHORIZED`      | 401  | No valid session                                               |
| `LOGIN_REQUIRED`    | 401  | Anonymous request on auth-required resource                    |
| `FORBIDDEN`         | 403  | Session valid but insufficient role/plan                       |
| `ENTITLEMENT_ERROR` | 403  | Plan too low; response includes `{ requiredTier, upgradeUrl }` |
| `PLAN_EXPIRED`      | 402  | Subscription lapsed                                            |
| `KIDS_RESTRICTED`   | 403  | Content age-restricted for this kids profile                   |
| `NOT_FOUND`         | 404  | Resource doesn't exist **or** profile-ownership check fails    |
| `CONFLICT`          | 409  | Duplicate resource (e.g., email already registered)            |
| `RATE_LIMITED`      | 429  | Too many requests; includes `Retry-After` header               |
| `VALIDATION_ERROR`  | 422  | Invalid request body; `details` lists field errors             |
| `PLAN_LOCKED`       | 423  | Parental PIN locked (5 failed attempts)                        |
| `ASSET_NOT_READY`   | 503  | Video asset still transcoding                                  |

### Pagination

All list endpoints that can return > 50 rows use **cursor-based pagination**:

- Query param: `?cursor=<opaque_base64_string>&limit=<int, max 100>`
- The cursor encodes the last row's `(created_at, id)` pair (stable sort)
- Response: `{ data: [...], meta: { cursor: "...", hasMore: true } }`
- **No offset pagination** — offsets are O(n) on large tables

### Rate Limits

Enforced via Redis token bucket in `proxy.ts` (see doc 04). Headers returned:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1727540400
```

---

## Content Visibility vs Entitlement Separation

Catalog discovery (visibility) and playback authorization (entitlement) are strictly separated:

- **Visibility** governs what titles exist and can be discovered in the catalog (based on publishing state and age/maturity rating).
- **Entitlement** governs whether a user can play a title or must be shown a lock badge / upgrade modal (based on subscription plan, expiry, and concurrent streams).

All content reads must pass through a single repository function (`findVisibleTitles` in `src/modules/content/dal.ts`).

```typescript
// src/modules/content/visibility.ts

export interface ProfileContext {
  isKids: boolean // profile.is_kids
  maxMaturityRank?: number // profile max maturity rating rank (e.g. 1=U, 2=U/A 7+, 3=U/A 13+, 4=U/A 16+, 5=A)
  profileId?: string // undefined for anonymous
}

export interface EntitlementContext {
  accountId?: string
  tierRank: number // 0=free, 1=standard, 2=premium (0 for anonymous)
  isSubscriptionActive: boolean
  expiresAt?: Date
}

/**
 * 1. Visibility Filter: Governs catalog browsing.
 * Enforces status='published', publish_at <= now, and age appropriateness.
 * NEVER filters by plan tier rank — all users can discover catalog titles.
 */
export function buildVisibilityFilter(ctx: ProfileContext) {
  return {
    status: 'published' as const,
    publishAt: { lte: new Date() },
    ...(ctx.isKids
      ? {
          OR: [
            { isKids: true },
            { maturityRating: { in: ['U', 'U/A 7+'] } },
            { minAge: { lte: 7 } },
          ],
        }
      : ctx.maxMaturityRank
        ? { maturityRatingRank: { lte: ctx.maxMaturityRank } }
        : {}),
  }
}

/**
 * 2. Entitlement Checker: Governs playback authorization & lock badge resolution.
 */
export function checkEntitlement(
  ctx: EntitlementContext,
  title: { minTierRank: number },
): { entitled: boolean; maxQualityP: number; reason?: string } {
  if (title.minTierRank === 0) {
    return { entitled: true, maxQualityP: 720 } // Free tier title
  }
  if (!ctx.accountId || !ctx.isSubscriptionActive) {
    return { entitled: false, maxQualityP: 0, reason: 'SUBSCRIPTION_REQUIRED' }
  }
  if (ctx.expiresAt && ctx.expiresAt < new Date()) {
    return { entitled: false, maxQualityP: 0, reason: 'PLAN_EXPIRED' }
  }
  if (ctx.tierRank < title.minTierRank) {
    return { entitled: false, maxQualityP: 0, reason: 'UPGRADE_REQUIRED' }
  }
  const maxQualityP = ctx.tierRank >= 2 ? 2160 : ctx.tierRank === 1 ? 1080 : 720
  return { entitled: true, maxQualityP }
}

/**
 * 3. Centralized Repository Function: All content queries pass through this DAL function.
 */
// src/modules/content/dal.ts
export async function findVisibleTitles(
  ctx: ProfileContext,
  whereClause: Prisma.TitleWhereInput = {},
  options: {
    take?: number
    skip?: number
    cursor?: Prisma.TitleWhereUniqueInput
    orderBy?: any
  } = {},
) {
  return db.title.findMany({
    where: {
      AND: [buildVisibilityFilter(ctx), whereClause],
    },
    ...options,
  })
}
```

### Kids-Profile Verification Guarantee

A dedicated integration test suite (`tests/integration/kids-visibility.test.ts`) verifies every content-returning endpoint (`/api/rails`, `/api/rails/top-10`, `/api/content`, `/api/content/:slug`, `/api/search`, `/api/search/autocomplete`):

- When called with a Kids profile or anonymous in kids mode (`/kids`), zero adult, R-rated, or `maturityRating > 'U/A 7+'` content is returned.
- Direct slug access to an adult title (`GET /api/content/adult-slug`) with a kids profile returns `404 NOT_FOUND` (not 403, preventing title existence leaks).

---

## Auth Endpoints

### `POST /api/auth/signup`

**Rate limit:** 5 requests per IP per hour (`rl:signup:{ip}`)

```typescript
// Request
{ "name": string, "email": string, "password": string }

// Validations:
// - email: valid format; lowercased before storage and uniqueness check
// - password: min 8 chars, 1 uppercase, 1 digit (as per US-501)
// - Rate check against BOTH IP and the normalized email (prevents account enumeration via timing)

// Success 201
{ "data": { "accountId": string, "profileId": string } }
// Sets: access_token cookie (15min) + refresh_token cookie (30d, Path=/api/auth/refresh)

// Errors: CONFLICT (email taken), VALIDATION_ERROR, RATE_LIMITED
```

### `POST /api/auth/login`

**Rate limit per account+IP:** 10 attempts per IP per 15 min AND 5 attempts per account (email) per 15 min. Both must pass.

````typescript
// Request
{ "email": string, "password": string }

// On success: issues access_token (15min) + refresh_token (30d)
// refresh_token cookie Path=/api/auth/refresh — it is NOT sent on every request

// Success 200
{ "data": { "accountId": string, "role": "user" | "admin" } }

// Errors: UNAUTHORIZED (wrong password — same message as email-not-found; prevents enumeration),
//         RATE_### `POST /api/auth/refresh`

**Called only by proxy.ts during transparent refresh; not called by client JS directly.**

```typescript
// Reads refresh_token cookie (Path=/api/auth/refresh ensures it's sent only here)

// Grace window: if token was rotated < 5s ago, return the replacement token (handles parallel tabs)
// Reuse detection: if token already revoked beyond grace window → revoke entire family → 401

// Profile preservation:
// Handler reads active_profile_id from the refresh token row in Postgres.
// Re-issues access_token containing the preserved active { profileId, isKids, maxMaturity }.
// The active profile survives silent token rotation.

// Success 200 — issues new access_token + new refresh_token
{ "data": { "rotated": true } }

// Errors: UNAUTHORIZED (SESSION_COMPROMISED)
````

### `POST /api/auth/logout`

```typescript
// Revokes refresh token in DB; clears both cookies
// Success 200: { "data": { "loggedOut": true } }
```

### `GET /api/auth/me`

Returns the current session identity. Used by client to hydrate auth state.

```typescript
// Requires: valid access_token cookie
// Success 200
{
  "data": {
    "accountId": string,
    "email": string,
    "role": "user" | "admin",
    "profileId": string | null,
    "isKids": boolean,
    "plan": { "slug": string, "maxTierRank": number, "maxQualityP": number },
    "planExpiresAt": string | null
  }
}
```

### `POST /api/auth/pin/verify`

Account-level parental PIN verification.

```typescript
// Request: { "pin": string (4 digits) }
// Requires: authenticated session

// Lockout policy:
// Checks pin_locked_until; if locked, rejects with 423 PIN_LOCKED ({ "lockedUntil": ISO8601 }).
// IMPORTANT: PIN lockout limits PIN verification only. It does NOT lock general account login
// or playback of age-appropriate / kids content.
// On wrong PIN: increments pin_attempts; if >= 5 → set pin_locked_until = now() + 15 min;
//   logs attempt to parental_pin_events (event_type: 'failed' | 'locked')
// On correct: resets pin_attempts to 0; sets pin_locked_until = null;
//   logs to parental_pin_events (event_type: 'success');
//   issues a short-lived pin-cleared cookie (5 min expiry)

// Success 200: { "data": { "verified": true, "clearedUntil": ISO8601 } }
// Errors: UNAUTHORIZED, PIN_LOCKED ({ "lockedUntil": ISO8601 }), FORBIDDEN
```

### `POST /api/auth/pin/reset`

Password-override reset path for parental PIN (e.g. parent forgot PIN or is locked out).

```typescript
// Request: { "accountPassword": string, "newPin": string (4 digits) }
// Requires: authenticated session

// 1. Verifies account password against accounts.password_hash (argon2id).
// 2. On valid password:
//    - Clears pin_locked_until = null
//    - Resets pin_attempts = 0
//    - Hashes newPin (argon2id) and updates accounts.parental_pin_hash
//    - Logs to parental_pin_events (event_type: 'reset', ip_address)
// Success 200: { "data": { "reset": true } }
// Errors: UNAUTHORIZED (incorrect password), VALIDATION_ERROR
```

### `PUT /api/auth/pin`

Set or change the account-level parental PIN.

```typescript
// Request: { "currentPin"?: string, "newPin": string (4 digits) }
// If parental_pin_hash already set, currentPin is required (or call POST /api/auth/pin/reset)
// Hashed with argon2id before storage; logs to parental_pin_events
```

---

## Profile Endpoints

> **Ownership rule:** All profile endpoints validate that `profile_id` belongs to the authenticated account. Return `404 NOT_FOUND` (not 403) on foreign profile IDs — do not reveal ownership.

### `GET /api/profiles`

```typescript
// Returns all profiles for the current account
// Requires: authenticated session
{ "data": Profile[] }
```

### `POST /api/profiles`

```typescript
// Create a new profile
// Enforces: count < plan.max_profiles (checked in handler)
// Request: { "name": string, "isKids"?: boolean, "avatarUrl"?: string, "languagePref"?: string }
// Success 201: { "data": Profile }
// Errors: FORBIDDEN (at plan limit), VALIDATION_ERROR
```

### `PUT /api/profiles/:id`

```typescript
// Update profile name, avatar, language preference
// Validates profile belongs to account (→ 404 if not)
// is_kids toggle: requires valid parental PIN cookie (set via POST /api/auth/pin/verify)
```

### `DELETE /api/profiles/:id`

```typescript
// Cannot delete the last profile on an account
// Requires parental PIN cookie if deleting a kids profile
```

### `POST /api/profiles/:id/select`

Sets the active profile for the session.

```typescript
// Request: { "pin"?: string }
// Rules:
// 1. If currently active profile is a Kids profile (is_kids === true) AND target profile is NOT a kids profile:
//    - Parental PIN is MANDATORY.
//    - Client must supply "pin" in body OR carry a valid pin-cleared cookie from /api/auth/pin/verify.
//    - If PIN missing or invalid → returns 403 PIN_REQUIRED or 401 PIN_INCORRECT.
// 2. On success:
//    - Updates refresh_tokens.active_profile_id = targetProfile.id in DB.
//    - Re-issues access_token JWT cookie with updated claims: { profileId, isKids, maxMaturity }.
//    - Sets cookie x-profile-mode = 'kids' | 'general' for edge cache routing.
// Success 200: { "data": { "profileId": string, "isKids": boolean } }
```

---

## Content Endpoints

### Content payload split

```typescript
// PUBLIC (cacheable, no session data) — served with ISR / s-maxage
interface TitlePublicPayload {
  id: string
  slug: string
  type: string
  title: string
  description: string
  releaseYear: number
  durationSeconds: number | null
  minAge: number // internal value; display label computed client-side
  thumbnailUrl: string
  posterUrl: string
  trailerUrl: string | null
  likeCount: number
  dislikeCount: number
  playCount: number
  genres: Genre[]
  cast: CastMember[]
  seasons?: SeasonSummary[] // for series
}

// PER-PROFILE (no-store) — fetched dynamically after hydration
interface TitleProfileState {
  isInWatchlist: boolean
  userRating: 'like' | 'dislike' | null
  watchProgress: { positionSeconds: number; durationSeconds: number } | null
  isLocked: boolean // true if plan.max_tier_rank < title.min_tier_rank
}
```

### `GET /api/content/:slug`

```typescript
// Public payload — Cache-Control: s-maxage=21600, stale-while-revalidate=3600
// Does NOT include profile state (see GET /api/content/:slug/me)
{ "data": TitlePublicPayload }
```

### `GET /api/content/:slug/me`

```typescript
// Per-profile state — Cache-Control: no-store
// Requires: authenticated session with active profileId
{ "data": TitleProfileState }
```

### `GET /api/content` (list)

```typescript
// Query params: type? | genre? | cursor? | limit? (max 50)
// Uses visibilityScope(ctx)
// Cache-Control: s-maxage=300, stale-while-revalidate=60
{ "data": TitlePublicPayload[], "meta": { cursor, hasMore } }
```

### `GET /api/genres`

```typescript
// Static list of all genres with slug
// Cache-Control: s-maxage=86400
{ "data": Genre[] }
```

### `GET /api/plans`

```typescript
// All plans with limits. Used on /plans page (no auth required)
// Cache-Control: s-maxage=3600
{ "data": Plan[] }  // Plan includes max_tier_rank, max_quality_p, max_profiles, max_streams, price_paise
```

### `GET /api/rails`

```typescript
// Returns ordered active rails for the home page (static, public)
// Includes: billboard, manual rails with title payloads
// Does NOT include continue_watching or my_list (those are per-profile)
// Cache-Control: s-maxage=3600
{ "data": { billboard: BillboardItem; rails: Rail[] } }
```

### `GET /api/rails/top-10`

```typescript
// Top-10 titles by play count in last 7 days (from title_stats_daily)
// Cache-Control: s-maxage=21600
{ "data": TitlePublicPayload[] }
```

---

## Search Endpoints

### `GET /api/search`

```typescript
// Query: q (required), type?, genre?, minAge?
// Results filtered through visibilityScope(ctx)
// Full-text: plainto_tsquery('english', q) with ts_rank; fallback to trigram if rank = 0
// Cache-Control: no-store (results depend on session entitlement)
{ "data": TitlePublicPayload[], "meta": { cursor, hasMore } }
```

### `GET /api/search/autocomplete`

```typescript
// Query: q (min 2 chars)
// Returns title names only (no full payloads) — fast lookup
// Cache-Control: s-maxage=60 (autocomplete is reasonably stable)
{ "data": Array<{ slug: string; title: string; type: string; thumbnailUrl: string }> }
```

---

## Watchlist & History Endpoints

### `POST /api/watchlist`

```typescript
// Requires: auth + active profileId
{ "titleId": string }
// Idempotent: ON CONFLICT DO NOTHING
// Success 201 (or 200 if already present)
// Triggers revalidatePath('/my-list')
```

### `DELETE /api/watchlist/:titleId`

```typescript
// Requires: auth + active profileId (ownership checked)
// Success 204
```

### `GET /api/watchlist`

```typescript
// Returns My List for active profile, newest first
// Cache-Control: no-store
{ "data": TitlePublicPayload[], "meta": { cursor, hasMore } }
```

### `GET /api/history`

```typescript
// Watch history for active profile (watch_progress), newest updated_at first
// Cache-Control: no-store
{ "data": Array<TitlePublicPayload & { progress: WatchProgress }>, "meta": { cursor, hasMore } }
```

### `DELETE /api/history/:titleId`

Removes all watch_progress rows for this title+profile (movie) or all episodes of the title.

### `POST /api/ratings`

```typescript
// Requires: auth + active profileId
{ "titleId": string, "value": "like" | "dislike" }
// Upserts Rating; atomically updates titles.like_count / dislike_count
// Uses $executeRaw ON CONFLICT
// Success 200: { "data": { likeCount: number, dislikeCount: number } }
```

---

---

## Consolidated Player Beacon

### `POST /api/player/beacon`

Single consolidated beacon handling:

1. **Watch Progress:** Position save (10s debounce, immediate flush on pause/seek/exit).
2. **QoE & Analytics:** Batched playback events (`play`, `pause`, `seek`, `buffer`, `quality_change`, `complete`, `error`).
3. **Playback-Session Heartbeat:** Updates active stream timestamp (for concurrent stream validation).

**NO separate auth heartbeat:** Transparent token refresh is handled natively by `proxy.ts`. No player heartbeat ever touches or writes to `refresh_tokens`.

```typescript
// Rate limit: 60 per minute per IP / profileId
// Transport: regular fetch() during active playback; navigator.sendBeacon(url, Blob) on pagehide/unload
// Headers: Content-Type: application/json

// Request Body:
{
  "titleId": string,
  "episodeId"?: string,
  "videoAssetId": string,
  "anonymousId"?: string,      // required if user is unauthenticated
  "progress"?: {
    "positionSeconds": number,
    "durationSeconds": number,
    "isCompleted": boolean      // true if position > 90%
  },
  "playbackSessionId"?: string, // client-generated session UUID
  "events"?: Array<{
    "eventType": "play" | "pause" | "seek" | "buffer" | "quality_change" | "complete" | "heartbeat" | "error",
    "positionSeconds"?: number,
    "quality"?: string,
    "deviceType"?: "desktop" | "mobile" | "tablet" | "tv",
    "occurredAt": string        // ISO8601 client timestamp
  }>
}

// Processing in Route Handler:
// 1. If auth + profileId present and req.progress provided:
//    - Atomic upsert to watch_progress ($executeRaw ON CONFLICT).
// 2. If req.events provided:
//    - Batch INSERT into play_events (max 50 events per payload).
// 3. If req.playbackSessionId provided:
//    - Touch active session TTL in Redis (SETEX `stream:{accountId}:{sessionId}` 30).
//
// Success 202 Accepted: { "data": { "progressSaved": boolean, "eventsIngested": number } }
```

---

## Real User Monitoring (RUM) Telemetry

### `POST /api/telemetry/rum`

Lightweight ingestion endpoint for browser Core Web Vitals (CLS, FCP, FID, INP, LCP, TTFB) dispatched via `navigator.sendBeacon` or background fetch keepalive.

```typescript
// Transport: navigator.sendBeacon('/api/telemetry/rum', Blob) or fetch() with keepalive: true
// Rate limit: 100 per minute per IP
// Headers: Content-Type: application/json

// Request Body:
{
  "id"?: string,
  "name": "CLS" | "FCP" | "FID" | "INP" | "LCP" | "TTFB",
  "value": number,
  "rating"?: "good" | "needs-improvement" | "poor",
  "delta"?: number,
  "navigationType"?: string,
  "url"?: string
}

// Processing in Route Handler:
// 1. Validates metric name against ALLOWED_METRICS set.
// 2. Formats structured Pino log with metric, value, rating, and referrer.
//
// Success: 204 No Content
// Validation Error: 400 Bad Request or 422 Unprocessable Entity
```

---

## Video Endpoints

### `GET /api/video/playback/:assetId`

Returns the signed master HLS URL and subtitle URLs. **This endpoint issues the playback URLs; the HMAC Route Handler `/api/hls/*` serves the content.**

```typescript
// Auth: optional (anonymous allowed for free content)
// Applies full entitlement gate (see doc 07)
{
  "data": {
    "hlsMasterUrl": "/api/hls/{assetId}/master.m3u8?token=...&exp=...",
    "subtitles": Array<{
      "languageCode": string, "label": string,
      "isDefault": boolean,
      "vttUrl": string   // signed, 4h TTL
    }>,
    "maxQualityP": number,   // plan cap applied (e.g. 480 for free)
    "durationSeconds": number
  }
}
// Errors: NOT_FOUND, ASSET_NOT_READY, ENTITLEMENT_ERROR, PLAN_EXPIRED, KIDS_RESTRICTED
```

### `GET /api/hls/:assetId/[...path]`

Serves HLS manifests (with URI rewriting) and proxies segments. See doc 07 — Manifest Proxy Signer.

### S3 Multipart Upload (Admin only)

```typescript
// All under /api/admin — proxy guards + requireAdmin() DAL check

// 1. Initiate upload
POST /api/admin/video/multipart/initiate
// Rate limit: 5 per accountId per hour
{ "filename": string, "sizeBytes": number, "titleId"?: string, "episodeId"?: string }
// Validates: sizeBytes < 10_000_000_000 (10 GB), filename ends in .mp4
// Creates VideoAsset { status: 'pending' }; calls S3 CreateMultipartUpload
{ "data": { "assetId": string, "uploadId": string, "s3Key": string } }

// 2. Get presigned URL for a part (one call per chunk)
POST /api/admin/video/multipart/part-url
// Rate limit: 100 per accountId per hour
{ "uploadId": string, "s3Key": string, "partNumber": number }  // partNumber 1-10000
// Returns presigned UploadPart URL (30-min expiry)
{ "data": { "partUrl": string, "expiresAt": ISO8601 } }

// 3. Complete upload
POST /api/admin/video/multipart/complete
{ "uploadId": string, "s3Key": string, "assetId": string,
  "parts": Array<{ "partNumber": number, "etag": string }> }
// Server: calls CompleteMultipartUpload → HEAD verify (object exists + size > 0)
// On verify OK: UPDATE video_assets SET status='pending_transcode'; pg-boss.send('transcode')
// On verify fail: abort multipart; UPDATE status='error'
{ "data": { "assetId": string, "status": "queued" } }

// 4. Abort (client cancelled)
POST /api/admin/video/multipart/abort
{ "uploadId": string, "s3Key": string, "assetId": string }
// Calls AbortMultipartUpload; UPDATE video_assets SET status='error', error_message='aborted'
```

---

## Admin Endpoints

> All `/api/admin/*` routes require `role === 'admin'` checked in both proxy and `requireAdmin()` DAL call.

### Content Management

```typescript
POST   /api/admin/content              // Create title (draft)
PUT    /api/admin/content/:id          // Update metadata
DELETE /api/admin/content/:id          // Soft-delete (→ archived)
POST   /api/admin/content/:id/publish  // Set status=published, publish_at=now()
POST   /api/admin/content/:id/schedule // Set status=scheduled, publish_at=future

// Image upload (thumbnail / poster)
POST /api/admin/content/:id/images
// Multipart form-data: file (max 5 MB, image/jpeg or image/webp)
// Uploads to thumbnails/{titleId}/thumbnail.jpg; returns public URL
{ "data": { "thumbnailUrl": string, "posterUrl": string } }
```

### Rails Management

```typescript
GET  /api/admin/rails          // List all rails
POST /api/admin/rails          // Create manual rail
PUT  /api/admin/rails/:id      // Update position/name/active
POST /api/admin/rails/:id/items // Add title to manual rail
DELETE /api/admin/rails/:railId/items/:titleId
```

### Transcode Status

```typescript
GET /api/admin/video/assets/:assetId/status
// Returns: { status, progressPct, errorMessage, renditions }
```

### User Management

```typescript
GET  /api/admin/users                  // List accounts (cursor-paginated)
PUT  /api/admin/users/:id/plan         // Force-assign plan
POST /api/admin/users/:id/ban          // Soft-ban account
```

---

## Server Actions

Server Actions handle all authenticated mutations from React Server Components. They use a consistent return type:

```typescript
// src/types/actions.ts
export type ActionResult<T = void> =
  { success: true; data: T } | { success: false; code: string; message: string; details?: unknown }

// Example: addToWatchlist
// src/modules/watchlist/actions.ts
;('use server')
export async function addToWatchlist(titleId: string): Promise<ActionResult> {
  const session = await requireSession() // throws → 401 if not authed
  if (!session.profileId)
    return {
      success: false,
      code: 'NO_PROFILE',
      message: 'Select a profile first',
    }

  await db.watchlistItem.upsert({
    where: { profileId_titleId: { profileId: session.profileId, titleId } },
    update: {},
    create: { profileId: session.profileId, titleId, addedAt: new Date() },
  })
  revalidatePath('/my-list')
  return { success: true, data: undefined }
}
```

**Thin-adapter pattern:** Services contain the business logic; actions are thin adapters that call services and return `ActionResult`.

### Subscription Action (Phase 2 placeholder)

```typescript
// src/modules/billing/actions.ts
export async function subscribeToPlan(
  planId: string,
): Promise<ActionResult<{ checkoutUrl: string }>> {
  // Phase 1: just update accounts.plan_id directly (dummy checkout)
  // Phase 2: create Razorpay order; return checkout URL
  // NOTE: No card fields ever accepted here — payment is handled by Razorpay redirect
}
```

---

## System, Health & Documentation Endpoints

### `GET /api/health/live`

Process-level liveness probe. Verifies that the Node.js/Next.js HTTP server process is running and accepting requests.

- **Access:** Public
- **Checks:** Zero external subsystem dependency checks (avoids false-positive restarts if DB is momentarily unavailable).
- **Response 200 OK:**
  ```json
  { "status": "ok", "uptime": 124.5, "timestamp": "2026-09-30T00:00:00.000Z" }
  ```

### `GET /api/health/ready`

Subsystem readiness probe for ingress routers and deployment controllers.

- **Access:** Public
- **Checks:**
  - Neon PostgreSQL: executes `SELECT 1` via `health.dal.ts`
  - Redis: executes `PING` expecting `PONG`
- **Response 200 OK (Healthy):**
  ```json
  {
    "status": "ready",
    "checks": { "database": "up", "redis": "up" },
    "timestamp": "2026-09-30T00:00:00.000Z"
  }
  ```
- **Response 503 Service Unavailable (Degraded):**
  ```json
  {
    "status": "degraded",
    "checks": { "database": "down", "redis": "up" },
    "timestamp": "2026-09-30T00:00:00.000Z"
  }
  ```

### `GET /api/docs`

Interactive Swagger UI documentation explorer. Renders dark-theme Swagger UI with authorization modal for JWT testing.

- **Access:** Public
- **Content-Type:** `text/html; charset=utf-8`

### `GET /api/docs/spec`

Machine-readable OpenAPI 3.1 JSON specification.

- **Access:** Public
- **Content-Type:** `application/json`

---

## Missing Endpoints Added

| Endpoint                             | Purpose                                         |
| ------------------------------------ | ----------------------------------------------- |
| `GET /api/auth/me`                   | Client-side session hydration                   |
| `GET /api/auth/heartbeat`            | Session keepalive during playback               |
| `POST /api/auth/pin/verify`          | Parental PIN check (returns pin-cleared cookie) |
| `PUT /api/auth/pin`                  | Set / change parental PIN                       |
| `GET /api/history`                   | Watch history rail                              |
| `DELETE /api/history/:titleId`       | Remove from history                             |
| `GET /api/rails`                     | Home page billboard + static rails              |
| `GET /api/rails/top-10`              | Top-10 by 7-day play count                      |
| `GET /api/genres`                    | All genre slugs (for browse pages)              |
| `GET /api/plans`                     | All plan definitions (for /plans page)          |
| `POST /api/admin/content/:id/images` | Thumbnail / poster upload                       |
| `GET /api/hls/:assetId/[...path]`    | HLS manifest proxy + segment proxy              |
| `GET /api/health/live`               | Process liveness probe                          |
| `GET /api/health/ready`              | Subsystem readiness probe (Postgres + Redis)    |
| `GET /api/docs`                      | Swagger UI interactive API explorer             |
| `GET /api/docs/spec`                 | OpenAPI 3.1 JSON specification                  |

---

## Open Questions

| #   | Status    | Question                                                                                                               |
| --- | --------- | ---------------------------------------------------------------------------------------------------------------------- |
| OQ1 | ✅ Closed | API versioning: no versioning in Phase 1 (internal API). Add `/api/v2/*` when a mobile client needs a stable contract. |
| OQ2 | Open      | Should autocomplete results be personalised (filter to entitled content only)? Default: yes — apply visibilityScope.   |
| OQ3 | ✅ Closed | Card fields (payment details) are never accepted in subscribeToPlan — Razorpay handles collection.                     |

---

## Risks

| Risk                                                          | Impact | Mitigation                                                                                                                     |
| ------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Profile-ownership bypass (foreign profile ID accepted)        | High   | Every profile endpoint calls `validateProfileOwnership(profileId, accountId)` → 404 if mismatch                                |
| sendBeacon body not read (Content-Type mismatch)              | Medium | Route Handler checks `Content-Type`; `sendBeacon` defaults to `text/plain` — use `new Blob([body], {type:'application/json'})` |
| Race condition: two tabs upsert watch_progress simultaneously | Low    | `ON CONFLICT DO UPDATE` with `$executeRaw` is atomic; last write wins                                                          |
| Anonymous events without anonymousId                          | Low    | Handler ignores events missing both profileId and anonymousId                                                                  |
| Admin endpoint accessible without DAL check                   | High   | Every admin handler calls `requireAdmin()` on the first line; proxy check is defence layer, not sole guard                     |

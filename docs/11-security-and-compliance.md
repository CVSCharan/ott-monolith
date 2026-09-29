# 11 – Security & Compliance

> **Stack:** Next.js 16 App Router · Postgres · Prisma · MinIO/R2 · FFmpeg (Docker)  
> **Standards:** OWASP Top 10 (2021) · STRIDE · GDPR basics · DPDPA (India) basics  
> **Version:** v1-draft · 2026-09-29

---

## STRIDE Threat Model

STRIDE applied to the six major attack surfaces: Auth, API, Video Pipeline, Admin, Storage, and Database.

### S – Spoofing

| Threat                                     | Where                     | Control                                                                                                                                                                                                                      | Status |
| ------------------------------------------ | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Password brute-force / credential stuffing | `POST /api/auth/login`    | Rate limit: 10 req/15 min per IP **and** 5 req/15 min per account (email) via Redis. Dummy-hash Argon2id verification executed on unknown emails to prevent timing attacks. Fail-closed auth limits if Redis is unreachable. | MVP    |
| Account enumeration via signup timing      | `POST /api/auth/signup`   | Async email uniqueness check uses constant-time comparison; rate limit: 5/IP/hour; normalise email (`lower(email)`) before check                                                                                             | MVP    |
| Bot-driven account creation                | Signup flow               | CAPTCHA (hCaptcha) on signup — server-side verify only (no client key in client bundle)                                                                                                                                      | P2     |
| Forged JWT access token                    | Every authenticated route | JWT verified in `proxy.ts` using HS256 + 32-byte secret; short expiry (15 min); signature checked before any DB hit                                                                                                          | MVP    |
| Refresh token reuse (family attack)        | `POST /api/auth/refresh`  | Family-based rotation: reuse detected → revoke entire family → force re-login; 5-second grace window for parallel requests                                                                                                   | MVP    |
| Cookie theft via XSS                       | Browser cookies           | `httpOnly`, `Secure`, `SameSite=Lax` on all auth cookies; `Path=/api/auth` for refresh token with client-driven refresh                                                                                                      | MVP    |
| Admin impersonation                        | `/api/admin/*`            | `role='admin'` checked in **both** `proxy.ts` **and** `requireAdmin()` DAL call (defence-in-depth)                                                                                                                           | MVP    |

### T – Tampering

| Threat                                    | Where                  | Control                                                                                                                        | Status |
| ----------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------ |
| HLS URL forgery (access premium segments) | `/api/hls/*`           | HMAC-SHA256 token on every URL; token validated before proxying; timing-safe comparison (`timingSafeEqual`)                    | MVP    |
| Request body tampering                    | All Route Handlers     | Zod schema validation on every input; 422 on any unexpected field                                                              | MVP    |
| SQL injection                             | Prisma + `$executeRaw` | Prisma parameterises all queries; raw SQL uses tagged templates (never string concatenation)                                   | MVP    |
| Content metadata tampering                | Admin endpoints        | `requireAdmin()` guard; input sanitised (strip HTML in text fields)                                                            | MVP    |
| Signed multipart URL reuse                | S3 multipart upload    | Each part URL expires in 30 min; `CompleteMultipartUpload` is server-side + HEAD-verified; assetId is a server-generated UUID  | MVP    |
| FFmpeg input injection                    | Transcode worker       | `ffprobe` validates container/codecs; magic-byte `ftyp` check; forced `-f mp4` demuxer; `-protocol_whitelist file,pipe,crypto` | MVP    |

### R – Repudiation

| Threat                                   | Where             | Control                                                                                                         | Status |
| ---------------------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------- | ------ |
| Admin denies publishing/deleting content | Admin CMS         | **Admin audit log:** all admin mutations write to `admin_audit_log` table (who, what, when, before/after state) | MVP    |
| User denies subscribing                  | Billing           | `subscriptions` table row created at subscribe time with `account_id`, `plan_id`, `created_at`; immutable       | MVP    |
| PIN attempt disputes                     | Parental controls | `parental_pin_events` logs every attempt with IP and timestamp                                                  | MVP    |
| Play event disputes                      | Analytics         | `play_events.occurred_at` is server-set; client timestamp trusted for ordering only                             | MVP    |

### I – Information Disclosure

| Threat                                    | Where              | Control                                                                                                                             | Status |
| ----------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Secrets in client bundle                  | All                | No `NEXT_PUBLIC_*` for secrets; no signing keys, DB URLs, or API keys imported in `'use client'` files                              | MVP    |
| Premium content URLs without auth         | HLS Route Handler  | HMAC token required; bucket not publicly accessible; tokens expire                                                                  | MVP    |
| User PII in error responses               | All error handlers | Generic error messages to client; full error only in `logger.error()`; never stack traces in production responses                   | MVP    |
| Admin endpoints accessible to users       | `/api/admin/*`     | Role check in proxy AND in DAL; returns 404 (not 403) if user role → prevents admin route discovery                                 | MVP    |
| Foreign profile data accessible           | Profile endpoints  | `validateProfileOwnership()` returns 404 (not 403) for foreign profile IDs                                                          | MVP    |
| Search results leaking unlicensed content | `GET /api/search`  | `visibilityScope()` applied to every content query; plan-gated                                                                      | MVP    |
| Worker container egress to internet       | Transcode worker   | Allowlisted egress firewall: only MinIO/R2 and Postgres directUrl reachable. Generic internet and cloud metadata endpoints blocked. | MVP    |

### D – Denial of Service

| Threat                                   | Where              | Control                                                                                                               | Status |
| ---------------------------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------- | ------ |
| Rate limit bypass on auth                | Auth endpoints     | Redis token bucket per IP + per account (dual check); fail-closed or Postgres fallback; `Retry-After` header returned | MVP    |
| Large file upload abuse                  | Multipart initiate | Max `sizeBytes: 10 GB` enforced server-side before generating upload ID; rate limit: 5 initiates/account/hour         | MVP    |
| Scratch storage exhaustion               | Transcode worker   | Bounded 50 GB host disk volume (not RAM/tmpfs) sized for 10 GB source uploads                                         | MVP    |
| Slow FFmpeg job starving worker          | Transcode worker   | `expireInSeconds: 7200`; Docker CPU: 2 cores max, Memory: 2 GB max; SIGTERM on timeout                                | MVP    |
| Unlimited API response size              | List endpoints     | Cursor pagination; max `limit=100` enforced; play events batch max 50                                                 | MVP    |
| Malformed container / decompression bomb | Upload             | Magic-byte check, `ffprobe` format validation, and capped file size                                                   | MVP    |
| SQL query amplification                  | Search             | Full-text search with `LIMIT 50`; trgm search with `similarity > 0.3` threshold                                       | MVP    |

### E – Elevation of Privilege

| Threat                                 | Where            | Control                                                                                                                        | Status |
| -------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------ |
| User escalating to admin               | API              | `role` checked in proxy (JWT claim) AND in `requireAdmin()` (DB read); JWT claim alone is not sufficient (DB is authoritative) | MVP    |
| Non-admin uploading content            | Admin upload     | `requireAdmin()` in all `/api/admin/*` handlers                                                                                | MVP    |
| FFmpeg running as root                 | Worker container | `USER node` in Dockerfile; `cap_drop: ALL`; read-only root filesystem                                                          | MVP    |
| Prisma exposed to cross-module leakage | Module internals | ESLint boundary rules: only `*.dal.ts` may import Prisma; CI gate                                                              | MVP    |
| Server Action called without auth      | Server Actions   | `requireSession()` or `requireAdmin()` is the first `await` in every action                                                    | MVP    |

---

## FFmpeg Worker Sandboxing

```dockerfile
# Dockerfile.worker (security requirements)
FROM node:20-alpine
RUN apk add --no-cache ffmpeg

# Non-root user
RUN addgroup -S worker && adduser -S worker -G worker
USER worker

# Read-only root filesystem; bounded scratch volume mounted at /var/lib/streamforge/scratch
WORKDIR /app
VOLUME ["/var/lib/streamforge/scratch"]
```

```yaml
# docker-compose.yml (security constraints)
worker:
  security_opt:
    - no-new-privileges:true
  cap_drop:
    - ALL
  read_only: true # root filesystem is read-only
  volumes:
    # Bounded host disk volume sized for 10 GB sources (~50 GB scratch space, never RAM/tmpfs)
    - worker-scratch:/var/lib/streamforge/scratch
  networks:
    - allowlisted-egress # allowlisted egress only: MinIO/R2 and Postgres directUrl
  deploy:
    resources:
      limits:
        cpus: '2.0'
        memory: '2G'

volumes:
  worker-scratch:
    driver: local
```

**Network policy:** Egress firewall restricts container networking strictly to object storage (`minio:9000` locally or R2 HTTPS endpoint in production) and Postgres direct connection (`postgres:5432`). Cloud metadata endpoints (`169.254.169.254`) and arbitrary external IPs are dropped.

**FFmpeg Input Hardening:**

1. **Magic-Byte Header Check:** Prior to spawning FFmpeg, the worker inspects the uploaded file's first 8 bytes. For MP4, bytes 4..7 must equal `ftyp` (ISO Base Media File Format).
2. **Forced Demuxer:** FFmpeg is invoked with `-f mp4` to prevent arbitrary format autodetection.
3. **Protocol Whitelist:** FFmpeg is executed with `-protocol_whitelist "file,pipe,crypto"` to block SSRF and remote playlist exploitation.

---

## Security Headers (HTTP)

Configured via `next.config.ts` `headers()`:

> **CSP Architecture Decision:** A **Hash/SRI-based Content-Security-Policy** is chosen over dynamic per-request nonces. Nonces force dynamic rendering on every request and are incompatible with ISR-cached and Edge-cached public shell pages (like `/`, `/browse`, and `/title/[slug]`). Hashes and Subresource Integrity (SRI) permit full CDN caching while rigorously preventing unauthorized script injection.

```typescript
// next.config.ts
const securityHeaders = [
  // Aligned with frame-ancestors 'none' to block clickjacking completely
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-XSS-Protection', value: '0' }, // CSP is authoritative
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // 1 year max-age, includeSubDomains; NO preload yet (avoid premature HSTS preload list commitment)
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Hash/SRI-based script execution; no per-request nonce so shell remains edge-cacheable
      "script-src 'self' 'unsafe-inline'", // tighten with build-time hashes in Phase 2
      "style-src 'self' 'unsafe-inline'", // Tailwind CSS v4 custom properties
      // Image origins: self, local MinIO, Cloudflare R2 / CDN, and sample asset hosts
      "img-src 'self' data: blob: http://localhost:9000 http://127.0.0.1:9000 https://*.r2.cloudflarestorage.com https://*.streamforge.io https://commondatastorage.googleapis.com",
      // Media origins for HLS playback chunks
      "media-src 'self' blob: http://localhost:9000 http://127.0.0.1:9000 https://*.r2.cloudflarestorage.com https://*.streamforge.io",
      // Connect origins for API, QoS beacons, MinIO, and R2 multipart uploads
      "connect-src 'self' http://localhost:9000 http://127.0.0.1:9000 https://*.r2.cloudflarestorage.com https://*.streamforge.io",
      // Self-hosted fonts via next/font; fonts.gstatic.com is dropped completely
      "font-src 'self' data:",
      // Aligned with X-Frame-Options: DENY
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      'upgrade-insecure-requests',
    ].join('; '),
  },
]
```

---

## Bot Protection on Auth

**Phase 1 (MVP):** Redis rate limiting (dual: IP + account).  
**Phase 2:** hCaptcha invisible challenge on signup + login (server-side verify via `POST https://hcaptcha.com/siteverify`). No captcha JS loaded until challenge triggered.

**Credential stuffing detection (Phase 2):** Monitor for > 100 failed logins per IP per hour → auto-block IP in Redis + alert.

---

## Admin Audit Log

```sql
-- migration: 0xxx_admin_audit_log.sql
CREATE TYPE audit_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

CREATE TABLE admin_audit_log (
  id           BIGINT         GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  account_id   UUID           NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  action       TEXT           NOT NULL,  -- e.g. 'publish_title', 'delete_title', 'ban_account', 'change_plan'
  resource     TEXT           NOT NULL,  -- e.g. 'title:uuid', 'account:uuid', 'rail:uuid'
  priority     audit_priority NOT NULL DEFAULT 'MEDIUM',
  before_state JSONB,                    -- snapshot before change (NULL for creates)
  after_state  JSONB,                    -- snapshot after change (NULL for deletes)
  ip_address   TEXT,
  user_agent   TEXT,
  occurred_at  TIMESTAMPTZ    NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_account ON admin_audit_log(account_id, occurred_at DESC);
CREATE INDEX idx_audit_log_resource ON admin_audit_log(resource, occurred_at DESC);
CREATE INDEX idx_audit_log_priority ON admin_audit_log(priority, occurred_at DESC);
```

### Audit Priority Levels

- **`CRITICAL`:** Account suspension/ban, privilege escalation, hard deletion of master assets or published titles.
- **`HIGH`:** Publishing/unpublishing catalog titles, admin force-upgrading user plan tier, parental PIN administrative reset.
- **`MEDIUM`:** Updating home rails, modifying title metadata/genres, manually re-enqueueing transcode jobs.
- **`LOW`:** Generating analytics exports, viewing compliance reports.

---

## No Default Credentials

| Control             | Implementation                                                                   |
| ------------------- | -------------------------------------------------------------------------------- |
| Admin password      | From `SEED_ADMIN_PASSWORD` env var; seed script throws if unset                  |
| MinIO credentials   | `MINIO_ROOT_USER` + `MINIO_ROOT_PASSWORD` from env; docker-compose uses env file |
| JWT signing secret  | `JWT_SIGNING_SECRET` — 32-byte hex, generated per environment; never committed   |
| HLS signing secret  | `HLS_SIGNING_SECRET` — 32-byte hex, generated per environment                    |
| Default DB password | Randomised per `docker compose up`; stored in `.env.local` (gitignored)          |
| `.env.example`      | Contains only placeholder values; never real secrets                             |

---

## Account Sharing / Concurrent Streams

Real-time concurrent stream limiter is implemented in `src/modules/video/service.ts` and `src/modules/video/dal.ts` (US-304):

- **Plan Quotas:**
  - **Free:** 1 concurrent stream
  - **Standard:** 2 concurrent streams
  - **Premium:** 4 concurrent streams
- **Dual-Tier State Validation:**
  - **Redis Cache:** High-speed atomic key `stream:{accountId}:{sessionId}` with 60-second TTL updated on every heartbeat.
  - **PostgreSQL Persistence:** `playback_sessions` table (`account_id`, `profile_id`, `title_id`, `device_type`, `started_at`, `last_heartbeat_at`, `ended_at`). Active sessions have `ended_at IS NULL` and `last_heartbeat_at >= NOW() - 60s`.
- **Enforcement & Rejection Contract:**
  - `POST /api/playback-sessions`: Atomically validates quota before playback begins. If active streams $\ge$ plan allowance, responds with HTTP `409 Conflict` (`CONCURRENT_STREAM_LIMIT_EXCEEDED`) including metadata on active streaming devices so the client can prompt remote session termination.
  - `POST /api/playback-sessions/:id/heartbeat`: Player heartbeat ping refreshed every 15–30s. If the session was remotely terminated or expired, returns HTTP `410 Gone`.
  - `DELETE /api/playback-sessions/:id`: Explicit termination releases the concurrency slot immediately.
  - Server Actions: `terminatePlaybackSessionAction` and `getActivePlaybackSessionsAction` guarded with `requireSession()`.

---

## GDPR / DPDPA Basics

| Requirement       | Implementation                                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------------------------- |
| Data minimisation | `play_events` has no PII beyond `profile_id` (UUID); `user_agent` retained for QoE only                             |
| Retention limits  | `play_events`: 90 days; `parental_pin_events`: 30 days; `refresh_tokens`: 30 days + 1 day grace                     |
| Right to erasure  | Soft-delete `accounts` (`deleted_at`); hard-delete job at 30 days; all `play_events(profile_id=X)` deleted          |
| Data export       | `GET /api/account/export` → returns JSON of account + profile + watch_progress + ratings (Phase 2; MVP returns 501) |
| Cookie consent    | Cookie consent banner (Vaul component); analytics only after consent                                                | P2                 |
| Privacy policy    | See doc 16-legal-and-trust.md                                                                                       | Needs legal review |

---

## Open Questions

| #   | Status  | Question                                                                                             |
| --- | ------- | ---------------------------------------------------------------------------------------------------- |
| OQ1 | 🔵 Open | Phase 2 hCaptcha: invisible or visible challenge on login after N failed attempts?                   |
| OQ2 | 🔵 Open | Admin audit log: should `before_state` / `after_state` be JSONB snapshots or just field diffs?       |
| OQ3 | 🔵 Open | CSP `style-src 'unsafe-inline'` needed for Tailwind inline styles — switch to hash-based in Phase 2? |

---

## Risks

| Risk                              | Impact | Mitigation                                                                                |
| --------------------------------- | ------ | ----------------------------------------------------------------------------------------- |
| JWT signing secret rotation       | High   | Rotate requires all users re-login; dual-key verification window needed for zero-downtime |
| Redis rate limiter goes down      | Medium | Fail-open (allow request) with alerting — better than locking all users out               |
| Admin audit log grows unboundedly | Low    | Retention job: delete records older than 2 years                                          |
| FFmpeg CVE in Alpine package      | Medium | Pin Alpine version + weekly `apk upgrade` in CI; subscribe to Alpine security advisories  |

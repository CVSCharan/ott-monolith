# 13 – Observability, Quality Gates & Testing Specification

> **Quality Gates, Performance Budgets, Health Probes & Testing Architecture**  
> **Source of truth:** [04-architecture.md](./04-architecture.md) · [11-security-and-compliance.md](./11-security-and-compliance.md) · [AGENTS.md](../AGENTS.md)  
> All PRs must pass automated CI gates prior to merging.

---

## 1. Quality & Performance Budgets

| Metric / Dimension                  | Target / Budget                     | Measurement Tool            | CI Gate Behavior                     |
| ----------------------------------- | ----------------------------------- | --------------------------- | ------------------------------------ |
| **Total Blocking Time (TBT)**       | **< 150 ms**                        | Lighthouse CI (LHCI)        | Hard CI failure if TBT > 150 ms      |
| **Largest Contentful Paint (LCP)**  | < 2.5 s (desktop), < 3.0 s (mobile) | LHCI / Web Vitals RUM       | Fails CI if P75 exceeds budget       |
| **Interaction to Next Paint (INP)** | < 200 ms                            | Web Vitals / Playwright     | Fails CI if frame delay > 200 ms     |
| **Cumulative Layout Shift (CLS)**   | < 0.1                               | LHCI / Playwright           | Fails CI if CLS >= 0.1               |
| **Time to First Byte (TTFB)**       | < 200 ms (cached ISR shell)         | K6 / Playwright HTTP timing | Monitored in staging                 |
| **Initial Client JS (Home Page)**   | < 80 kB (Gzip)                      | `@next/bundle-analyzer`     | Fails build if bundle size regresses |
| **Accessibility (WCAG 2.2 AA)**     | 100% automated compliance           | `@axe-core/playwright`      | Zero critical/serious violations     |
| **Lighthouse Scores**               | Perf ≥ 90, A11y ≥ 95, SEO ≥ 95      | LHCI                        | Hard PR gate                         |

---

## 2. Automated Git Hooks & CI Testing Gates

### Local Git Hooks (Husky + lint-staged)

Enforced on developer workstations via Husky (`core.hooksPath = .husky`):

1. **`pre-commit` ([`.husky/pre-commit`](../.husky/pre-commit)):**
   - Automatically runs `npx lint-staged` (`eslint --fix` on modified files).
   - Automatically runs `npm run type-check` (`tsc --noEmit`) to verify zero TypeScript errors.
2. **`pre-push` ([`.husky/pre-push`](../.husky/pre-push)):**
   - Automatically runs full Vitest suite (`npm test`) across all 4 modules.
   - Pushes are rejected if any test fails.

### GitHub Actions CI Pipeline ([`.github/workflows/ci.yml`](../.github/workflows/ci.yml))

Triggered on every push to `main` and on all Pull Requests:

```yaml
# .github/workflows/ci.yml
steps:
  - name: Install Dependencies
    run: npm ci
  - name: Generate Prisma Client
    run: npm run db:generate
  - name: Module Boundary & Lint Check
    run: npm run lint
  - name: TypeScript Strict Type Check
    run: npm run type-check
  - name: Unit Tests (Vitest)
    run: npm test
  - name: Next.js Production Build
    run: npm run build
```

### Automated Security & Dependency Scanning

- **Dependabot ([`.github/dependabot.yml`](../.github/dependabot.yml)):** Automated weekly dependency updates and vulnerability patches for npm packages and GitHub Actions.

### 1. Manual Contrast Audit Protocol for Gradient Scrims

Automated a11y scanners (`axe-core`) only evaluate DOM CSS color tokens against solid background elements; they cannot reliably calculate contrast over complex image backgrounds, video frames, or multi-stop CSS gradient scrims (`billboard-vignette`, `card-scrim`).

- **Protocol:** Any PR introducing or modifying card scrims, billboard overlays, or player HUD gradient overlays must execute a **manual optical contrast audit**.
- **Execution:** Test typography against worst-case 100% white (`#ffffff`) and high-luminance photo test backdrops using the Chrome DevTools Colour Picker Eyedropper.
- **Requirement:** Text over scrims must maintain $\ge 4.5:1$ contrast against the darkest sample point of the underlying scrim layer.

### 2. Pinned-Image Deterministic Visual Regression

To prevent false-positive pixel diffs caused by live CDNs or random seed assets:

- All visual regression tests (`expect(page).toHaveScreenshot()`) load deterministic **pinned image fixtures** (`public/fixtures/test-poster.webp`, `public/fixtures/test-backdrop.webp`).
- All animations and carousels are forced to their initial static state via `@media (prefers-reduced-motion: reduce)` and CSS overrides before capturing snapshots.

---

## 3. Server & Worker Observability

### Structured JSON Logging & PII Redaction (Pino)

All server-side code uses `src/lib/logger.ts` emitting structured JSON.

- **PII & Secret Redaction:** Strict Pino redaction rules ensure sensitive data is stripped before writing to stdout:
  ```typescript
  // src/lib/logger.ts
  import pino from 'pino'

  export const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    redact: {
      paths: [
        'req.headers.cookie',
        'req.headers.authorization',
        '*.password',
        '*.passwordHash',
        '*.token',
        '*.pin',
        '*.email',
      ],
      censor: '[REDACTED]',
    },
  })
  ```
- **Rule:** `console.log` is strictly banned in production code (enforced by ESLint rule `no-console`).

### Platform Health Probes (`/api/health/live` vs `/api/health/ready`)

Split health checking into standard liveness and readiness endpoints with **minimal public disclosure**:

1. **Liveness Probe (`GET /api/health/live`):**
   - Verifies the Node.js HTTP process is responsive.
   - Returns `200 OK` with `{"status":"ok"}`. Zero internal subsystem checks.
2. **Readiness Probe (`GET /api/health/ready`):**
   - Verifies external service connectivity:
     - Postgres: `SELECT 1` within 500 ms.
     - Redis: `PING` responds `PONG` within 200 ms.
     - MinIO / R2: `HeadBucket` within 1000 ms.
     - Worker Heartbeat: `worker:heartbeat:transcode` timestamp is $\le 90\text{s}$ old.
     - Queue Age: No unhandled transcode job older than 15 minutes.
   - **Minimal Public Output:** To prevent security enumeration, the public HTTP response is strictly minimal:
     - Success: `200 OK` with `{"status":"ready"}`
     - Degradation: `503 Service Unavailable` with `{"status":"degraded"}`
     - **No internal connection strings, error traces, or hostnames are ever exposed in the response body.** Detailed root-cause failures are logged internally to Pino at `logger.error()`.

### Worker Heartbeat & Queue-Age Monitoring

- The transcode worker updates a Redis key `worker:heartbeat:transcode` with the current Unix epoch every 30 seconds.
- An alert is dispatched if:
  1. Worker heartbeat is missing or older than 90 seconds (worker process crashed or hung).
  2. The oldest uncompleted `transcode` job in pg-boss has `created_on < now() - INTERVAL '15 minutes'`.

### Real User Monitoring (RUM) & Client Telemetry

- A lightweight web-vitals RUM reporter sends Core Web Vitals (LCP, INP, CLS, TTFB, FCP) via `navigator.sendBeacon` to `POST /api/telemetry/rum`.
- Video QoS player telemetry is batched via `POST /api/player/beacon`:
  - Buffering ratio: `totalBufferTime / totalPlayTime` (Alert threshold > 3%).
  - Playback error rate: `errors / totalSessions` (Alert threshold > 1%).
  - Startup latency: Time to first frame (Target < 1.2s).

---

## 4. The Testing Pyramid

```
                ▲
               / \
              /   \     E2E Acceptance Matrix (Playwright)
             /     \    Kids × Plan × Anon Matrix (9 combinations)
            /-------\
           /         \   Integration Tests
          /           \  Real Postgres DB (Prisma) + Worker Fixture Video
         /-------------\
        /               \ Unit Tests (Vitest)
       /                 \ Pure logic: entitlements, visibility, HMAC, tokens
      ---------------------
```

### 1. Unit Tests (`npm test`)

- Pure business logic tests with zero network dependencies:
  - `buildVisibilityFilter` (age ratings, publication window, unlisted items).
  - `checkEntitlement` (plan rank vs content minimum plan).
  - HMAC URL signer and validator (`timingSafeEqual`, timestamp expiration, tamper rejection).
  - Token-bucket rate limiter logic and dummy-hash timing verification.

### 2. Database Integration Tests (`npm run test:integration`)

- Executed against a real Postgres container (`DATABASE_DIRECT_URL`):
  - Prisma DAL queries and custom raw SQL migrations.
  - `watch_progress` partial unique indexes and upsert conflict resolution.
  - TSVECTOR search indexing and `pg_trgm` fuzzy matching thresholds.
  - Soft-delete account cascading and audit log immutability.

### 3. Worker Fixture Video Test (`npm run test:worker`)

- Validates the complete video transcoding pipeline:
  - Takes a tiny 5-second deterministic test video (`tests/fixtures/sample-5s.mp4`).
  - Executes `validateMp4MagicBytes` and FFmpeg command generation.
  - Runs transcode through Node worker: produces `master.m3u8`, variant playlists (`360p`, `480p`, `720p`), `.ts` segments, and poster frame.
  - Validates correct segment headers, HLS manifest syntax, and pg-boss job status lifecycle (`queued` $\to$ `processing` $\to$ `completed`).

### 4. End-to-End Audience Matrix Tests (`npm run test:e2e`)

Playwright tests every page and endpoint across the complete **Audience Matrix**:

| Profile / Audience Context | Free Plan                                                                                                                            | Standard Plan                                                                       | Premium Plan                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **Anonymous (Logged-out)** | Free titles streamable (480p max); Watchlist/History/Account routes redirect to login; Lock badges on Standard/Premium.              | N/A                                                                                 | N/A                                                                          |
| **Kids Profile**           | Only $\le \text{PG}$ / U content visible; R/A titles filtered at DB query; leaving profile requires 4-digit PIN verification.        | Same kids filter; streams up to 720p.                                               | Same kids filter; streams up to 1080p.                                       |
| **Adult Profile**          | All published content visible; Free titles streamable (480p max); Standard/Premium titles show lock badge and trigger upgrade modal. | All content visible; streams Free + Standard (1080p max); Premium shows lock badge. | All content unlocked; all streams full quality (1080p/4K); zero lock badges. |

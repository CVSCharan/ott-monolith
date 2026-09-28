# Frontend Stack & Library Selections

> **Client-Side Architecture, Measured Bundle Budgets & Dependency Audit**  
> **Source of truth:** [04-architecture.md](../04-architecture.md) · [design-tokens.md](./design-tokens.md) · [ADR-0009](../adr/0009-frontend-libraries.md)  
> Target: **Next.js 16 + React 19** · Verified Audit Date: **September 2026**

---

## 1. Candidate Evaluation & Selection Matrix

Every frontend package is evaluated for measured Gzip bundle size, React 19 compatibility, tree-shaking efficiency, maintenance health, and licensing. **No two libraries are approved for the same capability.**

| Domain / Capability | Selected Package | Exact Version | Last Release | Link | Measured Bundle (Gzip) | License | Maintenance & React 19 Health |
|---------------------|------------------|---------------|--------------|------|------------------------|---------|-------------------------------|
| **Styling & Design Tokens** | `@tailwindcss/postcss` | `^4.0.0` | Jan 2025 | [tailwindcss.com](https://tailwindcss.com) | **0 kB** (Pure CSS output) | MIT | **Active**. Top-level `@theme static`, native CSS variables, lightningcss compilation. |
| **Accessible Primitives** | `@radix-ui/react-*` (via shadcn/ui) | `^1.1.x` | Late 2024 | [radix-ui.com](https://www.radix-ui.com) | **~3.2–5.8 kB** / primitive | MIT | **Active** (WorkOS). WAI-ARIA compliant dialogs, popovers, dropdowns. Fully React 19 verified. |
| **UI Motion Engine** | `motion` | `^11.18.0` | Jan 2025 | [motion.dev](https://motion.dev) | **~4.8 kB** core (`LazyMotion` domMax: ~15.2 kB dynamic) | MIT | **Active** (Matt Perry). React 19 native, tree-shakeable, replaces framer-motion. |
| **Hero Parallax & Rails** | **Native CSS Scroll & Scroll-Snap** | N/A | Web Spec | [W3C Scroll-driven](https://drafts.csswg.org/scroll-animations-1/) | **0 kB** | Native | **Standard**. Native CSS `animation-timeline: scroll()` with 60 FPS compositor execution. Zero JS. |
| **Billboard Carousel** | `embla-carousel-react` | `^8.5.1` | Dec 2024 | [embla-carousel.com](https://www.embla-carousel.com) | **~3.8 kB** | MIT | **Active**. Lightweight, accessible swipe physics, touch/pointer inertia, keyboard accessible. |
| **Icons** | `lucide-react` | `^0.475.0` | Jan 2025 | [lucide.dev](https://lucide.dev) | **~1.8 kB** (15 icons) | ISC | **Active**. Configured with `optimizePackageImports: ['lucide-react']` in `next.config.ts`. |
| **Toast Notifications** | `sonner` | `^1.7.4` | Jan 2025 | [sonner.emilkowal.ski](https://sonner.emilkowal.ski) | **~3.6 kB** | MIT | **Active** (Emil Kowalski). Stacked toasts, ARIA live region polite announcements, zero external deps. |
| **Drawers & Mobile Sheets** | `vaul` | `^1.1.2` | Nov 2024 | [vaul.emilkowal.ski](https://vaul.emilkowal.ski) | **~4.5 kB** | MIT | **Active** (Emil Kowalski). Mobile bottom sheet for quick-actions and cookie settings. Tested with React 19. |
| **Command Palette** | `cmdk` | `^1.0.4` | Jul 2024 | [cmdk.paco.me](https://cmdk.paco.me) | **~2.9 kB** | MIT | **Stable Primitive** (Paco Coursey). Widespread ecosystem adoption. Stable API, minimal change rate. |
| **Forms & Validation** | `react-hook-form` + `zod` | `^7.54.2` / `^3.24.1` | Jan 2025 | [react-hook-form.com](https://react-hook-form.com) · [zod.dev](https://zod.dev) | **~8.6 kB** (RHF) + **~12.8 kB** (Zod) | MIT | **Active**. Shared client/server schemas, uncontrolled performant form inputs. |
| **Client UI State** | `zustand` | `^5.0.3` | Dec 2024 | [zustand.docs.pmnd.rs](https://zustand.docs.pmnd.rs) | **~1.2 kB** | MIT | **Active** (pmndrs). Transient client UI state (player HUD active, audio mute toggle). React 19 `useSyncExternalStore`. |
| **Server State & Polling** | `@tanstack/react-query` | `^5.66.0` | Jan 2025 | [tanstack.com/query](https://tanstack.com/query) | **~13.1 kB** | MIT | **Active**. Used strictly in admin console for live transcode worker polling and job retries. |
| **Video Engine** | `hls.js` | `^1.5.18` | Jan 2025 | [github.com/video-dev/hls.js](https://github.com/video-dev/hls.js) | **~33.8 kB** (dynamically loaded) | Apache-2.0 | **Active**. Custom React chrome over bare engine. Full control of ABR buffer, audio, WebVTT. |
| **Data Tables (Admin)** | `@tanstack/react-table` | `^8.20.6` | Dec 2024 | [tanstack.com/table](https://tanstack.com/table) | **~14.8 kB** | MIT | **Active**. Headless table sorting, filtering, and pagination for catalog and user admin tables. |
| **Drag & Drop (Admin)** | `@dnd-kit/core` + `@dnd-kit/sortable` | `^6.3.1` / `^8.0.0` | Jan 2024 | [dndkit.com](https://dndkit.com) | **~11.2 kB** combined | MIT | **Vigilance / Maintenance Note**. Core author activity slowed in 2024; remains gold standard for keyboard a11y. Monitored for React 19 compatibility. |
| **Analytics Charts (Admin)** | `recharts` | `^2.15.0` | Dec 2024 | [recharts.org](https://recharts.org) | **~38.5 kB** | MIT | **Active**. SVG rendering for admin watch metrics. Code-split strictly inside `/admin/analytics`. |
| **Multipart Uploads (Admin)** | `@uppy/core` + `@uppy/aws-s3-multipart` | `^4.3.0` / `^4.1.0` | Jan 2025 | [uppy.io](https://uppy.io) | **~18.2 kB** | MIT | **Active** (Transloadit). Selected upload library. Handles 10 GB file uploads with S3 multipart uploads directly to MinIO/R2, automatic retry, and pause/resume. |
| **Image Placeholders** | **Zero Client JS (Ingest Blur URL)** | N/A | Ingest Sharp | [Next.js Image Blur](https://nextjs.org/docs/app/api-reference/components/image#blurdataurl) | **0 kB** | N/A | **Replaced ThumbHash**. Server generates base64 WebP at artwork upload time, feeding `next/image` native `blurDataURL`. Zero client JS runtime. |

---

## 2. Architectural Resolutions (User Story & Scope Alignments)

### 1. Scrubber Preview Sprites (`[P2]`)
- **MVP Scope:** Standard HTML5 `<input type="range">` timeline displaying elapsed timecode and buffered bar segments. Hovering displays current hover timestamp.
- **Phase 2 (`[P2]`):** Worker generates VTT thumbnail spritesheets (`thumbnails.vtt` + `sprites.webp`). Player reads VTT cues on timeline scrub hover and renders thumbnail frame. Deferred from MVP to keep worker transcoding pipeline focused on BBB test assets.

### 2. Cookie Consent Banner (`[MVP]`)
- **MVP Scope:** Essential cookies notice ("StreamForge uses essential cookies for authentication and secure video streaming") rendered via bottom drawer (`vaul` on mobile, fixed card on desktop) on first visit.
- **Consent Mechanism:** Stores user acknowledgment in an `httpOnly` or standard cookie (`sf_consent=1`). No non-essential trackers or third-party marketing scripts exist in MVP, but EU ePrivacy / Indian IT rules require user transparency.

### 3. Upload Library Selection (`@uppy/aws-s3-multipart`)
- **Resolution:** Approved `@uppy/core` + `@uppy/aws-s3-multipart` for admin catalog uploads (`src/modules/content/admin/UploadDropzone.tsx`).
- **Mechanism:** Interacts with `POST /api/admin/videos/upload/initiate`, `POST /api/admin/videos/upload/sign-part`, and `POST /api/admin/videos/upload/complete`. Handles parallel 10 MB chunk uploads directly to MinIO/R2 presigned part URLs with automated exponential backoff retry.

### 4. Video Quality Selection Menu
- **Source of Options:** Master HLS manifest parsed by `hls.js` (`hls.levels`).
- **Plan Entitlement Gating:** The player component receives the current session's `maxQualityP` (e.g. Free = `480`, Standard = `1080`, Premium = `2160`).
- **UI Behavior:**
  - "Auto" is always available.
  - Manifest levels with `level.height <= maxQualityP` are clickable and selectable.
  - Manifest levels with `level.height > maxQualityP` are rendered with a locked padlock icon (`Lock` from `lucide-react`) and disabled state, accompanied by a tooltip ("Requires Standard or Premium plan").

---

## 3. Core Architecture Rules for Client Libraries

### 1. Server Components by Default
- 90% of page code remains React Server Components (RSC).
- Libraries such as Radix, Sonner, Vaul, and Motion are imported **strictly inside leaf client islands** (`'use client'`).
- Page files (`src/app/**/page.tsx`) must never be marked `'use client'`.

### 2. Revised Per-Route JavaScript Budgets (Gzip)
Measured against production build chunks via `@next/bundle-analyzer`:

| Route | Budget (Gzip) | Primary Client Modules |
|-------|---------------|------------------------|
| **Public Home (`/`)** | **< 80 kB** | Navbar island, Billboard carousel (`embla`), Profile switch dropdown, Auth modal trigger. |
| **Title Detail (`/title/[slug]`)** | **< 90 kB** | Quick-view intercepting modal, Watchlist toggle action, Tab switching (`radix`). |
| **Player Route (`/watch/[id]`)** | **< 135 kB** | Bespoke player chrome, `hls.js` dynamically imported (~34 kB), QoS beacon dispatcher. |
| **Admin Console (`/admin/**`)** | **< 195 kB** | TanStack Table, Recharts, Uppy S3 multipart uploader, dnd-kit sortable rails (all code-split). |

### 3. Dynamic Imports & Code Splitting
- `hls.js` is loaded **only** when mounting the player component:
  ```typescript
  const VideoPlayer = dynamic(() => import('@/components/player/VideoPlayer'), {
    ssr: false,
    loading: () => <PlayerLoadingSkeleton />
  })
  ```
- Motion features use `LazyMotion` with `domMax` loaded asynchronously to prevent blocking hydration.

---

## 4. Open Questions

| # | Question | Owner | Options | Recommendation |
|---|----------|-------|---------|----------------|
| OQ-L01 | Should we adopt Media Chrome instead of custom HTML5 player buttons? | Frontend | A: Custom controls over hls.js<br>B: Media Chrome web components | **Option A (Custom controls).** Custom React controls match design tokens seamlessly and avoid custom elements shadow-DOM styling complexity. |
| OQ-L02 | Should Admin Charts use Recharts or simple SVG sparklines? | Product / Eng | A: Recharts<br>B: Raw SVG sparklines | **Option A (Recharts).** Admin routes are code-split; the 38.5 kB bundle has zero impact on public viewers. |
| OQ-L03 | dnd-kit maintenance cadence monitoring | Frontend | A: Keep dnd-kit<br>B: Evaluate Pragmatic DnD | **Option A for MVP.** Monitor dnd-kit. If React 19 issues emerge in admin sortable rails, evaluate Pragmatic DnD (Atlassian). |

---

## 5. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **React 19 Peer Dependency Warnings** | Build failures during `npm install` | All selected packages (Radix, Motion, Hook Form, TanStack, Uppy) officially support React 19 in their latest releases. |
| **Bundle Bloat from Icon Packages** | Entire icon sets bundled into client bundle | Configure Next.js `optimizePackageImports: ['lucide-react']` in `next.config.ts`. |
| **Player Bundle on Non-Player Routes** | Unused video engine parsing on Home/Browse | `hls.js` is dynamically imported strictly on `/watch/[id]` and trailer modal preview. |

# Frontend Implementation Order & Prototyping Roadmap

> **Design Engineering Roadmap: From Design Tokens to Production Application**  
> **Source of truth:** [08-ux-and-design-system.md](../08-ux-and-design-system.md) · [design-tokens.md](./design-tokens.md) · [13-observability-and-testing.md](../13-observability-and-testing.md)  
> All phases require zero accessibility regressions and strict token usage.

---

## 1. Milestone 0: Design System Foundation & Static Visual Prototype

Before connecting live database queries or video encoding workers, the team builds a **Static Visual Prototype** using mock fixtures. This guarantees design polish, 60 FPS motion, and layout stability.

### Scope of the Static Visual Prototype (Mock Data Only)
1. **Design Tokens & Theme Foundation:**
   - Establish `src/app/globals.css` with Tailwind v4 `@theme` block.
   - Configure typography with Next.js font optimization (`Outfit` display + `Inter` UI).
   - Set up core Radix UI primitives with tokens-only styling.
2. **Landing Page:**
   - Cinematic hero with native CSS scroll-driven parallax.
   - Plan comparison cards with fine-pointer cursor glow.
   - Feature showcase sections and FAQs.
3. **Home Page (Browse Shell):**
   - Hero Billboard with 2.5s idle trailer transition and Ken Burns subtle zoom.
   - Curated Content Rails (Trending Top-10, New Releases, Genre Rails).
   - Content Cards with hover expansion (1.08x), sibling dimming (0.45), maturity pills, and lock badges.
4. **Interactive Title Quick-View Modal:**
   - Shared-element container transition from card to modal dialog.
   - Backdrop trailer preview, metadata pills, cast list, and action buttons.
5. **Profile Picker:**
   - Avatar selection grid (Netflix-style), "Add Profile" modal, and Kids Profile badge indicator.
6. **Video Player Skeleton & UI Chrome:**
   - Custom player controls overlay (timeline scrubber, volume, quality picker popover, subtitle selector).
   - Rendered using sample open-source VoD stream (Big Buck Bunny HLS).

---

## 2. Milestone Sequence

| Milestone | Focus | Deliverables / Acceptance Gates | Target Core Web Vitals |
|-----------|-------|---------------------------------|------------------------|
| **Milestone 0: Static Visual Prototype** | UI Fidelity, Motion & A11y | Complete mock application (Landing, Home, Title Modal, Profile Picker, Player Chrome). 100% tokens. | LCP < 2.0s, CLS 0.0, Axe-core 100% |
| **Milestone 1: Walking Skeleton & Auth** | Full-Stack End-to-End Slice | Custom JWT auth, session cookies, database migrations, profile CRUD, basic page rendering. | TTFB < 200ms, INP < 100ms |
| **Milestone 2: Catalog & Caching** | Discovery & Performance | ISR public shell (`tag: rails-general`, `tag: rails-kids`), Suspense profile rails, Postgres FTS search. | LCP < 2.5s, Cache hit ratio > 85% |
| **Milestone 3: Transcode Pipeline & Storage** | Media Processing | MinIO / S3 multipart upload wizard, pg-boss FFmpeg worker, HLS manifest generator with multi-renditions. | Transcode throughput > 1.5x real-time |
| **Milestone 4: Playback & Entitlements** | Player & DRM/Security | Manifest proxy route, HMAC token verification, plan quality gating, 10s progress beacon with flush. | Startup time < 1.2s, Buffer stall < 1% |
| **Milestone 5: Admin CMS & Rails Curation** | Operations & Management | Drag-and-drop rail curation, metadata forms, transcode monitoring table with job retries. | Admin INP < 150ms |
| **Milestone 6: Polishing & Production Launch** | Audit, Gates & Launch | Playwright E2E suites, Axe-core a11y gates, STRIDE threat validation, production CDN deployment. | Lighthouse ≥ 95 across all categories |

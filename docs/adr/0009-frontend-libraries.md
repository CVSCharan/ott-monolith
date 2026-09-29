# ADR 0009: Frontend Library Selections & Client Architecture

## Status

Accepted

## Context

A Netflix/Prime-class OTT web application requires high visual fidelity, seamless micro-interactions, low input latency (INP < 200 ms), high-quality adaptive video streaming (HLS), and an accessible, keyboard-navigable interface. However, unrestricted client dependencies can cause severe bundle bloat, hydration delays, and layout shifts that violate Core Web Vitals targets.

## Decision

We standardize the client-side technology stack with the following choices:

1. **Styling & Design Tokens:** Tailwind CSS v4 (`@tailwindcss/postcss`). Compiled ahead of time via lightningcss, emitting pure CSS with zero runtime footprint. Design tokens defined via `@theme`.
2. **Accessible UI Primitives:** Radix UI primitives integrated via shadcn/ui. Copy-paste ownership allows direct alignment with design tokens.
3. **Motion Engine:** Motion (formerly Framer Motion) with `LazyMotion` feature splitting for micro-interactions and shared-element transitions.
4. **Hero Parallax & Rails:** Native CSS Scroll-Driven Animations (`animation-timeline: scroll()`) and native CSS Scroll-Snap. Avoid third-party smooth-scroll or wheel-hijacking libraries on streaming pages.
5. **Video Playback Engine:** `hls.js` with bespoke React player chrome. Delivers precise control over ABR buffer configuration, audio track switching, subtitle rendering, and QoS beaconing without the weight of monolithic video players.
6. **Form & State Management:** React Hook Form + Zod for type-safe form validation; Zustand for lightweight local UI state; TanStack Query for polling admin jobs.
7. **Large File Uploads (Admin):** `@uppy/core` + `@uppy/aws-s3-multipart` for direct chunked multipart video uploads to S3-compatible storage (MinIO/R2).
8. **Image Placeholders:** Server-side ingest blur generation via `sharp` feeding `next/image`'s `blurDataURL` (0 kB client JS runtime).
9. **Quality & Testing Gates:** Playwright with `@axe-core/playwright` as mandatory automated gates in CI.

### Core Rules

- **Server Components by Default:** Pages remain RSC. Client libraries are isolated to leaf islands (`'use client'`).
- **Strict Bundle Budgets:** Maximum initial client JavaScript is capped at 80 kB Gzip for the Home page, 90 kB for Title Detail, 135 kB for the Video Player route, and 195 kB for the Admin console.
- **Dynamic Imports:** Heavy modules (`hls.js`, Recharts, dnd-kit, Uppy) must be dynamically imported via `next/dynamic`.

## Consequences

- **Positive:** Guarantees 60 FPS compositor animations, eliminates unnecessary client re-renders, and ensures WCAG 2.2 AA accessibility compliance from day one.
- **Negative:** Requires team discipline to avoid installing ad-hoc NPM packages and requires custom UI chrome implementation over bare `hls.js`.

# 10 – Functional UI Requirements Specification

> **Engineering & UX Implementation Checklist**  
> **Source of truth:** [03-product-requirements.md](../03-product-requirements.md) · [traceability.md](../traceability.md)  
> Status tags: `[MVP]` = Phase 1 Core · `[P2]` = Phase 2 · `[Later]` = Phase 3+

---

## 1. Global UI & System Capabilities

| Feature | Description | Mapped Story | Milestone | Keyboard / Shortcut |
|---------|-------------|--------------|-----------|---------------------|
| **Command Palette** | Global quick-jump search and action palette (`cmdk`). Jump to genres, search titles, toggle settings, or access admin routes (admin only). | US-401 | `[MVP]` | `Cmd + K` / `Ctrl + K` |
| **Shortcuts Modal** | Interactive modal showing keyboard controls for navigation, player, and search. | US-301 | `[MVP]` | `?` or `Shift + /` |
| **Toast System** | Lightweight toast notifications (via Sonner). Informative feedback for: My List additions, rating submissions, copy links, network errors, and PIN lockouts. | US-601, US-603 | `[MVP]` | Focus on alert via `F6` |
| **Offline / Reconnection Banner** | Sticky top banner alerting user when browser detects `navigator.onLine === false`. Re-syncs beacons on reconnect. | System | `[MVP]` | Non-interactive announcement |
| **Optimistic Updates** | Immediate UI response before server confirmation: My List (`+` → `✓`), Like/Dislike counters, and Profile name edits. Rolls back gracefully on network failure with an error toast. | US-601, US-603 | `[MVP]` | Seamless |
| **Cookie Consent Banner** | Accessible bottom drawer (Vaul) for GDPR/DPDPA cookie preferences (Essential vs Analytics). | Legal / Trust | `[MVP]` | Tab accessible |

---

## 2. Video Player UI Capabilities (US-301, US-302, US-303)

| Feature | Description | Mapped Story | Milestone | Implementation Standard |
|---------|-------------|--------------|-----------|-------------------------|
| **Custom Player Chrome** | Accessible custom player controls over `hls.js` (play/pause, timeline scrubber, volume slider, fullscreen). Auto-hides after 3s idle. | US-301 | `[MVP]` | React island with Pointer Events |
| **Adaptive Quality Selector** | Popover menu dynamically listing manifest levels (Auto, 1080p, 720p, 480p, 360p). Higher tiers greyed out with lock badge if plan restricted. | US-303 | `[MVP]` | Popover with RadioGroup |
| **Subtitle / Track Menu** | WebVTT track switcher with font size presets (Small, Medium, Large) and background opacity controls. | US-301 | `[MVP]` | Native `<track>` + Custom styling |
| **10-Second Skip Buttons** | Forward and backward skip buttons (±10s). | US-301 | `[MVP]` | `J` (back), `L` (forward), `Left`/`Right` arrows |
| **Thumbnail Scrubber Preview** | Hovering timeline displays timestamp tooltip and frame preview thumbnail. | US-301 | `[MVP]` | Canvas/Image slice at probed 10% interval |
| **Next-Episode Binge Card** | In-stream countdown card appearing at remaining <= 15s for series. Auto-transitions to next episode in 10s unless cancelled. | US-202 | `[MVP]` | Radix dialog overlay |
| **Picture-in-Picture (PiP)** | Standard HTML5 PiP button allowing playback in floating desktop window. | US-301 | `[MVP]` | `video.requestPictureInPicture()` |
| **Entitlement Gate Modal** | In-player modal triggered if unentitled title is loaded; displays required plan and direct upgrade button. | US-703 | `[MVP]` | Focus-trapped Dialog |

---

## 3. Profiles, Authentication & Parental PIN UI (US-503, US-504)

| Feature | Description | Mapped Story | Milestone | Implementation Standard |
|---------|-------------|--------------|-----------|-------------------------|
| **Profile Grid & Picker** | Visual avatar selection screen after login. Kids profiles display distinctive badge and color border. | US-503 | `[MVP]` | Spatial navigation grid |
| **Profile Creation & Avatar Sheet** | Modal to add profile (up to 5 max), upload avatar or choose curated system illustrations, and toggle "Kids Mode". | US-503 | `[MVP]` | Radix Dialog |
| **Parental PIN Verification Modal** | 4-digit PIN pad overlay triggered when attempting to switch from a Kids profile to an adult profile or accessing account settings. | US-504 | `[MVP]` | Auto-advancing 4-box OTP input |
| **PIN Lockout Timer** | Displays remaining lockout time countdown (after 5 failed attempts) and offers "Forgot PIN? Reset with account password" link. | US-504 | `[MVP]` | Reactive timer hook |
| **Password Override Flow** | Secondary modal allowing parent to verify primary account password to reset PIN and clear lockout. | US-504 | `[MVP]` | Form with argon2id verification |

---

## 4. Discovery, Modals & Subscription UI (US-101, US-201, US-702)

| Feature | Description | Mapped Story | Milestone | Implementation Standard |
|---------|-------------|--------------|-----------|-------------------------|
| **Title Quick-View Modal** | Shared-element expand modal containing backdrop video teaser, synopsis, genre tags, cast list, and action buttons. | US-201 | `[MVP]` | Motion container transform |
| **Plan Upgrade Dialog** | Modal comparing Free, Standard, and Premium tiers, highlighting locked features and dummy checkout trigger. | US-701, US-703 | `[MVP]` | Radix Dialog with comparison table |
| **Dummy Subscription Checkout** | One-click simulated checkout updating account plan tier without accepting real credit card numbers. | US-702 | `[MVP]` | Server Action with instant toast |
| **Live Payment Gateway (Razorpay)** | Production payment gateway modal with webhooks and invoice download. | US-702 | `[P2]` | Razorpay Checkout SDK |
| **Multi-Facet Search Filter Bar** | Filter drawer/bar for genre, release year, maturity rating, and sort order with server-computed facet counts. | US-402 | `[MVP]` | Client state with URL sync |

---

## 5. Admin & Content Management UI (US-801, US-802, US-803, US-804, US-901)

| Feature | Description | Mapped Story | Milestone | Implementation Standard |
|---------|-------------|--------------|-----------|-------------------------|
| **Multipart Video Upload Wizard** | Drag-and-drop zone supporting files up to 10 GB. Displays upload chunk progress, transfer speed (MB/s), time remaining, and abort button. | US-801 | `[MVP]` | Uppy / Custom fetch chunker |
| **Metadata Management Form** | Comprehensive title editor with autocomplete person/cast selector, genre multiselect, poster upload dropzone, and maturity rating dropdown. | US-802 | `[MVP]` | React Hook Form + Zod |
| **Interactive Rail Reorder Canvas** | Drag-and-drop rail curation tool allowing admins to reorder rails, add/remove titles, and toggle visibility. | US-803 | `[MVP]` | `@dnd-kit/core` |
| **Hero Billboard Manager** | Tool to select active billboard title, override headline/synopsis, and upload bespoke landscape artwork. | US-803 | `[MVP]` | Form with live preview frame |
| **Transcode Jobs Queue Table** | Real-time monitoring table showing asset ID, source filename, current resolution step, progress bar, and "Retry Job" button. | US-804 | `[MVP]` | TanStack Table + polling |
| **Platform Analytics Dashboard** | High-level analytics graphs displaying daily unique viewers, hours watched, and Top-10 title breakdown. | US-901 | `[P2]` | Recharts / Chart.js |

---

## 6. Open Questions

| # | Question | Owner | Options | Recommendation |
|---|----------|-------|---------|----------------|
| OQ-UI01 | Should Command Palette search return both actions and catalog titles? | UX | A: Both titles and app actions<br>B: App actions only (rely on /search for titles) | **Option A.** Users expect instant navigation to titles directly from `Cmd+K`. Limit catalog matches to top 4 items. |
| OQ-UI02 | Should offline state completely disable video playback or allow buffered segments? | Eng | A: Allow buffered segments<br>B: Hard freeze with offline prompt | **Option A.** Let the player exhaust already buffered HLS chunks, displaying an offline banner when buffer starves. |

---

## 7. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **Optimistic UI Inconsistency** | User thinks item is in watchlist, but server write failed | Revert state and display persistent Sonner toast with "Retry" action. |
| **PIN Pad Brute-Force via Multiple Windows** | Bypass 5-attempt limit across tabs | Rate limit and attempt counter are strictly enforced server-side in Postgres / Redis, not client memory. |
| **Admin File Upload Memory Leak** | Multi-GB browser crash during file chunking | Use `File.slice()` chunks (10 MB parts) streamed directly via `fetch()` without keeping all bytes in memory. |

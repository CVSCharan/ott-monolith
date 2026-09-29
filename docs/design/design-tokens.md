# Design Tokens Specification

> **Source of truth** for all visual values across StreamForge. No raw values in `.tsx` files — always reference a token.  
> **Format:** CSS custom properties consumed by Tailwind v4 `@theme static` block.  
> **Color model:** OKLCH (perceptually uniform; wide-gamut-ready).  
> **Contrast ratios:** Calculated against true sRGB relative luminance ($L$) and WCAG 2.2 AA ($4.5:1$ normal text, $3:1$ large text/UI).  
> **Version date:** September 2026

---

## 1. Color System

### Surface Palette

| Token                       | OKLCH                        | Hex (approx)          | Luminance ($L$) | Contrast vs `#0d0d0f` | Use                            |
| --------------------------- | ---------------------------- | --------------------- | --------------- | --------------------- | ------------------------------ |
| `--color-bg-base`           | `oklch(10% 0.008 280)`       | `#0d0d0f`             | 0.0035          | Baseline              | Main page background           |
| `--color-bg-surface`        | `oklch(14% 0.010 280)`       | `#18181c`             | 0.0195          | 1.30:1                | Card / Modal background        |
| `--color-bg-surface-alpha`  | `oklch(14% 0.010 280 / 80%)` | `rgba(24,24,28,0.8)`  | —               | —                     | Translucent card backing       |
| `--color-bg-elevated`       | `oklch(18% 0.012 280)`       | `#222228`             | 0.0310          | 1.51:1                | Navbar, Dropdown, Toast        |
| `--color-bg-elevated-alpha` | `oklch(18% 0.012 280 / 80%)` | `rgba(34,34,40,0.8)`  | —               | —                     | Glassmorphic floating surfaces |
| `--color-bg-scrim`          | `oklch(8% 0.006 280 / 85%)`  | `rgba(10,10,12,0.85)` | —               | —                     | Video / Hero backdrop scrim    |
| `--color-bg-input`          | `oklch(16% 0.011 280)`       | `#1e1e24`             | 0.0240          | 1.38:1                | Form inputs                    |

### Accent Palette & Link Contrast Rules

| Token                 | OKLCH                       | Hex (approx)            | Luminance ($L$) | Contrast vs `#0d0d0f`        | Usage Restriction                                                            |
| --------------------- | --------------------------- | ----------------------- | --------------- | ---------------------------- | ---------------------------------------------------------------------------- |
| `--color-accent-300`  | `oklch(76% 0.16 292)`       | `#b99cfc`               | 0.460           | **9.53:1** ✓ (AAA)           | High-contrast links, dark mode focus                                         |
| `--color-accent-400`  | `oklch(66% 0.20 292)`       | `#9b6df7`               | 0.280           | **6.17:1** ✓ (AA)            | **Standard inline text links**, hover CTA                                    |
| `--color-accent-500`  | `oklch(54% 0.24 292)`       | `#7c3aed`               | 0.133           | **3.42:1** (UI / Large text) | **Solid button fills & borders ONLY**. Never use for normal body text links! |
| `--color-accent-600`  | `oklch(46% 0.25 292)`       | `#6d28d9`               | 0.085           | 2.52:1                       | Button active/pressed fill                                                   |
| `--color-accent-soft` | `oklch(54% 0.24 292 / 15%)` | `rgba(124,58,237,0.15)` | —               | —                            | Selected chip / pill backgrounds                                             |
| `--color-accent-glow` | `oklch(54% 0.24 292 / 35%)` | `rgba(124,58,237,0.35)` | —               | —                            | Plan card ambient glow, focus ring                                           |

> **Contrast Enforcement Rule:**  
> `--color-accent-500` produces a contrast ratio of **3.42:1** against `--color-bg-base`, which passes for large text (≥ 18pt or 14pt bold) and graphical UI fills (3:1), but **fails** for normal body text (4.5:1).  
> **All interactive body text links must strictly use `--color-accent-400` (6.17:1) or `--color-accent-300` (9.53:1).** White text on an `--color-accent-500` button fill achieves **5.74:1** (Passes AA).

### Text Palette

| Token                     | OKLCH                  | Hex (approx) | Luminance ($L$) | Contrast vs `#0d0d0f`     | Status & Use                                |
| ------------------------- | ---------------------- | ------------ | --------------- | ------------------------- | ------------------------------------------- |
| `--color-text-primary`    | `oklch(95% 0.008 280)` | `#f2f2f5`    | 0.880           | **17.38:1** ✓             | Headings, primary body text                 |
| `--color-text-secondary`  | `oklch(70% 0.012 280)` | `#9a9aa8`    | 0.320           | **6.91:1** ✓              | Metadata, secondary labels                  |
| `--color-text-muted`      | `oklch(64% 0.010 280)` | `#898997`    | 0.245           | **5.51:1** ✓              | **Placeholders, disabled states (≥ 4.5:1)** |
| `--color-text-on-accent`  | `oklch(100% 0 0)`      | `#ffffff`    | 1.000           | **5.74:1** on accent-500  | Button labels                               |
| `--color-text-on-surface` | `oklch(90% 0.008 280)` | `#dedee5`    | 0.740           | **12.44:1** on bg-surface | Card body text                              |

> **Placeholder Contrast Guarantee:**  
> `--color-text-muted` is set to `oklch(64% 0.010 280)` ($5.51:1$ on base, $4.95:1$ on input surface), fully complying with WCAG 2.2 AA (≥ 4.5:1).

### Semantic & Maturity Badge Palette

| Category    | Token                 | OKLCH                 | Hex       | Text Treatment on Badge                                       |
| ----------- | --------------------- | --------------------- | --------- | ------------------------------------------------------------- |
| **U**       | `--color-maturity-u`  | `oklch(65% 0.19 145)` | `#22c55e` | Dark text (`#0d0d0f`, 9.3:1) OR Outlined with `#f2f2f5` text  |
| **U/A 7+**  | `--color-maturity-7`  | `oklch(78% 0.15 145)` | `#86efac` | Dark text (`#0d0d0f`, 13.6:1) OR Outlined with `#f2f2f5` text |
| **U/A 13+** | `--color-maturity-13` | `oklch(78% 0.17 70)`  | `#f59e0b` | Dark text (`#0d0d0f`, 8.8:1) OR Outlined with `#f2f2f5` text  |
| **U/A 16+** | `--color-maturity-16` | `oklch(70% 0.18 40)`  | `#f97316` | Dark text (`#0d0d0f`, 6.3:1) OR Outlined with `#f2f2f5` text  |
| **A (18+)** | `--color-maturity-18` | `oklch(58% 0.22 25)`  | `#dc2626` | Light text (`#ffffff`, 5.5:1) OR Outlined with `#f2f2f5` text |

> **Maturity Badge Contrast Fix:**  
> In earlier drafts, white text was placed on light green/amber pills, causing severe contrast failures ($1.4:1$).  
> StreamForge adopts the **Outlined Badge Standard**: 1px colored border (`--color-maturity-*`), dark translucent backing (`oklch(10% 0.008 280 / 80%)`), and crisp primary text (`--color-text-primary`, 17:1 contrast). If solid pills are used, dark text (`--color-bg-base`) is strictly enforced for U, 7+, 13+, and 16+.

---

## 2. Typography Tokens

### Font Families

- **Display:** `Outfit` (variable font, weights 400–800)
- **UI:** `Inter` (variable font, weights 400–700)
- **Indic Fallback Stack:** `Noto Sans Devanagari`, `Noto Sans Tamil`, `Noto Sans Telugu`

### Sizing Scale & Mobile Floor

To prevent automatic iOS viewport zooming on inputs and guarantee readability on mobile:

- **Body text floor:** $\ge 16\text{px}$ (`1rem` on mobile).
- **Caption floor:** $\ge 12\text{px}$ (`0.75rem`).

---

## 3. Top-Level `@theme static` Block (Tailwind CSS v4)

Tailwind v4 requires `@theme static` at the top level of CSS. Only utility namespaces reside within `@theme`. Non-utility custom properties (layout dimensions, motion distances, z-indices) are defined in `:root`.

```css
/* src/app/globals.css */

@theme static {
  /* ── Colors: Surfaces ──────────────────────────────── */
  --color-bg-base: oklch(10% 0.008 280);
  --color-bg-surface: oklch(14% 0.01 280);
  --color-bg-surface-alpha: oklch(14% 0.01 280 / 80%);
  --color-bg-elevated: oklch(18% 0.012 280);
  --color-bg-elevated-alpha: oklch(18% 0.012 280 / 80%);
  --color-bg-scrim: oklch(8% 0.006 280 / 85%);
  --color-bg-input: oklch(16% 0.011 280);

  /* ── Colors: Accents ───────────────────────────────── */
  --color-accent-300: oklch(76% 0.16 292);
  --color-accent-400: oklch(66% 0.2 292);
  --color-accent-500: oklch(54% 0.24 292);
  --color-accent-600: oklch(46% 0.25 292);
  --color-accent-soft: oklch(54% 0.24 292 / 15%);
  --color-accent-glow: oklch(54% 0.24 292 / 35%);

  /* ── Colors: Text ──────────────────────────────────── */
  --color-text-primary: oklch(95% 0.008 280);
  --color-text-secondary: oklch(70% 0.012 280);
  --color-text-muted: oklch(64% 0.01 280);
  --color-text-on-accent: oklch(100% 0 0);
  --color-text-on-surface: oklch(90% 0.008 280);

  /* ── Colors: Semantic ──────────────────────────────── */
  --color-success: oklch(65% 0.19 145);
  --color-success-soft: oklch(65% 0.19 145 / 15%);
  --color-error: oklch(58% 0.22 25);
  --color-error-soft: oklch(58% 0.22 25 / 15%);
  --color-warning: oklch(78% 0.17 70);
  --color-warning-soft: oklch(78% 0.17 70 / 15%);

  /* ── Colors: Maturity Badges ───────────────────────── */
  --color-maturity-u: oklch(65% 0.19 145);
  --color-maturity-7: oklch(78% 0.15 145);
  --color-maturity-13: oklch(78% 0.17 70);
  --color-maturity-16: oklch(70% 0.18 40);
  --color-maturity-18: oklch(58% 0.22 25);

  /* ── Colors: Borders ───────────────────────────────── */
  --color-border: oklch(100% 0 0 / 10%);
  --color-border-hover: oklch(100% 0 0 / 20%);
  --color-border-focus: var(--color-accent-400);
  --color-border-error: var(--color-error);

  /* ── Typography Scale ──────────────────────────────── */
  --font-display: var(--font-outfit), var(--font-noto-sans), system-ui, sans-serif;
  --font-ui: var(--font-inter), var(--font-noto-sans), system-ui, sans-serif;

  --text-display-xl: clamp(2.75rem, 5vw, 4.5rem);
  --text-display-lg: clamp(2rem, 3.5vw, 3.5rem);
  --text-heading-1: clamp(1.5rem, 2.5vw, 2.25rem);
  --text-heading-2: clamp(1.25rem, 1.8vw, 1.75rem);
  --text-heading-3: clamp(1.125rem, 1.2vw, 1.35rem);
  --text-body-lg: 1.125rem;
  --text-body: clamp(1rem, 1.2vw, 1.0625rem); /* >= 16px mobile */
  --text-body-sm: 0.875rem; /* 14px */
  --text-caption: 0.75rem; /* 12px minimum floor */

  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  --leading-tight: 1.15;
  --leading-snug: 1.3;
  --leading-normal: 1.5;
  --leading-relaxed: 1.65;

  --tracking-tight: -0.02em;
  --tracking-normal: 0em;
  --tracking-wide: 0.04em;

  /* ── Spacing Utilities ─────────────────────────────── */
  --spacing-px: 1px;
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-3: 0.75rem;
  --spacing-4: 1rem;
  --spacing-5: 1.25rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;
  --spacing-10: 2.5rem;
  --spacing-12: 3rem;
  --spacing-16: 4rem;
  --spacing-20: 5rem;
  --spacing-24: 6rem;
  --spacing-32: 8rem;

  /* ── Aspect Ratios (Corrected: Width / Height) ─────── */
  --aspect-video: 16 / 9; /* Standard landscape / trailer / thumbnail */
  --aspect-poster: 2 / 3; /* Portrait movie card */
  --aspect-backdrop: 16 / 9; /* Hero billboard backdrop */
  --aspect-square: 1 / 1; /* Avatar */

  /* ── Border Radius ─────────────────────────────────── */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 20px;
  --radius-full: 9999px;

  /* ── Shadows ───────────────────────────────────────── */
  --shadow-card: 0 4px 24px oklch(0% 0 0 / 50%);
  --shadow-card-hover: 0 8px 36px oklch(0% 0 0 / 70%);
  --shadow-modal: 0 24px 64px oklch(0% 0 0 / 80%);
  --shadow-accent-glow: 0 0 24px var(--color-accent-glow);

  /* ── Motion Tokens (Canonical Definition) ─────────── */
  --duration-instant: 75ms;
  --duration-fast: 150ms;
  --duration-base: 220ms;
  --duration-slow: 350ms;
  --duration-deliberate: 450ms;
  --duration-cinematic: 700ms;

  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --ease-entrance: cubic-bezier(0.05, 0.7, 0.1, 1);
  --ease-exit: cubic-bezier(0.3, 0, 0.8, 0.15);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-cinematic: cubic-bezier(0.16, 1, 0.3, 1);
}

/* ── Non-Utility Design Tokens in :root ─────────────── */
:root {
  /* Layout Dimensions */
  --page-gutter: clamp(1rem, 4vw, 3.5rem);
  --rail-gap: var(--spacing-3);
  --section-gap: var(--spacing-12);
  --navbar-height: 4rem;
  --bottom-nav-height: 3.5rem;

  /* Motion Distances */
  --motion-distance-sm: 8px;
  --motion-distance-md: 16px;
  --motion-distance-lg: 32px;

  /* Staggers */
  --stagger-rail-item: 35ms;
  --stagger-grid-item: 40ms;

  /* Layering Z-Indices */
  --z-base: 0;
  --z-card-hover: 10;
  --z-sticky: 100;
  --z-navbar: 200;
  --z-dropdown: 300;
  --z-modal-backdrop: 400;
  --z-modal: 401;
  --z-player: 450;
  --z-toast: 500;
  --z-command: 600;
}

/* ── Reduced Motion Overrides in :root ──────────────── */
@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-instant: 0ms;
    --duration-fast: 0ms;
    --duration-base: 0ms;
    --duration-slow: 0ms;
    --duration-deliberate: 0ms;
    --duration-cinematic: 0ms;

    --motion-distance-sm: 0px;
    --motion-distance-md: 0px;
    --motion-distance-lg: 0px;
  }

  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  /* Infinite animations MUST have an explicit static fallback, never 1ms loops */
  .animate-ken-burns,
  .animate-pulse,
  .animate-spin,
  .animate-shimmer {
    animation: none !important;
  }
}
```

---

## 4. JS Network & Save-Data Autoplay Guard

To prevent bandwidth consumption and mobile data charges, trailer videos must never mount if the user has data saver active:

```typescript
// src/lib/device-capabilities.ts
export function shouldAutoplayTrailer(): boolean {
  if (typeof window === 'undefined') return false

  // 1. Check Data Saver (Save-Data header / API)
  const conn = (navigator as any).connection
  if (conn?.saveData || conn?.effectiveType === 'slow-2g' || conn?.effectiveType === '2g') {
    return false
  }

  // 2. Check Reduced Motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return false
  }

  // 3. Pointer check (desktop fine pointer only)
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}
```

If `shouldAutoplayTrailer()` returns `false`, the trailer video element is **not mounted in the DOM**; the static hero poster image remains visible.

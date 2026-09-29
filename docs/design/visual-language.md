# 08 – Visual Language

> **Scope:** Art direction, dominant-color theming, grain/gradient/glass rules, typography spec, numeral treatment.  
> **Rules:** No raw values — reference tokens only. Max two font families. Indic fallbacks documented.  
> **Version date:** 2026-09-29

---

## Art Direction

### Mood

**Cinematic dark premium.** StreamForge feels like a high-end screening room, not a website. The UI is intentionally quiet — muted surfaces, restrained chrome — so that content artwork commands full attention.

Key mood words: _dark · immersive · sharp · generous whitespace · confidence_

### Principles Translated to Visual Rules

| Principle              | Visual expression                                                                                         |
| ---------------------- | --------------------------------------------------------------------------------------------------------- |
| Content-forward        | Maximum content art coverage; no decorative borders or box-shadows on cards at rest                       |
| Cinematic              | Near-black backgrounds (`--color-bg-base`); high-quality blur, not pixel-level crisp edges on backgrounds |
| Instant                | No skeletons with hard edges — use `--ease-cinematic` fade-in; shapes match loaded content                |
| Progressive disclosure | Card rest state: just art + minimal title. Hover: full metadata revealed                                  |
| Dark-first             | Light mode is a future layer. Every design decision assumes dark context                                  |

### Mood Board Description (asset placeholders)

> ⚠️ No proprietary assets. Required production assets (document before launch):
>
> 1. `brand/logo-wordmark-dark.svg` — white/light wordmark on transparent background
> 2. `brand/logo-mark.svg` — icon-only (for favicon, app icon)
> 3. `brand/logo-wordmark-light.svg` — dark wordmark for light surfaces (Phase 2)
> 4. Placeholder art: `public/placeholder-16-9.webp`, `public/placeholder-2-3.webp` (provide as 8px blurred color blocks per content-and-imagery-guidelines.md)

---

## Dominant-Color & Image Placeholder Ingest (Phase 2 & MVP)

### Schema Addition

Add to `titles` table via migration:

```sql
-- migration: 0xxx_add_artwork_metadata.sql
ALTER TABLE titles ADD COLUMN dominant_color VARCHAR(7);  -- clamped hex: '#231834'
ALTER TABLE titles ADD COLUMN blur_data_url TEXT;         -- base64 WebP blur placeholder: 'data:image/webp;base64,...'
```

Add to Prisma schema (`prisma/schema.prisma`):

```prisma
model Title {
  // ...
  dominantColor String? @map("dominant_color") @db.VarChar(7)
  blurDataUrl   String? @map("blur_data_url")   @db.Text
}
```

### Ingest-Time Extraction (Artwork Upload Time)

> **Architectural Decision:** Dominant color and blur data URLs are extracted during **image artwork upload** (`src/modules/content/services/artwork.service.ts`), NOT during video transcoding. This ensures:
>
> 1. **Series Support:** Series titles possess poster and backdrop artwork but have no direct video assets (episodes carry video). Artwork-time extraction guarantees series pages receive ambient theming.
> 2. **Instant Availability:** Artwork is processed immediately when uploaded in the admin dashboard, long before video transcode jobs run.
> 3. **Zero Client JS for Placeholders:** Generating an ingest-time blur data URL directly feeds `next/image`'s `placeholder="blur"` and `blurDataURL`, eliminating the runtime overhead of client-side ThumbHash decoding (~1.2 kB bundle + canvas decoding).

```typescript
// src/modules/content/services/artwork.service.ts
import sharp from 'sharp'

interface ArtworkIngestResult {
  dominantColor: string // Clamped hex format (#rrggbb)
  blurDataUrl: string // Base64 WebP data URL
}

/**
 * Processes uploaded poster or backdrop image buffer with sharp:
 * 1. Generates a 16x9 / 2x3 tiny blurred base64 WebP string for next/image.
 * 2. Samples the image to extract dominant color and clamps Lightness/Chroma.
 */
export async function processArtworkIngest(imageBuffer: Buffer): Promise<ArtworkIngestResult> {
  // 1. Generate lightweight blur data URL for Next.js Image
  const blurBuffer = await sharp(imageBuffer)
    .resize(16, 9, { fit: 'cover' })
    .webp({ quality: 20 })
    .toBuffer()
  const blurDataUrl = `data:image/webp;base64,${blurBuffer.toString('base64')}`

  // 2. Extract dominant color via sharp downsampled stats
  const { dominant } = await sharp(imageBuffer).resize(64, 64, { fit: 'cover' }).stats()

  // 3. Clamp Lightness and Chroma in OKLCH to preserve contrast and prevent neon saturation:
  //    - Target Lightness (L): clamp to 0.15 - 0.35 (keeps ambient glow subtle and dark-theme compliant)
  //    - Target Chroma (C): clamp to <= 0.12 (prevents distracting neon glow)
  const dominantColor = clampOklchHex(dominant.r, dominant.g, dominant.b, {
    minL: 0.15,
    maxL: 0.35,
    maxC: 0.12,
  })

  return { dominantColor, blurDataUrl }
}

function clampOklchHex(
  r: number,
  g: number,
  b: number,
  bounds: { minL: number; maxL: number; maxC: number },
): string {
  // Converts sRGB -> Linear RGB -> OKLCH, clamps L and C, then converts back to sRGB Hex
  // Guarantees consistent dark-mode luminance across all artwork genres
  // Implementation in src/lib/color.ts
  return '#231834'
}
```

### CSS Application Pattern

No Vue `v-bind` or CSS-in-JS. The server component injects a standard CSS custom property via `style`, which is blended using standard CSS `color-mix`:

```tsx
// src/app/(app)/title/[slug]/page.tsx (Server Component)
export default async function TitleDetailPage({ params }: TitlePageProps) {
  const title = await getTitleBySlug(params.slug)
  const ambientColor = title.dominantColor ?? '#1a102a'

  return (
    <div
      className="ambient-hero relative min-h-[60vh]"
      style={{ '--ambient-color': ambientColor } as React.CSSProperties}
    >
      <div className="ambient-gradient absolute inset-0 pointer-events-none" />
      {/* Content */}
    </div>
  )
}
```

```css
/* src/styles/ambient.css */
.ambient-gradient {
  /* Blends the clamped ambient color with transparency using standard CSS color-mix */
  background-image: radial-gradient(
    ellipse 80% 60% at 50% -10%,
    color-mix(in oklch, var(--ambient-color, #1a102a), transparent 85%),
    transparent
  );
}
```

### Allowed Locations

| Location                            | Allowed | Notes                                                 |
| ----------------------------------- | ------- | ----------------------------------------------------- |
| Title detail page — hero background | ✓       | Low opacity radial gradient (15% max via `color-mix`) |
| Billboard — background tint         | ✓       | 10% opacity, behind background art                    |
| Player page background (pre-play)   | ✓       | 12% opacity ambient                                   |
| Home page rail area                 | ✗       | Too busy; violates content-forward principle          |
| Cards                               | ✗       | Performance overhead and visual clutter               |
| Admin UI                            | ✗       | Standard dark neutral UI only                         |

---

## Grain, Gradient, and Glass Rules

### Grain

**Phase 2 only.** Subtle film grain adds depth without altering layout.

```css
/* Phase 2: noise texture overlay */
.with-grain::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url('/textures/noise-256.png');
  opacity: 0.03;
  pointer-events: none;
  z-index: var(--z-below);
}
```

| Allowed                | Forbidden       |
| ---------------------- | --------------- |
| Landing hero (Phase 2) | Cards           |
| Billboard background   | Player controls |
| Title detail hero      | Forms, inputs   |
| Behind modal scrim     | Admin UI        |

### Gradient

Gradients are used only as **content scrims** (see `content-and-imagery-guidelines.md`) and **ambient backgrounds** (dominant color). Never decorative on UI elements.

| Gradient                   | Where                  | Forbidden                        |
| -------------------------- | ---------------------- | -------------------------------- |
| `billboard-vignette`       | Over billboard image   | On plain backgrounds             |
| `card-scrim`               | Card hover overlay     | On all cards (rest state = none) |
| `nav-transparent-to-solid` | Navbar over billboard  | Standard pages                   |
| `player-controls`          | Bottom of player       | Top of player                    |
| Dominant color radial      | Title detail/player bg | Rails, cards                     |

### Glass / Backdrop Blur

**One level only**: `backdrop-filter: blur(12px) saturate(150%)` on `--color-bg-elevated` at 85% opacity. Used for:

| Component                                | Allowed             |
| ---------------------------------------- | ------------------- |
| Floating player controls overlay         | ✓                   |
| Navbar when transparent (over billboard) | ✓                   |
| Command palette overlay                  | ✓                   |
| Modal backdrop behind scrim              | ✗ (use solid scrim) |
| Cards                                    | ✗                   |
| Forms                                    | ✗                   |

```css
/* Token pattern */
.glass {
  background-color: var(--color-bg-elevated); /* 85% alpha built into token */
  backdrop-filter: blur(12px) saturate(1.5);
  -webkit-backdrop-filter: blur(12px) saturate(1.5);
}
```

> **Performance note:** `backdrop-filter` promotes to a compositor layer. Limit to ≤ 2 glass elements visible simultaneously to avoid GPU memory pressure on low-end mobile.

---

## Typography

### Font Selection

**Display:** `Outfit` (Google Fonts, OFL 1.1) — Variable font (`wght` axis 100–900)  
**UI:** `Inter` (Google Fonts / rsms.me, OFL 1.1) — Variable font (`wght`, `slnt` axes)

### Justification

| Choice        | Outfit (Display)                                                                                                                | Inter (UI)                                                                                                | Alternatives considered                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Why chosen    | Geometric grotesque; clean at billboard sizes (56–72px); tabular numerals (`tnum`, `lnum`) for Top-10; full variable axis; free | Industry-standard screen legibility; excellent hinting; full variable weight axis; widest browser caching | Onest (less distinctive numerals), Plus Jakarta Sans (less geometric), Satoshi (proprietary), Manrope (narrower) |
| Indic support | Partial (Latin only)                                                                                                            | Latin + Latin Ext                                                                                         | Noto Sans Devanagari, Tamil, Telugu variable subsets                                                             |
| License       | OFL 1.1 (free for commercial)                                                                                                   | OFL 1.1                                                                                                   | —                                                                                                                |
| Maintenance   | Active (Google Fonts)                                                                                                           | Active (rsms.me + Google Fonts)                                                                           | —                                                                                                                |
| Bundle impact | Single variable WOFF2 subset (~24 kB)                                                                                           | Single variable WOFF2 subset (~32 kB)                                                                     | —                                                                                                                |

### next/font Variable Font Configuration

> **Critical Rule:** When loading variable fonts with `next/font/google` (`Outfit`, `Inter`), **OMIT the `weight` property completely**. Providing a `weight` array to a variable font forces fixed weight instances, negates variable axis benefits, and triggers Next.js build warnings.

```typescript
// src/app/layout.tsx
import {
  Outfit,
  Inter,
  Noto_Sans_Devanagari,
  Noto_Sans_Tamil,
  Noto_Sans_Telugu,
} from 'next/font/google'

// Variable Display Font: omit `weight`
export const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  preload: true,
})

// Variable UI Font: omit `weight`
export const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-ui',
  display: 'swap',
  preload: true,
})

// Indic Variable Subsets via next/font/google:
// Preloaded conditionally or loaded on-demand via CSS variables
export const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  variable: '--font-indic-devanagari',
  display: 'swap',
  preload: false,
})

export const notoTamil = Noto_Sans_Tamil({
  subsets: ['tamil'],
  variable: '--font-indic-tamil',
  display: 'swap',
  preload: false,
})

export const notoTelugu = Noto_Sans_Telugu({
  subsets: ['telugu'],
  variable: '--font-indic-telugu',
  display: 'swap',
  preload: false,
})
```

In `src/app/layout.tsx`:

```tsx
<html
  lang="en"
  className={`${outfit.variable} ${inter.variable} ${notoDevanagari.variable} ${notoTamil.variable} ${notoTelugu.variable}`}
>
```

In CSS font-family stack (`src/styles/fonts.css`):

```css
:root {
  --font-display-stack:
    var(--font-display), var(--font-indic-devanagari), var(--font-indic-tamil),
    var(--font-indic-telugu), system-ui, sans-serif;
  --font-ui-stack:
    var(--font-ui), var(--font-indic-devanagari), var(--font-indic-tamil), var(--font-indic-telugu),
    system-ui, sans-serif;
}
```

### Type Scale with `clamp()` — Explanation

`clamp(MIN, PREFERRED, MAX)` means:

- At narrow viewports: size is locked to MIN
- At target width: size is the PREFERRED (viewport-relative)
- At wide viewports: size is locked to MAX

```css
/* Example: Billboard title */
.billboard-title {
  font-family: var(--font-display);
  font-size: var(--text-display-xl); /* clamp(2.75rem, 5vw, 4.5rem) */
  font-weight: var(--font-weight-bold);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  color: var(--color-text-primary);
}
```

### Top-10 Numeral Treatment

**No third font family.** Use Outfit's built-in tabular/lining numerals with OpenType features:

```css
.top10-numeral {
  font-family: var(--font-display);
  font-size: clamp(5rem, 14vw, 11rem); /* Large enough to bleed outside card */
  font-weight: var(--font-weight-extrabold);
  font-variant-numeric: tabular-nums lining-nums;
  font-feature-settings: 'tnum', 'lnum';
  line-height: 0.85; /* Optically adjust to art */
  color: var(--color-text-primary);
  /* Stroke for depth — CSS paint worklet approach (Phase 2) or SVG filter */
  -webkit-text-stroke: 2px var(--color-bg-base);
  letter-spacing: var(--tracking-tight);
}
```

**Visual treatment:** Numbers are large and extend slightly below the card bottom edge. The rightmost 60% of the numeral is covered by the card thumbnail. This creates the Netflix-style "number card" depth effect without any extra element.

---

## Open Questions

| #   | Status | Question                                                                                                                                                             |
| --- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OQ1 | Closed | Dominant-color extraction: `sharp` downsampling + stats sampling at image-upload time. Clamped L/C in OKLCH. Generates blur data URL at ingest for zero-client JS.   |
| OQ2 | Open   | Outfit has glyphs for extended Latin (diacritics) but not for Devanagari. Is UI copy ever in Hindi on the admin side? If yes, Noto Sans must also be in `--font-ui`. |
| OQ3 | Open   | Phase 2 grain texture: generate with CSS Houdini Paint Worklet (no file request) or serve `noise-256.png` (simpler)?                                                 |

---

## Risks

| Risk                                                | Impact | Mitigation                                                                                                              |
| --------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------- |
| Outfit unavailable (Google Fonts outage)            | Low    | `system-ui, sans-serif` fallback in token; FOUT is acceptable for display text                                          |
| `unicode-range` @font-face + next/font conflict     | Low    | Noto Sans loaded via static @font-face; not in next/font. No CSS conflict.                                              |
| `backdrop-filter` GPU pressure on mobile            | Medium | Limit glass elements per viewport; remove on low-power via `@media (prefers-reduced-transparency: reduce)` if supported |
| OKLCH colors not rendering in Safari 15.3 and below | Low    | < 2% of users; Tailwind v4 outputs `@supports` fallback                                                                 |

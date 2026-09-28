# 02 – Feature Benchmark

> Research-backed comparison against Netflix, Prime Video, Disney+, Hotstar (JioCinema), and YouTube.  
> Priority column applies to **our** platform: `[MVP]` = Phase 1, `[P2]` = Phase 2, `[Later]` = Phase 3+, `[-]` = Out of scope.  
> **Verified:** 2026-09-29. Competitor features checked against each platform's public help centre, app UI, and published press releases on that date. Cells marked ⚠️ change frequently — re-verify before presenting.

---

## 1. Discovery & Browsing

| Feature | Netflix | Prime Video | Disney+ | Hotstar | YouTube | **Our Priority** |
|---------|---------|-------------|---------|---------|---------|----------------|
| Hero billboard / banner | ✅ Autoplay trailer | ✅ Static image | ✅ Autoplay trailer | ✅ Autoplay | ✅ Shorts-style | `[MVP]` |
| Genre / curated rails | ✅ Personalised | ✅ Personalised | ✅ Curated | ✅ Sport + genre | ✅ Subscriptions | `[MVP]` |
| Top-10 trending | ✅ Country-level | ✅ | ✅ | ✅ | ✅ Trending tab | `[MVP]` |
| New releases rail | ✅ | ✅ | ✅ | ✅ | ✅ | `[MVP]` |
| Continue watching rail | ✅ | ✅ | ✅ | ✅ | ✅ | `[MVP]` |
| My List / Watchlist rail | ✅ | ✅ Watchlist | ✅ | ✅ | ✅ Watch Later | `[MVP]` |
| Because you watched | ✅ AI-driven | ✅ | ✅ | ✅ | ✅ | `[P2]` |
| "Trending Now" badges | ✅ | ✅ | ❌ | ✅ | ✅ | `[MVP]` |
| Category / genre pages | ✅ | ✅ | ✅ | ✅ | ✅ | `[MVP]` |
| Mood-based collections | ✅ | ❌ | ✅ | ❌ | ❌ | `[P2]` |
| Languages rail | ✅ | ✅ | ✅ | ✅ Hindi/Tamil | ❌ | `[P2]` |
| Notifications / new episodes | ✅ | ✅ | ✅ | ✅ | ✅ Bell | `[Later]` |

---

## 2. Search & Filtering

| Feature | Netflix | Prime Video | Disney+ | Hotstar | YouTube | **Our Priority** |
|---------|---------|-------------|---------|---------|---------|----------------|
| Keyword search | ✅ | ✅ | ✅ | ✅ | ✅ | `[MVP]` |
| Autocomplete suggestions | ✅ | ✅ | ✅ | ✅ | ✅ | `[MVP]` |
| Genre filter | ✅ | ✅ | ✅ | ✅ | ✅ | `[MVP]` |
| Language filter | ✅ | ✅ | ✅ | ✅ India-first | ❌ | `[P2]` |
| Maturity rating filter | ✅ | ✅ | ✅ | ✅ | ✅ | `[MVP]` |
| Year / decade filter | ❌ | ✅ | ❌ | ❌ | ❌ | `[P2]` |
| Cast / person search | ✅ | ✅ | ✅ | ✅ | ❌ | `[P2]` |
| Voice search | ✅ (mobile) | ✅ | ✅ | ✅ | ✅ | `[-]` |
| Search within transcript | ❌ | ❌ | ❌ | ❌ | ✅ | `[-]` |
| Fuzzy / typo tolerance | ✅ | ✅ | ✅ | ✅ | ✅ | `[MVP]` (pg_trgm) |

---

## 3. Title Detail Page

| Feature | Netflix | Prime Video | Disney+ | Hotstar | YouTube | **Our Priority** |
|---------|---------|-------------|---------|---------|---------|----------------|
| Hero image / trailer autoplay | ✅ | ✅ | ✅ | ✅ | ✅ | `[MVP]` |
| Title, year, duration, rating | ✅ | ✅ | ✅ | ✅ | ✅ | `[MVP]` |
| Description / synopsis | ✅ | ✅ | ✅ | ✅ | ✅ | `[MVP]` |
| Genre tags | ✅ | ✅ | ✅ | ✅ | ✅ | `[MVP]` |
| Cast & crew | ✅ | ✅ | ✅ | ✅ | ❌ | `[MVP]` |
| Seasons & episodes list | ✅ | ✅ | ✅ | ✅ | ✅ (playlists) | `[MVP]` |
| Episode thumbnails | ✅ | ✅ | ✅ | ✅ | ✅ | `[MVP]` |
| Related / more like this | ✅ | ✅ | ✅ | ✅ | ✅ | `[P2]` |
| Official trailers section | ✅ | ✅ | ✅ | ✅ | ✅ | `[MVP]` |
| User ratings / reviews | ❌ | ✅ (IMDb) | ❌ | ✅ | ✅ | `[P2]` |
| Maturity rating badges | ✅ | ✅ | ✅ | ✅ | ✅ | `[MVP]` |
| Add to My List | ✅ | ✅ | ✅ | ✅ | ✅ Watch Later | `[MVP]` |
| Like / Dislike | ✅ Thumbs | ✅ | ✅ | ✅ | ✅ | `[MVP]` |
| Download for offline | ✅ (mobile) | ✅ (mobile) | ✅ | ✅ | ✅ (premium) | `[-]` |
| Share link | ✅ | ✅ | ✅ | ✅ | ✅ | `[P2]` |

---

## 4. Video Playback

| Feature | Netflix | Prime Video | Disney+ | Hotstar | YouTube | **Our Priority** |
|---------|---------|-------------|---------|---------|---------|----------------|
| Adaptive bitrate (HLS/DASH) | ✅ DASH+HLS | ✅ DASH | ✅ HLS | ✅ HLS | ✅ DASH | `[MVP]` (HLS) |
| Quality selector (manual) | ✅ | ✅ | ✅ | ✅ | ✅ | `[MVP]` |
| Resume / continue watching | ✅ | ✅ | ✅ | ✅ | ✅ | `[MVP]` |
| Subtitles / closed captions | ✅ | ✅ | ✅ | ✅ | ✅ | `[MVP]` |
| Multiple audio tracks | ✅ | ✅ | ✅ | ✅ Hindi+Eng | ✅ | `[P2]` |
| Skip intro button | ✅ All plans | ✅ Prime members | ❌ Not available ⚠️ | ❌ | ❌ | `[P2]` |
| Skip recap button | ✅ | ✅ | ❌ | ❌ | ❌ | `[P2]` |
| Next episode autoplay | ✅ (10s) | ✅ | ✅ | ✅ | ✅ | `[P2]` |
| Playback speed (0.5x–2x) | ✅ | ✅ | ❌ | ✅ | ✅ | `[P2]` |
| Keyboard shortcuts | ✅ | ✅ | ✅ | ✅ | ✅ | `[MVP]` |
| Progress bar chapter marks | ❌ | ❌ | ❌ | ❌ | ✅ | `[Later]` |
| 10s forward/backward skip | ✅ | ✅ | ✅ | ✅ | ✅ | `[MVP]` |
| PiP (Picture-in-Picture) | ✅ | ✅ | ✅ | ✅ | ✅ | `[P2]` |
| Fullscreen | ✅ | ✅ | ✅ | ✅ | ✅ | `[MVP]` |
| DRM (Widevine / FairPlay) | ✅ | ✅ | ✅ | ✅ | ✅ | `[-]` (doc only) |
| Hover card preview / mini-player | ✅ | ✅ | ❌ | ✅ | ✅ | `[P2]` |
| Chapters / timestamps | ❌ | ❌ | ❌ | ❌ | ✅ | `[Later]` |
| Cast to TV (Chromecast) | ✅ | ✅ | ✅ | ✅ | ✅ | `[-]` |

---

## 5. Personalisation

| Feature | Netflix | Prime Video | Disney+ | Hotstar | YouTube | **Our Priority** |
|---------|---------|-------------|---------|---------|---------|----------------|
| Multiple profiles | ✅ 5 | ✅ 6 | ✅ 7 | ✅ | ❌ | `[MVP]` |
| Kids profile / Kids mode | ✅ | ✅ | ✅ | ✅ | ✅ Kids | `[MVP]` |
| Parental PIN / controls | ✅ | ✅ | ✅ | ✅ | ✅ | `[MVP]` |
| Watchlist ("My List") | ✅ | ✅ | ✅ | ✅ | ✅ Watch Later | `[MVP]` |
| Watch history | ✅ | ✅ | ✅ | ✅ | ✅ | `[MVP]` |
| Like / dislike signals | ✅ | ✅ | ✅ | ✅ | ✅ | `[MVP]` |
| Personalised home rails | ✅ ML-driven | ✅ | ✅ | ✅ | ✅ | `[P2]` |
| Profile avatar / name | ✅ | ✅ | ✅ | ✅ | ✅ | `[MVP]` |
| Notification preferences | ✅ | ✅ | ✅ | ✅ | ✅ | `[Later]` |
| Content language preference | ✅ | ✅ | ✅ | ✅ | ✅ | `[P2]` |

---

## 6. Account, Billing & Entitlements

| Feature | Netflix | Prime Video | Disney+ | Hotstar | YouTube | **Our Priority** |
|---------|---------|-------------|---------|---------|---------|----------------|
| Email + password signup | ✅ | ✅ | ✅ | ✅ | ✅ | `[MVP]` |
| Social login (Google, Apple) | ✅ | ✅ | ✅ | ✅ | ✅ | `[Later]` |
| Subscription plans (tiers) | Standard w/Ads / Standard / Premium ⚠️ | Prime (ads default) / Prime Video channel ⚠️ | Basic (Ads) / Standard / Premium ⚠️ | Free / Super ⚠️ | Free / Premium | `[MVP]` (dummy) |
| Permanent free tier (no trial) | ❌ (ads tier requires payment) | ❌ (ads default but paid) | ❌ (ads tier requires payment) | ✅ (sports free) | ✅ | `[MVP]` (freemium, no ads) |
| Payment integration | Credit card, UPI, gift cards | Credit card, UPI, Amazon Pay | Credit card, UPI | UPI, card | Card | `[P2]` (Razorpay) |
| Device management | ✅ (4 screens) | ✅ | ✅ | ✅ | ✅ | `[P2]` |
| Simultaneous stream limits | 2–4 by plan | 3 | 2–4 | 2–4 | unlimited | `[P2]` |
| Billing history / invoices | ✅ | ✅ | ✅ | ✅ | ✅ | `[P2]` |
| Plan upgrade / downgrade | ✅ | ✅ | ✅ | ✅ | ✅ | `[P2]` |
| Cancel subscription | ✅ | ✅ | ✅ | ✅ | ✅ | `[P2]` |
| Downloads (offline) | ✅ Premium/Standard | ✅ Prime | ✅ Standard+ | ✅ Super | ✅ Premium | `[-]` (no tier offers downloads) |
| Gift subscriptions | ✅ | ❌ | ❌ | ❌ | ❌ | `[-]` |

---

## 7. Admin / CMS

| Feature | Netflix | Prime Video | Disney+ | Hotstar | YouTube | **Our Priority** |
|---------|---------|-------------|---------|---------|---------|----------------|
| Video upload | Internal tool | Internal | Internal | Internal | ✅ Creator Studio | `[MVP]` |
| Metadata management | Internal | Internal | Internal | Internal | ✅ | `[MVP]` |
| Transcoding status | Internal | Internal | Internal | Internal | ✅ | `[MVP]` |
| Thumbnail management | Internal | Internal | Internal | Internal | ✅ | `[MVP]` |
| Subtitle upload | Internal | Internal | Internal | Internal | ✅ | `[P2]` |
| Publishing schedule | Internal | Internal | Internal | Internal | ✅ | `[MVP]` |
| Rail / banner curation | Internal | Internal | Internal | Internal | ✅ | `[MVP]` |
| Basic analytics dashboard | Internal | Internal | Internal | Internal | ✅ YouTube Studio | `[P2]` |
| Content rating management | Internal | Internal | Internal | Internal | ✅ | `[MVP]` |
| User management | Internal | Internal | Internal | Internal | ✅ | `[P2]` |

---

## 8. Platform & Performance

| Feature | Netflix | Prime Video | Disney+ | Hotstar | YouTube | **Our Priority** |
|---------|---------|-------------|---------|---------|---------|----------------|
| Mobile responsive | ✅ | ✅ | ✅ | ✅ | ✅ | `[MVP]` |
| TV / 10-foot UI | ✅ | ✅ | ✅ | ✅ | ✅ | `[P2]` |
| Keyboard navigation | ✅ | ✅ | ✅ | ✅ | ✅ | `[MVP]` |
| WCAG AA accessibility | Partial | Partial | ✅ | Partial | ✅ | `[MVP]` |
| PWA / offline | ❌ | ❌ | ❌ | ❌ | ✅ | `[Later]` |
| Dark mode default | ✅ | ✅ | ✅ | ✅ | ✅ | `[MVP]` |
| Internationalization (i18n) | ✅ | ✅ | ✅ | ✅ | ✅ | `[Later]` |
| SEO (landing pages) | ✅ | ✅ | ✅ | ✅ | ✅ | `[MVP]` |
| Core Web Vitals optimised | ✅ | Partial | ✅ | Partial | ✅ | `[MVP]` |

---

## MVP Feature Summary

### Must-have for Phase 1 launch (`[MVP]`)
1. Home page: billboard + genre rails + top-10 + new releases + continue watching + My List
2. Title detail: metadata, cast, episodes, trailer, add to list, like/dislike
3. Player: HLS ABR, quality selector, subtitles, keyboard shortcuts, resume, 10s skip
4. Search: full-text, autocomplete, genre/rating filters, fuzzy matching
5. Auth: email/password, JWT, multi-profile (up to 5), kids mode, parental PIN
6. Free tier + 3 dummy subscription plans
7. Admin CMS: upload, transcode, metadata, thumbnail, rails curation, publish schedule
8. Responsive UI: mobile + desktop, dark theme, keyboard nav, WCAG AA

### Differentiators vs competitors
- **Full video pipeline visible** (upload → transcode → watch) — most demos fake this
- **Real multi-profile per account** with kids content filtering
- **Clean admin CMS** that non-developers can operate
- **Architecture documented** for microservices extraction — shows engineering maturity

---

## Open Questions

| # | Status | Question |
|---|--------|---------|
| OQ1 | ✅ Closed | Free tier is purely freemium, no ads in Phase 1 (ad-insertion Later). Decision: A9 in doc 01. |
| OQ2 | ✅ Closed | Language filter is a P2 feature. UI will ship English-only for MVP. |
| OQ3 | ✅ Closed | User ratings/reviews (star score) are P2. Like/dislike (thumbs) is MVP. |

---

## Risks

| Risk | Impact |
|------|--------|
| Benchmarked features keep expanding scope | Strict MVP gate required |
| Hover preview (autoplay on card) is complex with HLS init | Defer to P2 with lazy HLS instance |
| Multi-audio track requires specific FFmpeg HLS segmenting | P2 with documented approach |

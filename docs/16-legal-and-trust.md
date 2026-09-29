# 16 – Legal & Trust

> ⚠️ **NEEDS LEGAL REVIEW** — every section below is a planning template for a demo platform. Nothing here is legally binding until reviewed and approved by a qualified attorney.  
> **Demo mode:** The checkout is explicitly labelled as a demo; no card numbers are ever collected.  
> **Version:** v1-draft · 2026-09-29

---

## Summary Table

| Document                   | Route                                  | Status / Implementation                                             | Owner       |
| -------------------------- | -------------------------------------- | ------------------------------------------------------------------- | ----------- |
| Terms of Service           | `/terms` & `/legal/terms`              | ✅ Implemented (Demo disclosure, 18+ rule, plan tiers)              | Legal + Eng |
| Privacy Policy             | `/privacy` & `/legal/privacy`          | ✅ Implemented (DPDPA 2023, GDPR, children rules, retention table)  | Legal + Eng |
| Grievance Redressal        | `/legal/grievance`                     | ✅ Implemented (India IT Rules 2021, Resident Officer, Level I-III) | Legal + Eng |
| Media Attribution (CC BY)  | `/attribution` & `/legal/attributions` | ✅ Implemented (Blender Foundation credits, transcode notes)        | Eng         |
| Takedown Contact (DMCA)    | `/legal/contact` & `/legal/dmca`       | ✅ Implemented (Designated Agent coordinates, notice checklist)     | Legal + Eng |
| Cookie Consent Banner      | First-party cookie preferences         | Local storage + essential session cookies (zero 3rd-party ads)      | Eng + Legal |
| Refund/Cancellation Policy | `/terms` (Section 3)                   | "Demo mode, no real charges" notice                                 | Legal + Eng |
| Data Export/Deletion       | `/api/account`                         | Soft-delete (30-day grace, then hard delete)                        | Eng         |

---

## Terms of Service `[MVP stub]` `[Needs legal review]`

**Route:** `/legal/terms`  
**Stub content (demo):**

> StreamForge is a demonstration platform for a fictional video streaming service. No content is commercially licensed for real-world distribution. By using this platform you acknowledge it is a technology demonstration only, with no guarantees of service availability, data retention, or content accuracy.

**Production requirements (not yet drafted):**

- Acceptable use
- Account termination conditions
- Intellectual property ownership
- Limitation of liability
- Governing law and jurisdiction
- **Age requirement:** `[Needs legal review]` Primary account holders must be **18+ years of age** (legal age of majority) to enter into the subscription agreement and configure parental controls. Minors and children access the service strictly via **Kids profiles** created and supervised by the adult account holder.

---

## Privacy Policy & Statutory Compliance `[MVP stub]` `[Needs legal review]`

**Route:** `/legal/privacy`  
**Stub content (demo):**

> This is a demonstration platform. The following data is collected during the demo: email address, hashed password, watch progress, ratings. Data is not shared with third parties. All data may be reset at any time.

**Production requirements:**

- Data controller identification
- Categories of data collected (see doc 11: play_events, watch_progress, ratings, account)
- Legal basis for processing (consent, legitimate interest)
- Retention periods (see doc 11 GDPR table)
- User rights: access, rectification, erasure, portability, objection
- Cross-border transfers (if applicable)
- Contact for data protection queries
- **India IT Rules 2021 Grievance Officer:** `[Needs legal review]` Under Part III of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, online curated content publishers operating in India must display the contact details of a designated **Grievance Officer** based in India (with statutory 24-hour acknowledgement and 15-day redressal timeline). A dedicated `/legal/grievance` disclosure is required prior to Indian commercial launch.

---

## Cookie Consent & Storage Compliance `[MVP]`

**Implementation:** Banner / Vaul drawer component shown on first visit. Preferences stored in a first-party `sf_consent` cookie.
_(Note: ePrivacy Directive applies equally to `localStorage` and `cookies` under terminal storage access rules; storing essential settings does not require prior consent, but user notice is provided)._

Cookie categories:

| Category           | Cookies / Storage                                   | MVP Default       | Purpose                                                     |
| ------------------ | --------------------------------------------------- | ----------------- | ----------------------------------------------------------- |
| Strictly Necessary | `sf_access_token`, `sf_refresh_token`, `sf_consent` | Always on         | Session authentication and security                         |
| Functional         | `sf_quality_pref`, `sf_subtitle_lang`               | Always on         | Playback volume, quality, and subtitle language preferences |
| Analytics          | (Phase 2: QoS event batching)                       | Off until consent | Playback buffering and crash telemetry                      |
| Marketing          | None planned                                        | N/A               | No third-party ad pixels or tracking scripts                |

---

## DMCA / Takedown Contact

**Route:** `/legal/contact`  
**Content:**

> To report copyright infringement or request content removal, email: **dmca@streamforge.example** (replace with real address before launch).  
> Include: title of the work, your contact information, and the URL of the allegedly infringing content.

**Implementation:** Static page, no form (reduces spam). Email address set via `LEGAL_CONTACT_EMAIL` env var.

---

## Refund & Cancellation `[Needs legal review]`

**Route:** `/legal/refund`

**Demo mode notice (always shown in demo):**

> ⚠️ **Demo Mode** — StreamForge is a technology demonstration. No real payments are processed. No card numbers are collected. Any "subscription" is fictional and carries no financial obligation.

**Production policy stub (not yet drafted — needs legal review):**

- Cancellation: effective at end of current billing period
- Refund eligibility: within N days of charge, if content was unavailable
- Prorated refunds: not offered
- Auto-renewal: clearly disclosed at checkout
- Governing jurisdiction

---

## CC BY Attribution Page & Seed Assets `[MVP]`

**Route:** `/legal/attributions`  
**Required:** Any content served under Creative Commons or other open licenses must be attributed here with direct license links and explicit modification notices.

**Seed content attributions (populated at demo seed time):**

| Title               | License   | License URL                                               | Attribution                                                                       | Modifications & Transcode Notes                                                                                                      |
| ------------------- | --------- | --------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Big Buck Bunny**  | CC BY 3.0 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) | © 2008, Blender Foundation / www.bigbuckbunny.org                                 | Transcoded into multi-bitrate HLS (360p, 480p, 720p, 1080p); audio normalized to AAC stereo; poster frame extracted at 10% duration. |
| **Elephants Dream** | CC BY 2.5 | [CC BY 2.5](https://creativecommons.org/licenses/by/2.5/) | © 2006, Blender Foundation / Netherlands Media Art Institute / orange.blender.org | Transcoded into multi-bitrate HLS ladder; audio downmixed to stereo; seek poster extracted.                                          |
| **Sintel**          | CC BY 3.0 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) | © 2010, Blender Foundation / www.sintel.org                                       | Transcoded into HLS ladder; keyframes aligned at 2s intervals; poster frame generated.                                               |
| **Tears of Steel**  | CC BY 3.0 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) | © 2012, Blender Foundation / mango.blender.org                                    | Transcoded to HLS; visual assets extracted for UI billboard testing.                                                                 |

> **Self-Hosted Seed Artwork:** To prevent third-party hotlinking failures, CSP leaks, and referrer blocking, all seed posters, backdrops, and avatars are **strictly self-hosted** in MinIO/R2 and seeded locally via `npm run seed:media`. No external Google/Cloudflare image CDNs are hotlinked in production runtime.

---

## Data Export & Deletion `[P2]`

### Data Export

**Endpoint:** `GET /api/account/export`  
**Auth:** Requires active session (`requireSession()`)  
**MVP:** Returns `501 Not Implemented`  
**Phase 2:** Returns a JSON file (downloadable) containing:

- Account info (name, email, created_at, plan)
- All profiles (name, avatar, is_kids)
- Watchlist items (title slugs)
- Watch progress (title slug, position, percent)
- Ratings (title slug, value)
- Subscription history

### Data Deletion

**Endpoint:** `DELETE /api/account` or "Delete Account" button in `/account`  
**MVP:** Soft-delete (`accounts.deleted_at = now()`); hard-delete job runs after 30 days  
**Phase 2:** Immediate cascade delete with email confirmation

### Retention Schedule

| Data                  | Retention                       | Deletion method                 |
| --------------------- | ------------------------------- | ------------------------------- |
| `play_events`         | 90 days                         | pg-boss retention job (nightly) |
| `parental_pin_events` | 30 days                         | pg-boss retention job (nightly) |
| `refresh_tokens`      | 30 days from creation           | pg-boss cleanup job             |
| `accounts` (deleted)  | 30 days soft → then hard delete | pg-boss job                     |
| `admin_audit_log`     | 2 years                         | pg-boss retention job (monthly) |

---

## Demo Checkout Constraints

Per doc 03 US-702 and the decision register (OQ-06-03):

1. **No card number fields** — checkout form never renders a card number input, expiry, or CVV field
2. **Demo mode banner** — `<DemoBanner>` component shown on all `/checkout/*` pages: "Demo mode — no real payment is processed"
3. **No Stripe/Razorpay JS loaded** in Phase 1
4. **Confirmation page** explicitly states "This is a simulated subscription"
5. **No email receipts** in Phase 1 (would imply real billing)

---

## Open Questions

| #   | Status                     | Decision / Resolution                                                                                                         |
| --- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| OQ1 | 🟢 Resolved (Eng Template) | Deployed live draft templates (`/terms`, `/privacy`, `/legal/grievance`, `/attribution`) with explicit demo mode disclosures. |
| OQ2 | 🟢 Resolved (Dual Regime)  | Dual jurisdiction model: India DPDPA 2023 & IT Rules 2021 (Resident Officer) combined with EU GDPR data subject rights.       |
| OQ3 | 🟢 Resolved                | Zero third-party ad tracking; essential session cookies and player UI storage tokens disclosed in Privacy Policy.             |
| OQ4 | 🟢 Resolved (Static Route) | Dedicated static route `/attribution` deployed with CC BY 3.0 / 2.5 Blender Foundation credits and modification notes.        |

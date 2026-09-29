import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/navbar/Navbar'
import { Footer } from '@/components/footer/Footer'
import { ShieldAlert, FileText, ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Use | StreamForge',
  description:
    'Terms of Use and subscription service terms for StreamForge, including eligibility, 18+ account holder rules, and demonstration scope.',
}

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col justify-between selection:bg-accent-soft selection:text-accent-300">
      <Navbar />

      <main className="flex-1 pt-24 pb-20 px-page-gutter">
        <div className="max-w-4xl mx-auto space-y-10">
          {/* Breadcrumb & Title */}
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-caption text-text-secondary hover:text-accent-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Back to Browse</span>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent-soft flex items-center justify-center text-accent-400 border border-accent-glow">
                <FileText className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-display-sm sm:text-display-md font-heading font-bold text-text-primary tracking-tight">
                  Terms of Use
                </h1>
                <p className="text-body-sm text-text-secondary">
                  Last updated: September 30, 2026 · Reference Architecture Draft
                </p>
              </div>
            </div>
          </div>

          {/* Demonstration Notice Alert */}
          <div className="p-5 rounded-xl border border-accent-500/30 bg-accent-500/10 text-text-primary space-y-2 relative overflow-hidden backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-accent-400 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="space-y-1 text-body-sm">
                <p className="font-semibold text-accent-300">Demonstration Platform Disclosure</p>
                <p className="text-text-secondary leading-relaxed">
                  StreamForge is a high-performance demonstration platform for a fictional video
                  streaming service. No content is commercially distributed for public licensing.
                  Any subscription tier, checkout action, or payment simulation is fictional and
                  carries zero real-world financial obligation. Credit card numbers are never
                  collected.
                </p>
              </div>
            </div>
          </div>

          {/* Document Content Sections */}
          <div className="space-y-8 text-body text-text-secondary leading-relaxed">
            {/* Section 1 */}
            <section className="space-y-3 p-6 rounded-xl bg-bg-surface/60 border border-border">
              <h2 className="text-heading-md font-heading font-semibold text-text-primary flex items-center gap-2">
                <span className="text-accent-400 text-body font-mono">01.</span> Acceptance of Terms
              </h2>
              <p>
                By creating an account, browsing the catalog, or playing any video stream on
                StreamForge (&quot;the Service&quot;), you acknowledge that you have read,
                understood, and agreed to be bound by these Terms of Use and our companion{' '}
                <Link
                  href="/privacy"
                  className="text-accent-400 hover:text-accent-300 underline underline-offset-4"
                >
                  Privacy Policy
                </Link>
                . If you do not accept these terms in their entirety, you must discontinue your use
                of the platform immediately.
              </p>
            </section>

            {/* Section 2: 18+ Age Requirement */}
            <section
              id="age-requirement"
              className="space-y-3 p-6 rounded-xl bg-bg-surface/60 border border-border"
            >
              <h2 className="text-heading-md font-heading font-semibold text-text-primary flex items-center gap-2">
                <span className="text-accent-400 text-body font-mono">02.</span> Eligibility &amp;
                18+ Account Holder Requirement
              </h2>
              <p>
                To register for an account and execute subscription agreements on StreamForge, you
                must be at least <strong className="text-text-primary">18 years of age</strong> (or
                the legal age of majority in your jurisdiction).
              </p>
              <div className="p-4 rounded-lg bg-bg-base border border-border/80 space-y-2 mt-2">
                <div className="flex items-center gap-2 text-warning font-medium text-body-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Minors &amp; Children Access Rule</span>
                </div>
                <p className="text-caption text-text-secondary">
                  Individuals under 18 years of age may only utilize the service with the explicit
                  involvement, consent, and active supervision of a parent or legal guardian. The
                  adult account holder is solely responsible for creating dedicated{' '}
                  <strong className="text-text-primary">Kids Profiles</strong> and setting a 4-digit
                  parental control PIN to restrict access to mature content tiers.
                </p>
              </div>
            </section>

            {/* Section 3: Subscriptions & Streaming Tiers */}
            <section className="space-y-3 p-6 rounded-xl bg-bg-surface/60 border border-border">
              <h2 className="text-heading-md font-heading font-semibold text-text-primary flex items-center gap-2">
                <span className="text-accent-400 text-body font-mono">03.</span> Subscriptions,
                Plans &amp; Concurrency
              </h2>
              <p>
                StreamForge offers tiered streaming plans subject to the following technical and
                concurrency entitlements:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-lg bg-bg-base border border-border/80 space-y-1">
                  <span className="text-caption font-mono uppercase tracking-wider text-text-muted">
                    Mobile / Free
                  </span>
                  <p className="text-body font-semibold text-text-primary">480p SD Quality</p>
                  <p className="text-caption text-text-secondary">
                    1 simultaneous stream. Stereo AAC audio.
                  </p>
                </div>
                <div className="p-3.5 rounded-lg bg-bg-base border border-border/80 space-y-1">
                  <span className="text-caption font-mono uppercase tracking-wider text-accent-400">
                    Standard
                  </span>
                  <p className="text-body font-semibold text-text-primary">720p HD Quality</p>
                  <p className="text-caption text-text-secondary">
                    2 simultaneous streams. Full HD ready.
                  </p>
                </div>
                <div className="p-3.5 rounded-lg bg-bg-base border border-border/80 space-y-1">
                  <span className="text-caption font-mono uppercase tracking-wider text-accent-300">
                    Premium
                  </span>
                  <p className="text-body font-semibold text-text-primary">1080p Full HD / 4K</p>
                  <p className="text-caption text-text-secondary">
                    4 simultaneous streams. Spatial audio support.
                  </p>
                </div>
              </div>
              <p className="text-caption text-text-muted pt-2">
                You may review and upgrade your streaming tier at any time from the{' '}
                <Link
                  href="/plans"
                  className="text-accent-400 hover:text-accent-300 underline underline-offset-4"
                >
                  Plans &amp; Pricing Directory
                </Link>
                .
              </p>
            </section>

            {/* Section 4: Content Licenses & Creative Commons */}
            <section className="space-y-3 p-6 rounded-xl bg-bg-surface/60 border border-border">
              <h2 className="text-heading-md font-heading font-semibold text-text-primary flex items-center gap-2">
                <span className="text-accent-400 text-body font-mono">04.</span> Open Source Media
                &amp; Creative Commons
              </h2>
              <p>
                Sample cinematic assets featured in StreamForge (including <em>Big Buck Bunny</em>,{' '}
                <em>Sintel</em>, <em>Tears of Steel</em>, and <em>Elephants Dream</em>) are
                open-source media utilized under the{' '}
                <strong className="text-text-primary">
                  Creative Commons Attribution 3.0 &amp; 2.5
                </strong>{' '}
                licenses courtesy of the Blender Foundation.
              </p>
              <p>
                All transcoded renditions, multi-bitrate HLS ladders, and extracted seek posters
                adhere to statutory license conditions. Complete licensing metadata and modification
                notices are cataloged in our{' '}
                <Link
                  href="/attribution"
                  className="text-accent-400 hover:text-accent-300 underline underline-offset-4"
                >
                  Media Attribution Center
                </Link>
                .
              </p>
            </section>

            {/* Section 5: Acceptable Use & Rate Limiting */}
            <section className="space-y-3 p-6 rounded-xl bg-bg-surface/60 border border-border">
              <h2 className="text-heading-md font-heading font-semibold text-text-primary flex items-center gap-2">
                <span className="text-accent-400 text-body font-mono">05.</span> Acceptable Use
                &amp; Technical Security
              </h2>
              <p>
                Users agree not to engage in unauthorized activities that jeopardize platform
                stability or security, including but not limited to:
              </p>
              <ul className="space-y-2 pt-1 text-body-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    className="w-4 h-4 text-accent-400 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>
                    Reverse engineering or tampering with signed HMAC-SHA256 playback URLs and
                    manifest proxies.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    className="w-4 h-4 text-accent-400 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>
                    Executing automated scraping, data extraction, or denial-of-service traffic
                    against API endpoints.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    className="w-4 h-4 text-accent-400 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>
                    Sharing or reselling account credentials outside the primary domestic household.
                  </span>
                </li>
              </ul>
              <p className="text-caption text-text-muted pt-2">
                StreamForge enforces dual-layer Redis token bucket rate limiting (100
                requests/minute general; 10 requests/15 minutes on authentication endpoints).
                Violations result in automatic HTTP 429 throttling and account suspension.
              </p>
            </section>

            {/* Section 6: Grievances & Governing Law */}
            <section className="space-y-3 p-6 rounded-xl bg-bg-surface/60 border border-border">
              <h2 className="text-heading-md font-heading font-semibold text-text-primary flex items-center gap-2">
                <span className="text-accent-400 text-body font-mono">06.</span> Statutory Redressal
                &amp; Governing Law
              </h2>
              <p>
                In compliance with Part III of the Information Technology (Intermediary Guidelines
                and Digital Media Ethics Code) Rules, 2021, grievances regarding content
                classification, maturity ratings, or service conduct can be submitted to our
                designated Resident Grievance Officer.
              </p>
              <p>
                Please refer to our{' '}
                <Link
                  href="/legal/grievance"
                  className="text-accent-400 hover:text-accent-300 underline underline-offset-4"
                >
                  Grievance Redressal Protocol
                </Link>{' '}
                for officer contact coordinates and statutory resolution schedules (acknowledgment
                within 24 hours; decision within 15 days).
              </p>
            </section>
          </div>

          {/* Bottom Back Button */}
          <div className="pt-6 border-t border-border flex items-center justify-between">
            <Link
              href="/"
              className="text-body-sm text-accent-400 hover:text-accent-300 font-medium inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Return to Home</span>
            </Link>
            <div className="flex items-center gap-4 text-caption text-text-muted">
              <Link href="/privacy" className="hover:text-text-primary transition-colors">
                Privacy Policy
              </Link>
              <span>·</span>
              <Link href="/legal/grievance" className="hover:text-text-primary transition-colors">
                Grievance Redressal
              </Link>
              <span>·</span>
              <Link href="/attribution" className="hover:text-text-primary transition-colors">
                Media Attribution
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

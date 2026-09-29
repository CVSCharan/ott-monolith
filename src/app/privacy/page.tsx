import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/navbar/Navbar'
import { Footer } from '@/components/footer/Footer'
import { ShieldCheck, Lock, Database, UserCheck, ArrowLeft, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy | StreamForge',
  description:
    'Privacy Policy and data protection disclosures for StreamForge, including GDPR, India DPDPA 2023 compliance, kids profile safeguards, and data retention schedules.',
}

export default function PrivacyPolicyPage() {
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
                <ShieldCheck className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-display-sm sm:text-display-md font-heading font-bold text-text-primary tracking-tight">
                  Privacy Policy
                </h1>
                <p className="text-body-sm text-text-secondary">
                  Effective Date: September 30, 2026 · Statutory GDPR &amp; DPDPA 2023 Disclosures
                </p>
              </div>
            </div>
          </div>

          {/* Intro Overview Card */}
          <div className="p-6 rounded-xl bg-bg-surface/60 border border-border space-y-3 leading-relaxed text-body text-text-secondary">
            <p>
              At <strong className="text-text-primary">StreamForge Technologies Inc.</strong>{' '}
              (&quot;StreamForge&quot;, &quot;we&quot;, &quot;us&quot;), we take your privacy and
              personal data integrity with utmost seriousness. This Privacy Policy details how we
              collect, store, process, and protect your information across our video streaming
              platform, web applications, and APIs in full compliance with the European Union
              General Data Protection Regulation (GDPR) and the India Digital Personal Data
              Protection Act, 2023 (DPDPA).
            </p>
            <p className="text-caption text-text-muted">
              Demo Notice: As a reference architecture, StreamForge is configured with
              production-grade encryption, Argon2id password hashing, and automated PII redaction.
              Sample database resets may occur periodically in non-production environments.
            </p>
          </div>

          {/* Sections List */}
          <div className="space-y-8 text-body text-text-secondary leading-relaxed">
            {/* Section 1: Data We Collect */}
            <section className="space-y-4 p-6 rounded-xl bg-bg-surface/60 border border-border">
              <h2 className="text-heading-md font-heading font-semibold text-text-primary flex items-center gap-2">
                <span className="text-accent-400 text-body font-mono">01.</span> Categories of Data
                We Collect
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-lg bg-bg-base border border-border/80 space-y-2">
                  <div className="flex items-center gap-2 text-text-primary font-medium text-body-sm">
                    <Lock className="w-4 h-4 text-accent-400" aria-hidden="true" />
                    <span>Account &amp; Auth Credentials</span>
                  </div>
                  <p className="text-caption text-text-secondary">
                    Account email address, salted password hash generated via OWASP-recommended
                    Argon2id (<code className="text-text-muted font-mono">m=65536, t=3, p=4</code>),
                    account subscription tier, and active session refresh tokens.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-bg-base border border-border/80 space-y-2">
                  <div className="flex items-center gap-2 text-text-primary font-medium text-body-sm">
                    <UserCheck className="w-4 h-4 text-accent-400" aria-hidden="true" />
                    <span>Profile &amp; Preferences</span>
                  </div>
                  <p className="text-caption text-text-secondary">
                    Profile name, selected avatar identifier, Kids Mode status, maximum maturity
                    rating cap, and encrypted 4-digit parental control PIN.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-bg-base border border-border/80 space-y-2">
                  <div className="flex items-center gap-2 text-text-primary font-medium text-body-sm">
                    <Database className="w-4 h-4 text-accent-400" aria-hidden="true" />
                    <span>Viewing Progress &amp; Lists</span>
                  </div>
                  <p className="text-caption text-text-secondary">
                    Playback position (timestamp and percentage), watchlist bookmarks,
                    positive/negative title ratings, and resume history.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-bg-base border border-border/80 space-y-2">
                  <div className="flex items-center gap-2 text-text-primary font-medium text-body-sm">
                    <Clock className="w-4 h-4 text-accent-400" aria-hidden="true" />
                    <span>Diagnostics &amp; QoE Telemetry</span>
                  </div>
                  <p className="text-caption text-text-secondary">
                    Consolidated 10-second player beacons (buffer duration, bitrate transitions,
                    frame drops), Core Web Vitals RUM metrics, and IP address for Redis token bucket
                    rate limiting.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2: Children's Privacy */}
            <section className="space-y-3 p-6 rounded-xl bg-bg-surface/60 border border-border">
              <h2 className="text-heading-md font-heading font-semibold text-text-primary flex items-center gap-2">
                <span className="text-accent-400 text-body font-mono">02.</span> Children&apos;s
                Privacy &amp; Kids Profiles (DPDPA &amp; COPPA)
              </h2>
              <p>
                Protecting young viewers is a foundational requirement of our architecture.
                StreamForge provides dedicated{' '}
                <strong className="text-text-primary">Kids Profiles</strong> designed for minors:
              </p>
              <ul className="space-y-2 pt-1 text-body-sm">
                <li className="flex items-start gap-2">
                  <span className="text-accent-400 font-bold">•</span>
                  <span>
                    <strong className="text-text-primary">Strict Content Filtering:</strong> Kids
                    profiles can only query and discover titles rated U or U/A 7+ (
                    <code className="font-mono text-text-muted">minAge &le; 7</code>). Mature rails
                    are purged server-side before response delivery.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-400 font-bold">•</span>
                  <span>
                    <strong className="text-text-primary">Zero Behavioral Profiling:</strong> We do
                    not construct advertising profiles, conduct tracking, or serve behavioral
                    recommendations to Kids profiles.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-400 font-bold">•</span>
                  <span>
                    <strong className="text-text-primary">Parental Exit PIN:</strong> Exiting a Kids
                    profile to access general catalog profiles requires inputting the adult account
                    holder&apos;s 4-digit parental control PIN.
                  </span>
                </li>
              </ul>
            </section>

            {/* Section 3: Cookies and Storage */}
            <section className="space-y-3 p-6 rounded-xl bg-bg-surface/60 border border-border">
              <h2 className="text-heading-md font-heading font-semibold text-text-primary flex items-center gap-2">
                <span className="text-accent-400 text-body font-mono">03.</span> Cookies &amp;
                Browser Storage
              </h2>
              <p>
                StreamForge uses strictly necessary cookies and local storage tokens to provide
                seamless authentication and remember player preferences. We{' '}
                <strong className="text-text-primary">never</strong> install third-party tracking
                scripts, advertising pixels, or cross-site tracking cookies.
              </p>
              <div className="overflow-x-auto pt-2">
                <table className="w-full text-caption text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-text-muted font-mono uppercase text-[11px]">
                      <th className="py-2.5 px-3">Identifier</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Lifespan</th>
                      <th className="py-2.5 px-3">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    <tr>
                      <td className="py-2.5 px-3 font-mono text-text-primary">sf_access_token</td>
                      <td className="py-2.5 px-3">httpOnly Cookie</td>
                      <td className="py-2.5 px-3">15 Minutes</td>
                      <td className="py-2.5 px-3">
                        JWT carrying active account and profile claims.
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono text-text-primary">sf_refresh_token</td>
                      <td className="py-2.5 px-3">httpOnly Cookie</td>
                      <td className="py-2.5 px-3">30 Days</td>
                      <td className="py-2.5 px-3">
                        Scoped to <code className="font-mono text-text-muted">Path=/api/auth</code>{' '}
                        with family rotation.
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono text-text-primary">sf_quality_pref</td>
                      <td className="py-2.5 px-3">Local Storage</td>
                      <td className="py-2.5 px-3">Persistent</td>
                      <td className="py-2.5 px-3">
                        Stores user-selected video rendition quality (e.g. 1080p, Auto).
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono text-text-primary">sf_subtitle_lang</td>
                      <td className="py-2.5 px-3">Local Storage</td>
                      <td className="py-2.5 px-3">Persistent</td>
                      <td className="py-2.5 px-3">
                        Stores audio and closed-caption subtitle preference.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 4: Data Retention Schedule */}
            <section className="space-y-3 p-6 rounded-xl bg-bg-surface/60 border border-border">
              <h2 className="text-heading-md font-heading font-semibold text-text-primary flex items-center gap-2">
                <span className="text-accent-400 text-body font-mono">04.</span> Data Retention
                &amp; Erasure Schedule
              </h2>
              <p>
                In alignment with GDPR Article 5(1)(e) (storage limitation) and DPDPA Section 8(7),
                data is automatically purged on statutory schedules:
              </p>
              <div className="overflow-x-auto pt-2">
                <table className="w-full text-caption text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-text-muted font-mono uppercase text-[11px]">
                      <th className="py-2.5 px-3">Data Classification</th>
                      <th className="py-2.5 px-3">Retention Window</th>
                      <th className="py-2.5 px-3">Automated Deletion Mechanism</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-text-primary">
                        Player QoE Play Events
                      </td>
                      <td className="py-2.5 px-3">90 Days</td>
                      <td className="py-2.5 px-3">Nightly pg-boss retention cleanup worker</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-text-primary">
                        Parental PIN Attempt Logs
                      </td>
                      <td className="py-2.5 px-3">30 Days</td>
                      <td className="py-2.5 px-3">Nightly audit retention cleanup worker</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-text-primary">
                        Expired Refresh Tokens
                      </td>
                      <td className="py-2.5 px-3">30 Days</td>
                      <td className="py-2.5 px-3">Automatic token family pruning</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-text-primary">
                        Deleted User Accounts
                      </td>
                      <td className="py-2.5 px-3">30-day soft delete</td>
                      <td className="py-2.5 px-3">
                        Hard cascade purge of profiles, ratings, and progress
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium text-text-primary">
                        Admin Audit Trail Logs
                      </td>
                      <td className="py-2.5 px-3">2 Years</td>
                      <td className="py-2.5 px-3">Regulatory compliance retention queue</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 5: User Rights */}
            <section className="space-y-3 p-6 rounded-xl bg-bg-surface/60 border border-border">
              <h2 className="text-heading-md font-heading font-semibold text-text-primary flex items-center gap-2">
                <span className="text-accent-400 text-body font-mono">05.</span> Your Rights as a
                Data Principal
              </h2>
              <p>You retain statutory rights over your personal data:</p>
              <ul className="space-y-2 pt-1 text-body-sm">
                <li className="flex items-start gap-2">
                  <span className="text-accent-400 font-bold">•</span>
                  <span>
                    <strong className="text-text-primary">Right to Rectification:</strong> Edit your
                    account profile name, avatars, and parental PIN directly within your profile
                    settings.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-400 font-bold">•</span>
                  <span>
                    <strong className="text-text-primary">
                      Right to Erasure (&quot;Right to be Forgotten&quot;):
                    </strong>{' '}
                    You may request deletion of your account and viewing history. We execute a
                    30-day grace soft-delete followed by immutable cascade deletion.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-400 font-bold">•</span>
                  <span>
                    <strong className="text-text-primary">Right of Grievance Redressal:</strong> In
                    accordance with India IT Rules 2021, you have the right to register complaints
                    regarding data handling and content governance with our Grievance Officer.
                  </span>
                </li>
              </ul>
            </section>

            {/* Section 6: Grievance Contact */}
            <section className="space-y-3 p-6 rounded-xl bg-bg-surface/60 border border-border">
              <h2 className="text-heading-md font-heading font-semibold text-text-primary flex items-center gap-2">
                <span className="text-accent-400 text-body font-mono">06.</span> Grievance Redressal
                &amp; Data Protection Officer
              </h2>
              <p>
                For statutory grievances or inquiries concerning data privacy, contact our
                designated Grievance Officer:
              </p>
              <div className="p-4 rounded-lg bg-bg-base border border-border/80 text-body-sm space-y-1">
                <p>
                  <strong className="text-text-primary">Designation:</strong> Resident Grievance
                  Officer
                </p>
                <p>
                  <strong className="text-text-primary">Entity:</strong> StreamForge Technologies
                  India Pvt. Ltd.
                </p>
                <p>
                  <strong className="text-text-primary">Email:</strong>{' '}
                  <a
                    href="mailto:grievance-officer@streamforge.example.com"
                    className="text-accent-400 hover:text-accent-300 underline underline-offset-4"
                  >
                    grievance-officer@streamforge.example.com
                  </a>
                </p>
                <p>
                  <strong className="text-text-primary">Response Standard:</strong> Acknowledgment
                  within 24 hours · Final resolution within 15 days
                </p>
              </div>
              <p className="text-caption text-text-muted">
                For detailed redressal protocols, visit the{' '}
                <Link
                  href="/legal/grievance"
                  className="text-accent-400 hover:text-accent-300 underline underline-offset-4"
                >
                  Grievance Redressal Mechanism Page
                </Link>
                .
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
              <Link href="/terms" className="hover:text-text-primary transition-colors">
                Terms of Use
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

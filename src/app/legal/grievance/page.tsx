import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/navbar/Navbar'
import { Footer } from '@/components/footer/Footer'
import {
  Scale,
  Mail,
  Clock,
  MapPin,
  ArrowLeft,
  ShieldCheck,
  FileCheck2,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Grievance Redressal Mechanism | StreamForge',
  description:
    'Statutory grievance redressal mechanism and Resident Grievance Officer disclosure under Rule 11 of the India IT Rules, 2021 for StreamForge.',
}

export default function GrievancePage() {
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
                <Scale className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-display-sm sm:text-display-md font-heading font-bold text-text-primary tracking-tight">
                  Grievance Redressal Mechanism
                </h1>
                <p className="text-body-sm text-text-secondary">
                  Statutory Disclosure under Part III of the Information Technology (Intermediary
                  Guidelines and Digital Media Ethics Code) Rules, 2021
                </p>
              </div>
            </div>
          </div>

          {/* Statutory Mandate Overview */}
          <div className="p-6 rounded-xl bg-bg-surface/60 border border-border space-y-3 leading-relaxed text-body text-text-secondary">
            <p>
              As a publisher of online curated content operating in India,{' '}
              <strong className="text-text-primary">
                StreamForge Technologies India Pvt. Ltd.
              </strong>{' '}
              adheres to the Code of Ethics prescribed under the Information Technology
              (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 (&quot;IT Rules
              2021&quot;).
            </p>
            <p>
              Under Rule 11 of the IT Rules 2021, we have instituted a comprehensive three-tier
              grievance redressal structure to address user concerns regarding content
              classification, maturity ratings, child protection, and platform conduct.
            </p>
          </div>

          {/* Tier 1: Resident Grievance Officer */}
          <section className="space-y-4 p-6 rounded-xl bg-bg-surface/60 border border-border">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-heading-md font-heading font-semibold text-text-primary flex items-center gap-2">
                <span className="text-accent-400 font-mono text-body">Level I:</span> Resident
                Grievance Officer (India)
              </h2>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-accent-soft text-accent-300 border border-accent-glow">
                First-Tier Redressal
              </span>
            </div>

            <p className="text-body text-text-secondary">
              For any grievances regarding content published on StreamForge, viewers may communicate
              directly with our appointed Resident Grievance Officer:
            </p>

            {/* Officer Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-lg bg-bg-base border border-border/80 space-y-2">
                <div className="flex items-center gap-2 text-text-primary font-medium text-body-sm">
                  <ShieldCheck className="w-4 h-4 text-accent-400" aria-hidden="true" />
                  <span>Officer Coordinates</span>
                </div>
                <div className="text-caption text-text-secondary space-y-1">
                  <p>
                    <strong className="text-text-primary">Name:</strong> Mr. K. R. Sharma
                  </p>
                  <p>
                    <strong className="text-text-primary">Designation:</strong> Resident Grievance
                    Officer (India)
                  </p>
                  <p>
                    <strong className="text-text-primary">Entity:</strong> StreamForge Technologies
                    India Pvt. Ltd.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-bg-base border border-border/80 space-y-2">
                <div className="flex items-center gap-2 text-text-primary font-medium text-body-sm">
                  <Mail className="w-4 h-4 text-accent-400" aria-hidden="true" />
                  <span>Contact Channels</span>
                </div>
                <div className="text-caption text-text-secondary space-y-1">
                  <p>
                    <strong className="text-text-primary">Official Email:</strong>{' '}
                    <a
                      href="mailto:grievance-officer@streamforge.example.com"
                      className="text-accent-400 hover:text-accent-300 underline underline-offset-4"
                    >
                      grievance-officer@streamforge.example.com
                    </a>
                  </p>
                  <p>
                    <strong className="text-text-primary">Hours:</strong> Mon–Fri, 09:30 AM to 06:30
                    PM IST
                  </p>
                  <p>
                    <strong className="text-text-primary">Phone:</strong> +91 124 456 7890
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-bg-base border border-border/80 space-y-2 sm:col-span-2">
                <div className="flex items-center gap-2 text-text-primary font-medium text-body-sm">
                  <MapPin className="w-4 h-4 text-accent-400" aria-hidden="true" />
                  <span>Official Physical Address</span>
                </div>
                <p className="text-caption text-text-secondary">
                  StreamForge Technologies India Pvt. Ltd., Level 6, Tower B, DLF Cyber City, Phase
                  III, Gurugram, Haryana – 122002, India.
                </p>
              </div>
            </div>

            {/* Statutory Timelines Callout */}
            <div className="p-4 rounded-lg bg-accent-soft/40 border border-accent-glow space-y-2">
              <div className="flex items-center gap-2 text-accent-300 font-semibold text-body-sm">
                <Clock className="w-4 h-4" aria-hidden="true" />
                <span>Statutory Time Commitments (Rule 11)</span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-caption text-text-secondary pt-1">
                <li className="flex items-start gap-2">
                  <span className="text-accent-400 font-bold">•</span>
                  <span>
                    <strong className="text-text-primary">24-Hour Acknowledgment:</strong> Every
                    submitted complaint receives a formal tracking receipt and unique grievance ID
                    within 24 hours.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-400 font-bold">•</span>
                  <span>
                    <strong className="text-text-primary">15-Day Disposal:</strong> The grievance
                    will be addressed, investigated, and a decision formally communicated to the
                    complainant within 15 calendar days.
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* Tier 2 & Tier 3 Escalation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="p-6 rounded-xl bg-bg-surface/60 border border-border space-y-3">
              <h2 className="text-heading-sm font-heading font-semibold text-text-primary flex items-center gap-2">
                <span className="text-accent-400 font-mono text-caption">Level II:</span>{' '}
                Self-Regulatory Body
              </h2>
              <p className="text-body-sm text-text-secondary leading-relaxed">
                If a complainant does not receive a response within 15 days or is dissatisfied with
                the decision of the Grievance Officer, the grievance may be escalated to the
                independent Self-Regulatory Body (SRB) registered with the Ministry of Information
                &amp; Broadcasting.
              </p>
              <p className="text-caption text-text-muted">
                Governing Body: Digital Media Content Regulatory Council (DMCRC) / Indian
                Broadcasting &amp; Digital Foundation (IBDF).
              </p>
            </section>

            <section className="p-6 rounded-xl bg-bg-surface/60 border border-border space-y-3">
              <h2 className="text-heading-sm font-heading font-semibold text-text-primary flex items-center gap-2">
                <span className="text-accent-400 font-mono text-caption">Level III:</span> Oversight
                Mechanism
              </h2>
              <p className="text-body-sm text-text-secondary leading-relaxed">
                The Ministry of Information and Broadcasting (MIB), Government of India, maintains
                an Inter-Departmental Committee for hearing appeals and overseeing publisher
                compliance with the Code of Ethics.
              </p>
              <p className="text-caption text-text-muted">
                Governing Authority: Ministry of Information &amp; Broadcasting, Shastri Bhawan, New
                Delhi – 110001.
              </p>
            </section>
          </div>

          {/* Submission Guidelines */}
          <section className="space-y-4 p-6 rounded-xl bg-bg-surface/60 border border-border">
            <h2 className="text-heading-md font-heading font-semibold text-text-primary flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-accent-400" aria-hidden="true" />
              <span>Grievance Submission Requirements</span>
            </h2>
            <p className="text-body text-text-secondary">
              To expedite investigation and resolution, please ensure your email grievance contains:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-body-sm text-text-secondary">
              <li>
                <strong className="text-text-primary">Complainant Details:</strong> Full legal name,
                registered account email, and phone number.
              </li>
              <li>
                <strong className="text-text-primary">Title Details:</strong> Exact title name,
                season/episode number, and specific playback timestamp (HH:MM:SS) where the
                objectionable scene appears.
              </li>
              <li>
                <strong className="text-text-primary">Nature of Concern:</strong> Explanation of the
                issue (e.g., age rating mismatch, maturity descriptor error, sensitive content
                depiction, or parental control failure).
              </li>
              <li>
                <strong className="text-text-primary">Specific Relief Sought:</strong> The remedy
                requested (e.g., age rating reclassification, content warning tag addition, or
                editorial rectification).
              </li>
            </ol>
          </section>

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
              <Link href="/privacy" className="hover:text-text-primary transition-colors">
                Privacy Policy
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

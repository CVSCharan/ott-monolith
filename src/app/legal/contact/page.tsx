import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/navbar/Navbar'
import { Footer } from '@/components/footer/Footer'
import {
  AlertCircle,
  Mail,
  MapPin,
  ArrowLeft,
  FileText,
  CheckCircle2,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Content Takedown & DMCA Contact | StreamForge',
  description:
    'Copyright infringement notification procedures, designated copyright agent coordinates, and DMCA takedown protocol for StreamForge.',
}

export default function DmcaContactPage() {
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
                <AlertCircle className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-display-sm sm:text-display-md font-heading font-bold text-text-primary tracking-tight">
                  Content Takedown &amp; DMCA Contact
                </h1>
                <p className="text-body-sm text-text-secondary">
                  Designated Copyright Agent Coordinates &amp; Notice of Infringement Guidelines
                </p>
              </div>
            </div>
          </div>

          {/* DMCA / Copyright Overview Card */}
          <div className="p-6 rounded-xl bg-bg-surface/60 border border-border space-y-3 leading-relaxed text-body text-text-secondary">
            <p>
              StreamForge respects the intellectual property rights of creators and copyright
              owners. In compliance with the Digital Millennium Copyright Act (17 U.S.C. § 512) and
              the Indian Copyright Act, 1957, we maintain an expeditious protocol to process notices
              of alleged copyright infringement.
            </p>
            <p className="text-caption text-text-muted">
              Note: StreamForge sample titles are licensed under open Creative Commons CC BY terms.
              For title credits and modification notes, consult our{' '}
              <Link
                href="/attribution"
                className="text-accent-400 hover:text-accent-300 underline underline-offset-4"
              >
                Media Attribution Directory
              </Link>
              .
            </p>
          </div>

          {/* Designated Agent Coordinates */}
          <section className="space-y-4 p-6 rounded-xl bg-bg-surface/60 border border-border">
            <h2 className="text-heading-md font-heading font-semibold text-text-primary flex items-center gap-2">
              <Mail className="w-5 h-5 text-accent-400" aria-hidden="true" />
              <span>Designated Copyright Agent</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-lg bg-bg-base border border-border/80 space-y-1 text-body-sm">
                <p className="font-semibold text-text-primary">Legal &amp; Copyright Affairs</p>
                <p className="text-text-secondary">Attention: Designated DMCA Agent</p>
                <p className="text-text-secondary">StreamForge Technologies Inc.</p>
                <p className="text-caption text-text-muted pt-1">
                  Response Standard: Formal review within 48 business hours.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-bg-base border border-border/80 space-y-1 text-body-sm">
                <p className="font-semibold text-text-primary">Electronic Submission</p>
                <p className="text-text-secondary">
                  Email:{' '}
                  <a
                    href="mailto:dmca@streamforge.example.com"
                    className="text-accent-400 hover:text-accent-300 underline underline-offset-4 font-mono text-caption"
                  >
                    dmca@streamforge.example.com
                  </a>
                </p>
                <p className="text-caption text-text-secondary">
                  Subject Line must include:{' '}
                  <code className="text-text-primary font-mono">
                    &quot;DMCA Takedown Notice – [Title Name]&quot;
                  </code>
                </p>
              </div>

              <div className="p-4 rounded-lg bg-bg-base border border-border/80 space-y-1 text-body-sm sm:col-span-2">
                <p className="font-semibold text-text-primary flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-accent-400" aria-hidden="true" />
                  <span>Physical Address for Formal Legal Process</span>
                </p>
                <p className="text-text-secondary text-caption">
                  StreamForge Legal Operations, Level 6, Tower B, Cyber City, Phase III, Gurugram,
                  Haryana – 122002, India.
                </p>
              </div>
            </div>
          </section>

          {/* Notice Requirements */}
          <section className="space-y-4 p-6 rounded-xl bg-bg-surface/60 border border-border">
            <h2 className="text-heading-md font-heading font-semibold text-text-primary flex items-center gap-2">
              <FileText className="w-5 h-5 text-accent-400" aria-hidden="true" />
              <span>Required Elements for a Valid Infringement Notice</span>
            </h2>
            <p className="text-body-sm text-text-secondary">
              To ensure legal validity and enable our engineering team to locate the contested
              material, your notice must include:
            </p>
            <ul className="space-y-2.5 text-body-sm text-text-secondary pt-1">
              <li className="flex items-start gap-2.5">
                <CheckCircle2
                  className="w-4 h-4 text-accent-400 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span>
                  <strong className="text-text-primary">
                    Identification of the Copyrighted Work:
                  </strong>{' '}
                  A clear description of the copyrighted work claimed to have been infringed, or a
                  representative list if multiple works are involved.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2
                  className="w-4 h-4 text-accent-400 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span>
                  <strong className="text-text-primary">Exact URL / Location:</strong> The specific
                  StreamForge URL or slug (e.g.{' '}
                  <code className="font-mono text-text-muted">/watch/[slug]</code>) where the
                  infringing content is hosted.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2
                  className="w-4 h-4 text-accent-400 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span>
                  <strong className="text-text-primary">Complainant Contact Details:</strong> Full
                  legal name, telephone number, mailing address, and verified email address.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2
                  className="w-4 h-4 text-accent-400 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span>
                  <strong className="text-text-primary">Good-Faith Statement:</strong> A statement
                  that you have a good-faith belief that use of the material in the manner
                  complained of is not authorized by the copyright owner, its agent, or the law.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2
                  className="w-4 h-4 text-accent-400 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span>
                  <strong className="text-text-primary">Perjury Statement &amp; Signature:</strong>{' '}
                  A statement made under penalty of perjury that the information in the notification
                  is accurate and that you are the owner or authorized to act on behalf of the
                  owner, accompanied by an electronic or physical signature.
                </span>
              </li>
            </ul>
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
              <Link href="/legal/grievance" className="hover:text-text-primary transition-colors">
                Grievance Redressal
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

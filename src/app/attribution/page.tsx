import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/navbar/Navbar'
import { Footer } from '@/components/footer/Footer'
import {
  Award,
  Film,
  ExternalLink,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Media Attribution & Open Source Licenses | StreamForge',
  description:
    'Creative Commons CC BY media attributions, open-source film credits (Blender Foundation), and transcode modification notes for StreamForge seed catalog.',
}

interface AttributionItem {
  title: string
  year: string
  director: string
  license: string
  licenseUrl: string
  copyrightHolder: string
  projectUrl: string
  modifications: string[]
}

const SEED_ATTRIBUTIONS: AttributionItem[] = [
  {
    title: 'Big Buck Bunny',
    year: '2008',
    director: 'Sacha Goedegebure',
    license: 'Creative Commons Attribution 3.0 Unported (CC BY 3.0)',
    licenseUrl: 'https://creativecommons.org/licenses/by/3.0/',
    copyrightHolder: '© 2008, Blender Foundation / www.bigbuckbunny.org',
    projectUrl: 'https://peach.blender.org',
    modifications: [
      'Transcoded master video into a 4-tier adaptive bitrate HLS ladder (360p, 480p, 720p, 1080p).',
      'Forced keyframe alignment every 2 seconds (-force_key_frames expr:gte(t,n_forced*2)) for seamless HLS variant switching.',
      'Audio normalized and downmixed to AAC stereo at 128 kbps.',
      'Deterministic high-contrast seek poster extracted at 10% media duration for visual scrubbing.',
    ],
  },
  {
    title: 'Elephants Dream',
    year: '2006',
    director: 'Bassam Kurdali',
    license: 'Creative Commons Attribution 2.5 Generic (CC BY 2.5)',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.5/',
    copyrightHolder:
      '© 2006, Blender Foundation / Netherlands Media Art Institute / orange.blender.org',
    projectUrl: 'https://orange.blender.org',
    modifications: [
      'Transcoded source into fragmented MPEG-TS / HLS segments with independent variant playlists.',
      'Stereo audio resampling to 48 kHz AAC.',
      'Extracted test backdrop and poster frame fixtures for deterministic visual regression auditing.',
    ],
  },
  {
    title: 'Sintel',
    year: '2010',
    director: 'Colin Levy',
    license: 'Creative Commons Attribution 3.0 Unported (CC BY 3.0)',
    licenseUrl: 'https://creativecommons.org/licenses/by/3.0/',
    copyrightHolder: '© 2010, Blender Foundation / www.sintel.org',
    projectUrl: 'https://durian.blender.org',
    modifications: [
      'Segmented into 6-second HLS chunks with HMAC-signed URL manifest rewrite.',
      'Multi-rendition encoding up to 1080p Full HD with capped VBR bitrates.',
      'Seek poster generated for title hero backdrop and quick-view modal demo.',
    ],
  },
  {
    title: 'Tears of Steel',
    year: '2012',
    director: 'Ian Hubert',
    license: 'Creative Commons Attribution 3.0 Unported (CC BY 3.0)',
    licenseUrl: 'https://creativecommons.org/licenses/by/3.0/',
    copyrightHolder: '© 2012, Blender Foundation / mango.blender.org',
    projectUrl: 'https://mango.blender.org',
    modifications: [
      'Transcoded VFX open-source source into HLS multi-bitrate ladder.',
      'Color-space preserve demuxing with -protocol_whitelist file,pipe,crypto.',
      'Keyframe alignment and seek thumbnail generation.',
    ],
  },
]

export default function AttributionPage() {
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
                <Award className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-display-sm sm:text-display-md font-heading font-bold text-text-primary tracking-tight">
                  Media Attribution &amp; Licenses
                </h1>
                <p className="text-body-sm text-text-secondary">
                  Creative Commons Attribution (CC BY) &amp; Open Source Film Credits
                </p>
              </div>
            </div>
          </div>

          {/* Attribution Framework Overview */}
          <div className="p-6 rounded-xl bg-bg-surface/60 border border-border space-y-3 leading-relaxed text-body text-text-secondary">
            <p>
              StreamForge is deeply committed to open culture and creative commons intellectual
              property. Our sample content catalog exclusively incorporates landmark open-source
              short films produced by the{' '}
              <strong className="text-text-primary">Blender Foundation</strong> and open community
              creators.
            </p>
            <p>
              In accordance with Creative Commons Attribution (CC BY) statutory terms, this page
              explicitly credits the original creators, links to copyright licenses, and documents
              all technical transcode modifications performed to adapt these works for adaptive
              bitrate streaming.
            </p>
          </div>

          {/* Self-Hosted Asset Policy Notice */}
          <div className="p-5 rounded-xl border border-accent-500/30 bg-accent-500/10 text-text-primary space-y-2 relative overflow-hidden backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-accent-400 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="space-y-1 text-body-sm">
                <p className="font-semibold text-accent-300">
                  Self-Hosted Asset Architecture (No Third-Party Hotlinking)
                </p>
                <p className="text-text-secondary leading-relaxed">
                  To prevent cross-site tracking leaks, Content Security Policy violations, and
                  external CDN failure points, all video segments, thumbnails, and posters are{' '}
                  <strong className="text-text-primary">strictly self-hosted</strong> in local MinIO
                  or Cloudflare R2 storage. No third-party image CDNs are hotlinked at runtime.
                </p>
              </div>
            </div>
          </div>

          {/* Attributions Cards */}
          <div className="space-y-6">
            <h2 className="text-heading-md font-heading font-semibold text-text-primary flex items-center gap-2">
              <Film className="w-5 h-5 text-accent-400" aria-hidden="true" />
              <span>Catalog Title Credits &amp; Technical Modifications</span>
            </h2>

            <div className="grid grid-cols-1 gap-6">
              {SEED_ATTRIBUTIONS.map((item) => (
                <article
                  key={item.title}
                  className="p-6 rounded-xl bg-bg-surface/60 border border-border space-y-4 hover:border-accent-500/30 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                    <div>
                      <h3 className="text-heading-sm font-heading font-bold text-text-primary">
                        {item.title}{' '}
                        <span className="text-text-muted font-normal text-body-sm">
                          ({item.year})
                        </span>
                      </h3>
                      <p className="text-caption text-text-secondary">
                        Directed by {item.director}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={item.licenseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-accent-soft text-accent-300 border border-accent-glow hover:bg-accent-500/20 transition-colors"
                      >
                        <span>
                          {item.license.split(' ')[0]} {item.license.split(' ')[1]}
                        </span>
                        <ExternalLink className="w-3 h-3" aria-hidden="true" />
                      </a>
                      <a
                        href={item.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-bg-base text-text-secondary border border-border hover:text-text-primary transition-colors"
                      >
                        <span>Official Project</span>
                        <ExternalLink className="w-3 h-3" aria-hidden="true" />
                      </a>
                    </div>
                  </div>

                  <div className="text-body-sm text-text-secondary space-y-1">
                    <p>
                      <strong className="text-text-primary">Copyright Notice:</strong>{' '}
                      {item.copyrightHolder}
                    </p>
                    <p>
                      <strong className="text-text-primary">Full License:</strong> {item.license}
                    </p>
                  </div>

                  {/* Modifications List */}
                  <div className="p-4 rounded-lg bg-bg-base border border-border/80 space-y-2">
                    <p className="text-caption font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-accent-400" aria-hidden="true" />
                      <span>Transcode &amp; Media Adaptation Notes</span>
                    </p>
                    <ul className="space-y-1.5 text-caption text-text-secondary">
                      {item.modifications.map((mod, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2
                            className="w-3.5 h-3.5 text-accent-400 shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                          <span>{mod}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
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

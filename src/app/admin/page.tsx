import Link from 'next/link'
import {
  Film,
  Layers,
  Cpu,
  ShieldCheck,
  Plus,
  Sliders,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Admin Console | StreamForge',
}

export default function AdminOverviewPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="text-heading-1 font-display font-bold text-text-primary tracking-tight">
            Platform Operations & Management
          </h1>
          <p className="text-body-sm text-text-secondary mt-1">
            Enterprise administration console for StreamForge media catalog, delivery, and system
            health.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/content"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-accent-500 hover:bg-accent-600 text-white font-semibold text-body-sm transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Title</span>
          </Link>
          <Link
            href="/admin/rails"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-bg-surface hover:bg-bg-card border border-border text-text-primary font-semibold text-body-sm transition-colors"
          >
            <Sliders className="w-4 h-4" />
            <span>Curate Rails</span>
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-xl bg-bg-surface/80 border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-secondary mb-3">
            <span className="text-caption font-semibold uppercase tracking-wider">
              Catalog Titles
            </span>
            <Film className="w-4 h-4 text-accent-400" />
          </div>
          <div>
            <span className="text-display-md font-bold text-text-primary">12</span>
            <p className="text-caption text-text-muted mt-1">100% Published & Synced</p>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-bg-surface/80 border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-secondary mb-3">
            <span className="text-caption font-semibold uppercase tracking-wider">
              Subscription Plans
            </span>
            <Layers className="w-4 h-4 text-accent-400" />
          </div>
          <div>
            <span className="text-display-md font-bold text-text-primary">3 Tiers</span>
            <p className="text-caption text-text-muted mt-1">Free · Standard · Premium</p>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-bg-surface/80 border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-secondary mb-3">
            <span className="text-caption font-semibold uppercase tracking-wider">
              Transcode Worker
            </span>
            <Cpu className="w-4 h-4 text-accent-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-success"></span>
              <span className="text-heading-2 font-bold text-text-primary">Healthy</span>
            </div>
            <p className="text-caption text-text-muted mt-1">50 GB scratch volume active</p>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-bg-surface/80 border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-secondary mb-3">
            <span className="text-caption font-semibold uppercase tracking-wider">
              Security State
            </span>
            <ShieldCheck className="w-4 h-4 text-accent-400" />
          </div>
          <div>
            <span className="text-heading-2 font-bold text-text-primary">Enforced</span>
            <p className="text-caption text-text-muted mt-1">CSP, HMAC & Redis rate limiting</p>
          </div>
        </div>
      </div>

      {/* Operations Quick Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Panel 1: Content Library */}
        <div className="p-6 rounded-xl bg-bg-surface/60 border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Film className="w-5 h-5 text-accent-400" />
              <h2 className="font-display font-bold text-heading-3 text-text-primary">
                Content Management
              </h2>
            </div>
            <Link
              href="/admin/content"
              className="text-caption font-semibold text-accent-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <p className="text-body-sm text-text-secondary mb-4">
            Manage metadata, age ratings (U, U/A, A), plan tier minimums, trailer assets, and
            publishing schedules.
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-lg bg-bg-card border border-border/50 text-body-sm">
              <span className="font-medium text-text-primary">Tears of Steel</span>
              <span className="text-caption text-success font-semibold">
                Published · Standard Tier
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-bg-card border border-border/50 text-body-sm">
              <span className="font-medium text-text-primary">Big Buck Bunny</span>
              <span className="text-caption text-accent-400 font-semibold">
                Published · Free Tier
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-bg-card border border-border/50 text-body-sm">
              <span className="font-medium text-text-primary">Sintel</span>
              <span className="text-caption text-success font-semibold">
                Published · Standard Tier
              </span>
            </div>
          </div>
        </div>

        {/* Panel 2: Live Transcode & Delivery */}
        <div className="p-6 rounded-xl bg-bg-surface/60 border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-accent-400" />
              <h2 className="font-display font-bold text-heading-3 text-text-primary">
                Delivery & Transcoding
              </h2>
            </div>
            <Link
              href="/admin/transcode"
              className="text-caption font-semibold text-accent-400 hover:underline flex items-center gap-1"
            >
              <span>Inspect Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <p className="text-body-sm text-text-secondary mb-4">
            Docker worker pipeline status, multi-bitrate HLS ladders (360p to 1080p), and
            timing-safe HMAC URL signing.
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-lg bg-bg-card border border-border/50 text-body-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="text-text-primary font-medium">HLS Master & Segment Proxy</span>
              </div>
              <span className="text-caption text-text-muted">Active (/api/hls)</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-bg-card border border-border/50 text-body-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="text-text-primary font-medium">Resolution Ladder</span>
              </div>
              <span className="text-caption text-text-muted">360p · 480p · 720p · 1080p</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-bg-card border border-border/50 text-body-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="text-text-primary font-medium">Consolidated QoS Beacon</span>
              </div>
              <span className="text-caption text-text-muted">10s Debounce · Buffer Ratio</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

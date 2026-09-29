import Link from 'next/link'
import { Film, Home, Layers, Compass } from 'lucide-react'

export const metadata = {
  title: '404 – Scene Not Found | StreamForge',
  description: 'The requested title or page could not be found.',
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-primary)] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--color-accent-soft)] rounded-full blur-[140px] pointer-events-none opacity-40"></div>

      {/* Main Container */}
      <div className="relative z-10 max-w-lg w-full text-center space-y-8">
        {/* Brand Icon Header */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-xl mb-2">
          <Film className="w-8 h-8 text-[var(--color-accent-400)] animate-pulse" />
        </div>

        {/* 404 Display */}
        <div className="space-y-3">
          <span className="text-[12px] font-bold uppercase tracking-[0.25em] text-[var(--color-accent-400)] bg-[var(--color-accent-soft)] px-3 py-1 rounded-full border border-[var(--color-accent-primary)]/30">
            Error 404 · Signal Lost
          </span>
          <h1 className="text-display-md md:text-display-lg font-display font-extrabold tracking-tight text-white">
            Scene Not Found
          </h1>
          <p className="text-body-md text-[var(--color-text-secondary)] leading-relaxed">
            The film reel, asset, or page you were looking for doesn&apos;t exist, has expired from our streaming catalog, or was moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[var(--color-accent-500)] hover:bg-[var(--color-accent-600)] text-white font-semibold text-body-sm transition-all shadow-lg shadow-[var(--color-accent-500)]/20 active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>

          <Link
            href="/plans"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-body-sm transition-all active:scale-95"
          >
            <Layers className="w-4 h-4 text-[var(--color-accent-400)]" />
            <span>View Subscription Plans</span>
          </Link>
        </div>

        {/* Popular Quick Links */}
        <div className="pt-8 border-t border-white/10">
          <p className="text-caption text-[var(--color-text-muted)] uppercase tracking-wider mb-3 flex items-center justify-center gap-1.5 font-semibold">
            <Compass className="w-3.5 h-3.5" /> Popular Destinations
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-caption">
            <Link
              href="/"
              className="text-[var(--color-text-secondary)] hover:text-white transition-colors underline-offset-4 hover:underline"
            >
              Trending Movies
            </Link>
            <span className="text-white/20">·</span>
            <Link
              href="/plans"
              className="text-[var(--color-text-secondary)] hover:text-white transition-colors underline-offset-4 hover:underline"
            >
              Pricing & Tiers
            </Link>
            <span className="text-white/20">·</span>
            <Link
              href="/api/docs"
              target="_blank"
              className="text-[var(--color-text-secondary)] hover:text-white transition-colors underline-offset-4 hover:underline"
            >
              API Reference
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

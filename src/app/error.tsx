'use client'

import * as React from 'react'
import Link from 'next/link'
import { AlertOctagon, RotateCcw, Home, LifeBuoy } from 'lucide-react'

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    // Client telemetry or log emission
    if (typeof window !== 'undefined') {
      try {
        const payload = JSON.stringify({
          message: error.message,
          digest: error.digest,
          name: error.name,
          url: window.location.pathname,
        })
        if (navigator.sendBeacon) {
          navigator.sendBeacon(
            '/api/telemetry/rum',
            new Blob([payload], { type: 'application/json' }),
          )
        }
      } catch {
        // Non-blocking telemetry
      }
    }
  }, [error])

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-primary)] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient Red/Orange Warning Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-red-500/10 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="relative z-10 max-w-lg w-full text-center space-y-6">
        {/* Warning Icon Badge */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 shadow-2xl backdrop-blur-xl">
          <AlertOctagon className="w-8 h-8 text-red-400" />
        </div>

        {/* Headline & Details */}
        <div className="space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
            Playback Interrupted · System Error
          </span>
          <h1 className="text-display-md font-display font-extrabold tracking-tight text-white">
            Something went off script
          </h1>
          <p className="text-body-md text-[var(--color-text-secondary)] leading-relaxed">
            An unexpected error occurred during rendering. Our automated telemetry has logged this
            incident.
          </p>

          {error.digest && (
            <div className="inline-block p-2 rounded bg-black/40 border border-white/10 text-caption font-mono text-[var(--color-text-muted)]">
              Incident ID: <span className="text-white font-semibold">{error.digest}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[var(--color-accent-500)] hover:bg-[var(--color-accent-600)] text-white font-semibold text-body-sm transition-all shadow-lg shadow-[var(--color-accent-500)]/20 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-body-sm transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
        </div>

        {/* Diagnostics & Support */}
        <div className="pt-6 border-t border-white/10 flex items-center justify-center gap-2 text-caption text-[var(--color-text-muted)]">
          <LifeBuoy className="w-4 h-4 text-[var(--color-accent-400)]" />
          <span>Need assistance? Check system status via</span>
          <Link
            href="/api/health/ready"
            target="_blank"
            className="text-white underline underline-offset-4 hover:text-[var(--color-accent-300)]"
          >
            Readiness Probe
          </Link>
        </div>
      </div>
    </div>
  )
}

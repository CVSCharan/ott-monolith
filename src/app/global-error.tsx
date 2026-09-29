'use client'

import * as React from 'react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col items-center justify-center p-6 bg-[#0d0d0f] text-[#f4f4f6] font-sans">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-red-500/20 text-red-400 font-bold text-xl border border-red-500/30">
            !
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Critical System Error</h1>
            <p className="text-sm text-gray-400 leading-relaxed">
              StreamForge encountered a critical layout error. The application could not load its
              core layout shell.
            </p>
            {error.digest && (
              <p className="text-xs font-mono text-gray-500">Digest: {error.digest}</p>
            )}
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="px-5 py-2.5 rounded-lg bg-[#6366f1] hover:bg-[#4f46e5] text-white font-semibold text-sm transition-colors shadow-lg shadow-[#6366f1]/20"
            >
              Reload Application
            </button>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-colors border border-white/10"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}

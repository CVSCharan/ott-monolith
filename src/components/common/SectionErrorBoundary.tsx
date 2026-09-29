'use client'

import * as React from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

interface Props {
  children: React.ReactNode
  fallbackTitle?: string
}

interface State {
  hasError: boolean
  error?: Error
}

export class SectionErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Non-blocking telemetry
    if (typeof window !== 'undefined' && navigator.sendBeacon) {
      try {
        const payload = JSON.stringify({
          error: error.message,
          componentStack: errorInfo.componentStack,
        })
        navigator.sendBeacon(
          '/api/telemetry/rum',
          new Blob([payload], { type: 'application/json' }),
        )
      } catch {
        // Ignore telemetry failure
      }
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-xl bg-bg-surface/60 border border-border/80 flex flex-col items-center justify-center text-center space-y-3 my-4">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-text-primary text-body-sm">
              {this.props.fallbackTitle || 'Section temporarily unavailable'}
            </h4>
            <p className="text-caption text-text-muted mt-0.5">
              We couldn&apos;t load this content rail right now.
            </p>
          </div>
          <button
            type="button"
            onClick={this.handleRetry}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-text-secondary hover:text-text-primary text-caption font-semibold transition-colors border border-border"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

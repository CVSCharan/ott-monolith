'use client'

import { useReportWebVitals } from 'next/web-vitals'

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    try {
      const body = JSON.stringify({
        id: metric.id,
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: (metric as { delta?: number }).delta,
        navigationType: (metric as { navigationType?: string }).navigationType,
        url: typeof window !== 'undefined' ? window.location.pathname : '',
      })

      const url = '/api/telemetry/rum'
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const blob = new Blob([body], { type: 'application/json' })
        navigator.sendBeacon(url, blob)
      } else {
        fetch(url, {
          method: 'POST',
          body,
          headers: { 'Content-Type': 'application/json' },
          keepalive: true,
        }).catch(() => {
          // Non-blocking telemetry
        })
      }
    } catch {
      // Ignore client telemetry reporting errors
    }
  })

  return null
}

import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

interface WebVitalPayload {
  id?: string
  name: string
  value: number
  rating?: 'good' | 'needs-improvement' | 'poor'
  delta?: number
  navigationType?: string
  url?: string
}

const ALLOWED_METRICS = new Set(['CLS', 'FCP', 'FID', 'INP', 'LCP', 'TTFB'])

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || ''
    let data: WebVitalPayload

    if (contentType.includes('application/json')) {
      data = await req.json()
    } else {
      const text = await req.text()
      data = JSON.parse(text)
    }

    if (!data || !data.name || typeof data.value !== 'number') {
      return NextResponse.json({ error: 'Invalid web vitals telemetry payload' }, { status: 400 })
    }

    // Only accept recognized Core Web Vitals
    if (!ALLOWED_METRICS.has(data.name.toUpperCase())) {
      return NextResponse.json({ error: 'Unsupported metric name' }, { status: 422 })
    }

    // Log structured RUM metric with Pino (Morgan/Datadog compliant)
    logger.info(
      {
        metric: data.name,
        value: Math.round(data.value * 100) / 100,
        rating: data.rating || 'unknown',
        delta: data.delta,
        url: data.url || req.headers.get('referer') || '/',
        userAgent: req.headers.get('user-agent'),
      },
      'Core Web Vitals RUM telemetry ingested',
    )

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    logger.warn({ err: error }, 'Failed to ingest RUM telemetry')
    return new NextResponse(null, { status: 400 })
  }
}

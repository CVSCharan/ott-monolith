import { NextResponse } from 'next/server'
import { getReadinessStatus } from '@/modules/health'

/**
 * Readiness Probe: Verifies internal dependency availability (Postgres & Redis).
 * Used by container orchestrators for routing ingress traffic.
 */
export async function GET() {
  const result = await getReadinessStatus()
  const isHealthy = result.status === 'ok'

  return NextResponse.json(result, {
    status: isHealthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}

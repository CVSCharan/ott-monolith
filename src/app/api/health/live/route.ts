import { NextResponse } from 'next/server'

/**
 * Liveness Probe: Verifies HTTP process is alive.
 * Zero internal dependency checks (used by Kubernetes / Docker health checks).
 */
export async function GET() {
  return NextResponse.json(
    { status: 'ok', timestamp: new Date().toISOString() },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  )
}

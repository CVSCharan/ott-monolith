import { NextRequest, NextResponse } from 'next/server'
import { subscribeAccountToPlan } from '@/modules/billing'
import { verifyAccessToken } from '@/lib/jwt'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const accessToken =
      req.cookies.get('access_token')?.value || req.cookies.get('sf_access_token')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized: login required' }, { status: 401 })
    }

    const payload = await verifyAccessToken(accessToken)
    if (!payload || !payload.sub) {
      return NextResponse.json({ error: 'Unauthorized: invalid session' }, { status: 401 })
    }

    const body = await req.json()
    const { planId } = body

    if (!planId || typeof planId !== 'string') {
      return NextResponse.json({ error: 'Bad Request: planId is required' }, { status: 400 })
    }

    const result = await subscribeAccountToPlan(payload.sub, planId)

    return NextResponse.json({
      data: result,
      meta: { timestamp: new Date().toISOString() },
    })
  } catch (error) {
    logger.error({ err: error }, 'Failed to subscribe to plan')
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 },
    )
  }
}

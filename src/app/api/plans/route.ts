import { NextResponse } from 'next/server'
import { getPlansList } from '@/modules/billing'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const plans = await getPlansList()
    return NextResponse.json({
      data: plans,
      meta: { count: plans.length },
    })
  } catch (error) {
    logger.error({ err: error }, 'Failed to fetch plans')
    return NextResponse.json(
      { error: 'Internal server error while fetching plans' },
      { status: 500 },
    )
  }
}

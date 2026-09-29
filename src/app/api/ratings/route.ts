import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/modules/auth'
import { rateTitle } from '@/modules/content'

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser()
    if (!user?.profileId) {
      return NextResponse.json({ error: 'Active profile required' }, { status: 401 })
    }

    const body = await req.json()
    const { titleId, value } = body

    if (!titleId || !['like', 'dislike'].includes(value)) {
      return NextResponse.json(
        { error: 'Valid titleId and value ("like" | "dislike") required' },
        { status: 400 }
      )
    }

    const result = await rateTitle(user.profileId, titleId, value)
    return NextResponse.json({ data: result })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'FAILED_TO_RATE_TITLE'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

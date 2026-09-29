import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/modules/auth'
import { recordPlayerBeacon } from '@/modules/video'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const user = await getSessionUser()
    const userAgent = req.headers.get('user-agent') ?? undefined

    const result = await recordPlayerBeacon(body, user, userAgent)

    return NextResponse.json(
      {
        data: result,
      },
      { status: 202 }
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'FAILED_TO_PROCESS_BEACON'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/modules/auth'
import {
  registerPlaybackSession,
  getActivePlaybackSessionsForAccount,
  ConcurrentStreamLimitError,
} from '@/modules/video'

export async function GET() {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }

    const data = await getActivePlaybackSessionsForAccount(user.sub)
    return NextResponse.json({ data })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'FAILED_TO_FETCH_SESSIONS'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }

    const body = await req.json()
    const { titleId, deviceType } = body

    if (!titleId || typeof titleId !== 'string') {
      return NextResponse.json({ error: 'titleId is required' }, { status: 400 })
    }

    const forwardedFor = req.headers.get('x-forwarded-for')
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : req.headers.get('x-real-ip') ?? undefined

    const session = await registerPlaybackSession({
      accountId: user.sub,
      profileId: user.profileId ?? user.sub,
      titleId,
      deviceType: typeof deviceType === 'string' ? deviceType : undefined,
      ipAddress,
    })

    return NextResponse.json({ data: session }, { status: 201 })
  } catch (err: unknown) {
    if (err instanceof ConcurrentStreamLimitError) {
      return NextResponse.json(
        {
          error: 'CONCURRENT_STREAM_LIMIT_EXCEEDED',
          message: err.message,
          maxStreams: err.maxStreams,
          activeStreams: err.activeStreams,
          activeSessions: err.activeSessions,
        },
        { status: 409 },
      )
    }

    const message = err instanceof Error ? err.message : 'FAILED_TO_START_SESSION'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

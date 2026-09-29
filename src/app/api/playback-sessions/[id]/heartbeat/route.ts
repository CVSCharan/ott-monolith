import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/modules/auth'
import { sendPlaybackHeartbeat } from '@/modules/video'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }

    const { id } = await params
    const result = await sendPlaybackHeartbeat(id, user.sub)

    if (!result.success) {
      return NextResponse.json(
        { error: 'SESSION_TERMINATED', reason: result.reason },
        { status: 410 },
      )
    }

    return NextResponse.json({
      success: true,
      lastHeartbeatAt: result.lastHeartbeatAt,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'FAILED_TO_SEND_HEARTBEAT'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/modules/auth'
import { terminatePlaybackSession } from '@/modules/video'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }

    const { id } = await params
    const result = await terminatePlaybackSession(id, user.sub, user.role === 'admin')

    if (!result.success) {
      return NextResponse.json({ error: result.reason ?? 'SESSION_NOT_FOUND' }, { status: 404 })
    }

    return NextResponse.json({ success: true, terminatedSessionId: id })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'FAILED_TO_TERMINATE_SESSION'
    if (message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/modules/auth'
import { getVideoPlayback } from '@/modules/video'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  try {
    const { assetId } = await params
    const user = await getSessionUser()
    const playback = await getVideoPlayback(assetId, user)

    return NextResponse.json({
      data: playback,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'FAILED_TO_RESOLVE_PLAYBACK'

    if (message === 'VIDEO_NOT_FOUND') {
      return NextResponse.json({ error: 'Video asset not found' }, { status: 404 })
    }
    if (message === 'KIDS_RESTRICTED') {
      return NextResponse.json(
        { error: 'This title is restricted on Kids profiles' },
        { status: 403 }
      )
    }
    if (message === 'ENTITLEMENT_REQUIRED') {
      return NextResponse.json(
        { error: 'Subscription upgrade required to watch this title' },
        { status: 403 }
      )
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}

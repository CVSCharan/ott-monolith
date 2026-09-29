import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/modules/auth'
import { removeFromWatchlist } from '@/modules/content'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ titleId: string }> },
) {
  try {
    const { titleId } = await params
    const user = await getSessionUser()
    if (!user?.profileId) {
      return NextResponse.json({ error: 'Active profile required' }, { status: 401 })
    }

    await removeFromWatchlist(user.profileId, titleId)
    return new Response(null, { status: 204 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'FAILED_TO_REMOVE_WATCHLIST'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

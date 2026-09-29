import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/modules/auth'
import { getWatchlist, addToWatchlist } from '@/modules/content'

export async function GET() {
  try {
    const user = await getSessionUser()
    if (!user?.profileId) {
      return NextResponse.json({ error: 'Active profile required' }, { status: 401 })
    }

    const items = await getWatchlist(user.profileId, user)
    return NextResponse.json({ data: items })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'FAILED_TO_FETCH_WATCHLIST'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser()
    if (!user?.profileId) {
      return NextResponse.json({ error: 'Active profile required' }, { status: 401 })
    }

    const body = await req.json()
    const { titleId } = body

    if (!titleId) {
      return NextResponse.json({ error: 'titleId is required' }, { status: 400 })
    }

    const item = await addToWatchlist(user.profileId, titleId)
    return NextResponse.json({ data: item }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'FAILED_TO_ADD_TO_WATCHLIST'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

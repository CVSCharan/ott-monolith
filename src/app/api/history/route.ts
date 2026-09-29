import { NextResponse } from 'next/server'
import { getSessionUser } from '@/modules/auth'
import { getWatchHistory } from '@/modules/content'

export async function GET() {
  try {
    const user = await getSessionUser()
    if (!user?.profileId) {
      return NextResponse.json({ error: 'Active profile required' }, { status: 401 })
    }

    const history = await getWatchHistory(user.profileId, user)
    return NextResponse.json({ data: history })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'FAILED_TO_FETCH_HISTORY'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

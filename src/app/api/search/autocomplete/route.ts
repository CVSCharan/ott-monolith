import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/modules/auth'
import { getAutocomplete } from '@/modules/content'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q') || ''

    if (query.trim().length < 2) {
      return NextResponse.json({ data: [] })
    }

    const user = await getSessionUser()
    const suggestions = await getAutocomplete(query, user)

    return NextResponse.json(
      { data: suggestions },
      {
        headers: {
          'Cache-Control': user ? 'no-store' : 'public, s-maxage=30',
        },
      },
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'FAILED_TO_AUTOCOMPLETE'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

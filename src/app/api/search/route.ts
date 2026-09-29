import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/modules/auth'
import { searchCatalog } from '@/modules/content'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q') || ''
    const genre = searchParams.get('genre') || undefined
    const type = searchParams.get('type') || undefined
    const minAge = searchParams.get('minAge')
      ? parseInt(searchParams.get('minAge')!, 10)
      : undefined

    const user = await getSessionUser()
    const results = await searchCatalog(query, { genre, type, minAge }, user)

    return NextResponse.json({
      data: results,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'FAILED_TO_SEARCH'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

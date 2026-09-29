import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/modules/auth'
import { getTitleDetail } from '@/modules/content'

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const user = await getSessionUser()
    const detail = await getTitleDetail(slug, user)

    return NextResponse.json({
      data: detail,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'FAILED_TO_LOAD_TITLE'
    if (message === 'TITLE_NOT_FOUND') {
      return NextResponse.json({ error: 'Title not found' }, { status: 404 })
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

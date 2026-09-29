import { NextResponse } from 'next/server'
import { getSessionUser } from '@/modules/auth'
import { getHomeCatalog } from '@/modules/content'

export async function GET() {
  try {
    const user = await getSessionUser()
    const catalog = await getHomeCatalog(user)

    return NextResponse.json({
      data: catalog,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'FAILED_TO_LOAD_RAILS'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

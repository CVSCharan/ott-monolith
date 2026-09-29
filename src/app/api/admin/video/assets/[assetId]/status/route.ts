import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/modules/auth'
import { getVideoAssetStatus } from '@/modules/video'

export async function GET(req: NextRequest, { params }: { params: Promise<{ assetId: string }> }) {
  try {
    await requireAdmin()
    const { assetId } = await params
    const status = await getVideoAssetStatus(assetId)

    return NextResponse.json({ data: status })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'FAILED_TO_FETCH_STATUS'
    if (message === 'UNAUTHORIZED' || message === 'FORBIDDEN') {
      return NextResponse.json({ error: message }, { status: 403 })
    }
    if (message === 'VIDEO_NOT_FOUND') {
      return NextResponse.json({ error: 'Video asset not found' }, { status: 404 })
    }
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

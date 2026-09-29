import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/modules/auth'
import { initiateVideoUpload } from '@/modules/video'

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const body = await req.json()
    const { filename, sizeBytes, titleId, episodeId } = body

    if (!filename || typeof sizeBytes !== 'number') {
      return NextResponse.json(
        { error: 'Missing required parameters: filename, sizeBytes' },
        { status: 400 },
      )
    }

    const result = await initiateVideoUpload({
      filename,
      sizeBytes,
      titleId,
      episodeId,
    })

    return NextResponse.json({ data: result }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'FAILED_TO_INITIATE_UPLOAD'
    if (message === 'UNAUTHORIZED' || message === 'FORBIDDEN') {
      return NextResponse.json({ error: message }, { status: 403 })
    }
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

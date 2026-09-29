import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/modules/auth'
import { completeVideoUpload } from '@/modules/video'

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const body = await req.json()
    const { uploadId, s3Key, assetId, parts } = body

    if (!uploadId || !s3Key || !assetId || !Array.isArray(parts)) {
      return NextResponse.json(
        { error: 'Missing required parameters: uploadId, s3Key, assetId, parts' },
        { status: 400 },
      )
    }

    const result = await completeVideoUpload({
      uploadId,
      s3Key,
      assetId,
      parts,
    })

    return NextResponse.json({ data: result })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'FAILED_TO_COMPLETE_UPLOAD'
    if (message === 'UNAUTHORIZED' || message === 'FORBIDDEN') {
      return NextResponse.json({ error: message }, { status: 403 })
    }
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

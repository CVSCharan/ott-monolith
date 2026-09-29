import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/modules/auth'
import { getPartUploadUrl } from '@/modules/video'

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const body = await req.json()
    const { uploadId, s3Key, partNumber } = body

    if (!uploadId || !s3Key || typeof partNumber !== 'number') {
      return NextResponse.json(
        { error: 'Missing required parameters: uploadId, s3Key, partNumber' },
        { status: 400 },
      )
    }

    const result = await getPartUploadUrl({
      uploadId,
      s3Key,
      partNumber,
    })

    return NextResponse.json({ data: result })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'FAILED_TO_SIGN_PART'
    if (message === 'UNAUTHORIZED' || message === 'FORBIDDEN') {
      return NextResponse.json({ error: message }, { status: 403 })
    }
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

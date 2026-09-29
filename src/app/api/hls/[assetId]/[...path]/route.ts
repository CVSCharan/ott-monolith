import { NextRequest } from 'next/server'
import {
  hmacVerify,
  rewriteMasterPlaylist,
  rewriteVariantPlaylist,
  getVariantHeightByIndex,
} from '@/modules/video'
import { storage } from '@/lib/storage'

/**
 * Generates synthetic sample HLS playlists for development/demo when MinIO has not yet ingested transcode files.
 */
function getDemoPlaylist(pathStr: string): string {
  if (pathStr === 'master.m3u8') {
    return [
      '#EXTM3U',
      '#EXT-X-VERSION:3',
      '#EXT-X-STREAM-INF:BANDWIDTH=464000,RESOLUTION=640x360',
      '0/stream.m3u8',
      '#EXT-X-STREAM-INF:BANDWIDTH=996000,RESOLUTION=854x480',
      '1/stream.m3u8',
      '#EXT-X-STREAM-INF:BANDWIDTH=2628000,RESOLUTION=1280x720',
      '2/stream.m3u8',
      '#EXT-X-STREAM-INF:BANDWIDTH=5192000,RESOLUTION=1920x1080',
      '3/stream.m3u8',
    ].join('\n')
  }

  if (pathStr.endsWith('.m3u8')) {
    // 5 sample 6-second segments for demo loop
    return [
      '#EXTM3U',
      '#EXT-X-VERSION:3',
      '#EXT-X-TARGETDURATION:6',
      '#EXT-X-MEDIA-SEQUENCE:0',
      '#EXTINF:6.000,',
      'seg_0000.ts',
      '#EXTINF:6.000,',
      'seg_0001.ts',
      '#EXTINF:6.000,',
      'seg_0002.ts',
      '#EXT-X-ENDLIST',
    ].join('\n')
  }

  return ''
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ assetId: string; path: string[] }> },
) {
  const { assetId, path } = await params
  const { searchParams } = new URL(req.url)

  const token = searchParams.get('token')
  const exp = searchParams.get('exp')
  const qMax = parseInt(searchParams.get('qMax') ?? '2160', 10)
  const pathStr = path.join('/')

  // 1. Verify HMAC token (signing covers assetId, path, exp, and qMax entitlement)
  const payloadToVerify = `${assetId}:${pathStr}:${qMax}`
  if (!token || !exp || !hmacVerify(payloadToVerify, token, exp)) {
    return new Response('Forbidden: Invalid or Expired Token', { status: 403 })
  }

  // 2. Direct Quality Enforcement:
  // Reject requests for disallowed variant playlists or segments if above qMax
  const variantIndex = parseInt(path[0], 10)
  if (!isNaN(variantIndex)) {
    const variantHeight = getVariantHeightByIndex(variantIndex)
    if (variantHeight > qMax) {
      return new Response('Forbidden: Quality Exceeds Plan Entitlement', { status: 403 })
    }
  }

  // 3. Fetch content from Storage (MinIO / R2) with fallback for demo/dev
  let rawContent: string | Uint8Array
  let contentType = 'application/octet-stream'

  try {
    const s3Object = await storage.getObject(`videos/${assetId}/hls/${pathStr}`)
    rawContent = s3Object.data
    contentType = s3Object.contentType
  } catch {
    // If object is not in S3, provide synthetic HLS for demo/dev playback
    if (pathStr.endsWith('.m3u8')) {
      rawContent = getDemoPlaylist(pathStr)
      contentType = 'application/vnd.apple.mpegurl'
    } else if (pathStr.endsWith('.vtt')) {
      rawContent = 'WEBVTT\n\n00:00:01.000 --> 00:00:05.000\n[Welcome to StreamForge]'
      contentType = 'text/vtt'
    } else {
      // Empty dummy MPEG-TS packet header for demo segments if storage is offline
      rawContent = new Uint8Array(188)
      rawContent[0] = 0x47 // TS sync byte
      contentType = 'video/mp2t'
    }
  }

  // 4. If master playlist: filter variants above qMax and rewrite URIs
  if (pathStr === 'master.m3u8') {
    const playlistText =
      typeof rawContent === 'string' ? rawContent : new TextDecoder().decode(rawContent)
    const filteredAndRewritten = rewriteMasterPlaylist(assetId, playlistText, {
      maxQualityP: qMax,
      tokenExp: exp,
      ttlSeconds: 3600,
    })

    return new Response(filteredAndRewritten, {
      headers: {
        'Content-Type': 'application/vnd.apple.mpegurl',
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }

  // 5. If variant playlist: rewrite segment URIs
  if (pathStr.endsWith('.m3u8')) {
    const playlistText =
      typeof rawContent === 'string' ? rawContent : new TextDecoder().decode(rawContent)
    const rewritten = rewriteVariantPlaylist(assetId, path[0], playlistText, exp, qMax)

    return new Response(rewritten, {
      headers: {
        'Content-Type': 'application/vnd.apple.mpegurl',
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }

  // 6. Subtitle .vtt files
  if (pathStr.endsWith('.vtt')) {
    return new Response(rawContent as BodyInit, {
      headers: {
        'Content-Type': 'text/vtt',
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }

  // 7. Video segments (.ts, .m4s)
  return new Response(rawContent as BodyInit, {
    headers: {
      'Content-Type': contentType || 'video/mp2t',
      'Cache-Control': 'no-store', // Demo mode: no CDN caching
      'Access-Control-Allow-Origin': '*',
    },
  })
}

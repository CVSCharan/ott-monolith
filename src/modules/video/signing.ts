import { createHmac, timingSafeEqual } from 'crypto'
import { env } from '@/lib/env'

/**
 * Standard Bitrate & Resolution Ladder defined in doc 07.
 */
export const BITRATE_LADDER = [
  { index: 0, height: 360, vbr: '400k', abr: '64k', label: '360p' },
  { index: 1, height: 480, vbr: '900k', abr: '96k', label: '480p' },
  { index: 2, height: 720, vbr: '2500k', abr: '128k', label: '720p' },
  { index: 3, height: 1080, vbr: '5000k', abr: '192k', label: '1080p' },
  { index: 4, height: 2160, vbr: '15000k', abr: '256k', label: '4K' },
] as const

/**
 * Maps variant directory index to vertical pixel resolution.
 */
export function getVariantHeightByIndex(index: number): number {
  const match = BITRATE_LADDER.find((item) => item.index === index)
  if (match) return match.height

  // Fallback defaults
  if (index === 0) return 360
  if (index === 1) return 480
  if (index === 2) return 720
  if (index === 3) return 1080
  return 2160
}

/**
 * Computes segment TTL with 1 hour safety margin beyond video duration.
 */
export function segmentTtl(durationSeconds: number): number {
  return Math.max(durationSeconds, 60) + 3600
}

/**
 * Computes SHA-256 HMAC signature with UNIX expiration timestamp.
 */
export function hmacSign(payload: string, ttlSeconds: number): { token: string; exp: number } {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds
  const secret = env.HMAC_MANIFEST_SECRET
  const token = createHmac('sha256', secret).update(`${payload}:${exp}`).digest('hex')

  return { token, exp }
}

/**
 * Constant-time verification of HMAC signature and expiry.
 */
export function hmacVerify(payload: string, token: string, exp: string | number): boolean {
  const expNum = typeof exp === 'string' ? parseInt(exp, 10) : exp
  if (isNaN(expNum) || Math.floor(Date.now() / 1000) > expNum) {
    return false
  }

  const secret = env.HMAC_MANIFEST_SECRET
  const expected = createHmac('sha256', secret).update(`${payload}:${expNum}`).digest('hex')

  if (token.length !== expected.length) {
    return false
  }

  try {
    return timingSafeEqual(Buffer.from(token, 'hex'), Buffer.from(expected, 'hex'))
  } catch {
    return false
  }
}

/**
 * Rewrites HLS master playlist:
 * 1. Filters out variant renditions whose vertical resolution exceeds maxQualityP.
 * 2. Rewrites remaining variant URIs with HMAC signing tokens.
 */
export function rewriteMasterPlaylist(
  assetId: string,
  rawPlaylist: string,
  options: {
    maxQualityP: number
    tokenExp: number | string
    ttlSeconds?: number
  },
): string {
  const { maxQualityP, tokenExp, ttlSeconds = 3600 } = options
  const lines = rawPlaylist.split(/\r?\n/)
  const rewrittenLines: string[] = []

  let skipNextUri = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    if (line.startsWith('#EXT-X-STREAM-INF')) {
      // Check RESOLUTION=WxH
      const resMatch = line.match(/RESOLUTION=\d+x(\d+)/i)
      if (resMatch) {
        const height = parseInt(resMatch[1], 10)
        if (height > maxQualityP) {
          // Skip this rendition and its subsequent URI
          skipNextUri = true
          continue
        }
      }
      skipNextUri = false
      rewrittenLines.push(line)
      continue
    }

    if (skipNextUri) {
      // Skipped the variant URI belonging to the filtered stream
      skipNextUri = false
      continue
    }

    // Check if this line is a variant URI (.m3u8)
    if (line && !line.startsWith('#')) {
      const variantPath = line
      const { token } = hmacSign(`${assetId}:${variantPath}:${maxQualityP}`, Number(ttlSeconds))
      const rewrittenUri = `/api/hls/${assetId}/${variantPath}?token=${token}&exp=${tokenExp}&qMax=${maxQualityP}`
      rewrittenLines.push(rewrittenUri)
      continue
    }

    rewrittenLines.push(line)
  }

  return rewrittenLines.join('\n')
}

/**
 * Rewrites HLS variant playlist:
 * Rewrites segment URIs (.ts, .m4s) with HMAC signing tokens.
 */
export function rewriteVariantPlaylist(
  assetId: string,
  variantIndex: string | number,
  rawPlaylist: string,
  tokenExp: number | string,
  maxQualityP: number,
  ttlSeconds = 7200,
): string {
  const lines = rawPlaylist.split(/\r?\n/)
  const rewrittenLines: string[] = []

  for (const rawLine of lines) {
    const line = rawLine.trim()

    // If it's a media segment URI (.ts, .m4s) or initialization segment
    if (line && !line.startsWith('#')) {
      const segmentFileName = line
      const segmentPath = `${variantIndex}/${segmentFileName}`
      const { token } = hmacSign(`${assetId}:${segmentPath}:${maxQualityP}`, ttlSeconds)
      const rewrittenUri = `/api/hls/${assetId}/${segmentPath}?token=${token}&exp=${tokenExp}&qMax=${maxQualityP}`
      rewrittenLines.push(rewrittenUri)
      continue
    }

    // Check for #EXT-X-MAP:URI="init.mp4"
    if (line.startsWith('#EXT-X-MAP:')) {
      const mapMatch = line.match(/URI="([^"]+)"/i)
      if (mapMatch) {
        const initFile = mapMatch[1]
        const initPath = `${variantIndex}/${initFile}`
        const { token } = hmacSign(`${assetId}:${initPath}:${maxQualityP}`, ttlSeconds)
        const rewrittenInitUri = `/api/hls/${assetId}/${initPath}?token=${token}&exp=${tokenExp}&qMax=${maxQualityP}`
        rewrittenLines.push(line.replace(mapMatch[0], `URI="${rewrittenInitUri}"`))
        continue
      }
    }

    rewrittenLines.push(line)
  }

  return rewrittenLines.join('\n')
}

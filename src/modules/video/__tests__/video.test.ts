import { describe, it, expect } from 'vitest'
import {
  hmacSign,
  hmacVerify,
  getVariantHeightByIndex,
  segmentTtl,
  rewriteMasterPlaylist,
  rewriteVariantPlaylist,
} from '../signing'

describe('Video Signing & Manifest Rewrite Engine', () => {
  const assetId = '11111111-2222-3333-4444-555555555555'

  describe('HMAC Token Generation & Verification', () => {
    it('generates a valid token and verifies it successfully', () => {
      const payload = `${assetId}:0/stream.m3u8:1080`
      const { token, exp } = hmacSign(payload, 3600)

      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(exp).toBeGreaterThan(Math.floor(Date.now() / 1000))

      const isValid = hmacVerify(payload, token, exp)
      expect(isValid).toBe(true)
    })

    it('rejects tampered tokens', () => {
      const payload = `${assetId}:0/stream.m3u8:1080`
      const { token, exp } = hmacSign(payload, 3600)

      // Alter payload or token
      const isTamperedPayload = hmacVerify(`${assetId}:1/stream.m3u8:1080`, token, exp)
      expect(isTamperedPayload).toBe(false)

      const isTamperedQuality = hmacVerify(`${assetId}:0/stream.m3u8:480`, token, exp)
      expect(isTamperedQuality).toBe(false)

      const tamperedToken = token.slice(0, -2) + 'aa'
      const isTamperedToken = hmacVerify(payload, tamperedToken, exp)
      expect(isTamperedToken).toBe(false)
    })

    it('rejects expired tokens', () => {
      const payload = `${assetId}:0/stream.m3u8:720`
      // Generate with negative TTL to simulate expired token
      const { token, exp } = hmacSign(payload, -10)

      const isValid = hmacVerify(payload, token, exp)
      expect(isValid).toBe(false)
    })
  })

  describe('Resolution & Ladder Mapping', () => {
    it('maps variant indices to vertical resolutions correctly', () => {
      expect(getVariantHeightByIndex(0)).toBe(360)
      expect(getVariantHeightByIndex(1)).toBe(480)
      expect(getVariantHeightByIndex(2)).toBe(720)
      expect(getVariantHeightByIndex(3)).toBe(1080)
      expect(getVariantHeightByIndex(4)).toBe(2160)
    })

    it('calculates segment TTL with 1 hour buffer', () => {
      expect(segmentTtl(5400)).toBe(9000)
      expect(segmentTtl(0)).toBe(3660)
    })
  })

  describe('Master Playlist Rewriting & Plan-Tier Gating', () => {
    const sampleMaster = [
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

    it('filters out 720p and 1080p for Free tier (maxQualityP = 480)', () => {
      const exp = Math.floor(Date.now() / 1000) + 3600
      const rewritten = rewriteMasterPlaylist(assetId, sampleMaster, {
        maxQualityP: 480,
        tokenExp: exp,
      })

      // 360p and 480p must be present
      expect(rewritten).toContain('RESOLUTION=640x360')
      expect(rewritten).toContain('RESOLUTION=854x480')
      expect(rewritten).toContain(`/api/hls/${assetId}/0/stream.m3u8?token=`)
      expect(rewritten).toContain(`/api/hls/${assetId}/1/stream.m3u8?token=`)

      // 720p and 1080p must NOT be present
      expect(rewritten).not.toContain('RESOLUTION=1280x720')
      expect(rewritten).not.toContain('2/stream.m3u8')
      expect(rewritten).not.toContain('RESOLUTION=1920x1080')
      expect(rewritten).not.toContain('3/stream.m3u8')
    })

    it('allows up to 720p for Standard tier (maxQualityP = 720)', () => {
      const exp = Math.floor(Date.now() / 1000) + 3600
      const rewritten = rewriteMasterPlaylist(assetId, sampleMaster, {
        maxQualityP: 720,
        tokenExp: exp,
      })

      expect(rewritten).toContain('RESOLUTION=640x360')
      expect(rewritten).toContain('RESOLUTION=854x480')
      expect(rewritten).toContain('RESOLUTION=1280x720')
      expect(rewritten).not.toContain('RESOLUTION=1920x1080')
    })

    it('allows all renditions up to 1080p for Premium tier (maxQualityP = 1080)', () => {
      const exp = Math.floor(Date.now() / 1000) + 3600
      const rewritten = rewriteMasterPlaylist(assetId, sampleMaster, {
        maxQualityP: 1080,
        tokenExp: exp,
      })

      expect(rewritten).toContain('RESOLUTION=640x360')
      expect(rewritten).toContain('RESOLUTION=854x480')
      expect(rewritten).toContain('RESOLUTION=1280x720')
      expect(rewritten).toContain('RESOLUTION=1920x1080')
    })
  })

  describe('Variant Playlist Segment Rewriting', () => {
    const sampleVariant = [
      '#EXTM3U',
      '#EXT-X-VERSION:3',
      '#EXT-X-TARGETDURATION:6',
      '#EXT-X-MEDIA-SEQUENCE:0',
      '#EXTINF:6.000,',
      'seg_0000.ts',
      '#EXTINF:6.000,',
      'seg_0001.ts',
      '#EXT-X-ENDLIST',
    ].join('\n')

    it('rewrites .ts media segments with signed URLs', () => {
      const exp = Math.floor(Date.now() / 1000) + 7200
      const rewritten = rewriteVariantPlaylist(assetId, '0', sampleVariant, exp, 480)

      expect(rewritten).toContain(`/api/hls/${assetId}/0/seg_0000.ts?token=`)
      expect(rewritten).toContain(`/api/hls/${assetId}/0/seg_0001.ts?token=`)
      expect(rewritten).toContain(`&exp=${exp}&qMax=480`)
      expect(rewritten).toContain('#EXT-X-ENDLIST')
    })
  })
})

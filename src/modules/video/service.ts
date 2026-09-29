import {
  findVideoAssetById,
  findActiveVideoAssetByTitleSlug,
  createPendingVideoAsset,
  updateVideoAssetStatus,
  createTranscodeJob,
  findLatestTranscodeJob,
  upsertWatchProgress,
  insertPlayEvents,
} from './dal'
import {
  hmacSign,
  segmentTtl,
  getVariantHeightByIndex,
  rewriteMasterPlaylist,
  rewriteVariantPlaylist,
} from './signing'
import { storage } from '@/lib/storage'
import { redis } from '@/lib/redis'
import { logger } from '@/lib/logger'
import type { SessionUser } from '@/modules/auth'

export interface PlaybackResponse {
  hlsMasterUrl: string
  subtitles: Array<{
    languageCode: string
    label: string
    isDefault: boolean
    vttUrl: string
  }>
  maxQualityP: number
  durationSeconds: number
}

/**
 * Resolves video playback information with entitlement gating and HMAC master signing.
 */
export async function getVideoPlayback(
  assetIdOrSlug: string,
  user?: SessionUser | null,
): Promise<PlaybackResponse> {
  // Try finding by asset ID first, then fallback to title slug
  let asset = await findVideoAssetById(assetIdOrSlug)
  if (!asset) {
    asset = await findActiveVideoAssetByTitleSlug(assetIdOrSlug)
  }

  if (!asset || !asset.title) {
    throw new Error('VIDEO_NOT_FOUND')
  }

  const { title } = asset

  // Kids profile restriction (US-102 / Doc 03: maturityRating <= 'U/A 7+')
  if (user?.isKids && title.minAge > 7) {
    throw new Error('KIDS_RESTRICTED')
  }

  // Plan tier entitlement (Free=0, Standard=1, Premium=2)
  let userTierRank = 0
  if (user?.planSlug === 'standard') {
    userTierRank = 1
  } else if (user?.planSlug === 'premium') {
    userTierRank = 2
  }

  if (title.minTierRank > userTierRank) {
    throw new Error('ENTITLEMENT_REQUIRED')
  }

  // Determine allowed quality based on subscription plan tier
  let maxQualityP = 480 // Free tier default
  if (userTierRank === 1) {
    maxQualityP = 720 // Standard tier
  } else if (userTierRank >= 2) {
    maxQualityP = 1080 // Premium tier
  }

  const duration = asset.durationSeconds ?? 3600
  const ttl = segmentTtl(duration)

  // Compute master playlist signed token
  const path = 'master.m3u8'
  const { token, exp } = hmacSign(`${asset.id}:${path}:${maxQualityP}`, ttl)
  const hlsMasterUrl = `/api/hls/${asset.id}/${path}?token=${token}&exp=${exp}&qMax=${maxQualityP}`

  // Map subtitles with signed URLs
  const subtitles = asset.subtitles.map((sub) => {
    const subTtl = 14400 // 4 hours
    const subToken = hmacSign(
      `${asset!.id}:subtitles/${sub.languageCode}.vtt:${maxQualityP}`,
      subTtl,
    )
    return {
      languageCode: sub.languageCode,
      label: sub.label,
      isDefault: sub.isDefault,
      vttUrl: `/api/hls/${asset!.id}/subtitles/${sub.languageCode}.vtt?token=${subToken.token}&exp=${subToken.exp}&qMax=${maxQualityP}`,
    }
  })

  return {
    hlsMasterUrl,
    subtitles,
    maxQualityP,
    durationSeconds: duration,
  }
}

/**
 * Initiates an S3 multipart upload for admin video ingest (max 10GB).
 */
export async function initiateVideoUpload(params: {
  filename: string
  sizeBytes: number
  titleId?: string
  episodeId?: string
}) {
  if (!params.filename.toLowerCase().endsWith('.mp4')) {
    throw new Error('INVALID_FORMAT_ONLY_MP4_SUPPORTED')
  }

  const MAX_SIZE_BYTES = 10_000_000_000 // 10 GB
  if (params.sizeBytes > MAX_SIZE_BYTES) {
    throw new Error('FILE_SIZE_EXCEEDS_10GB_LIMIT')
  }

  // Pre-generate raw S3 storage key
  const tempId = crypto.randomUUID()
  const s3Key = `raw-uploads/${tempId}.mp4`

  const asset = await createPendingVideoAsset({
    rawS3Key: s3Key,
    rawSizeBytes: BigInt(params.sizeBytes),
    titleId: params.titleId,
    episodeId: params.episodeId,
  })

  const uploadId = await storage.createMultipartUpload(s3Key, 'video/mp4')

  return {
    assetId: asset.id,
    uploadId,
    s3Key,
  }
}

/**
 * Generates a presigned part upload URL for multipart chunk streaming.
 */
export async function getPartUploadUrl(params: {
  uploadId: string
  s3Key: string
  partNumber: number
}) {
  if (params.partNumber < 1 || params.partNumber > 10000) {
    throw new Error('INVALID_PART_NUMBER')
  }

  const partUrl = await storage.getSignedUploadPartUrl(
    params.s3Key,
    params.uploadId,
    params.partNumber,
    1800, // 30-minute expiry
  )

  const expiresAt = new Date(Date.now() + 1800 * 1000).toISOString()

  return {
    partUrl,
    expiresAt,
  }
}

/**
 * Completes multipart upload and enqueues transcode worker job.
 */
export async function completeVideoUpload(params: {
  uploadId: string
  s3Key: string
  assetId: string
  parts: Array<{ partNumber: number; etag: string }>
}) {
  try {
    await storage.completeMultipartUpload(params.s3Key, params.uploadId, params.parts)

    const head = await storage.headObject(params.s3Key)
    if (!head || head.size <= 0) {
      throw new Error('UPLOAD_VERIFICATION_FAILED_ZERO_SIZE')
    }

    await updateVideoAssetStatus(params.assetId, {
      status: 'pending_transcode',
    })

    const job = await createTranscodeJob({
      videoAssetId: params.assetId,
      status: 'pending',
    })

    logger.info(
      { assetId: params.assetId, jobId: job.id },
      'Video upload completed and transcode job queued',
    )

    return {
      assetId: params.assetId,
      status: 'queued',
      jobId: job.id,
    }
  } catch (err: unknown) {
    await updateVideoAssetStatus(params.assetId, {
      status: 'error',
      errorMessage: err instanceof Error ? err.message : 'Upload completion failed',
    })
    throw err
  }
}

/**
 * Aborts an active multipart upload.
 */
export async function abortVideoUpload(params: {
  uploadId: string
  s3Key: string
  assetId: string
}) {
  await storage.abortMultipartUpload(params.s3Key, params.uploadId)
  await updateVideoAssetStatus(params.assetId, {
    status: 'error',
    errorMessage: 'Upload aborted by user',
  })
  return { success: true }
}

/**
 * Fetches current transcode status for an asset.
 */
export async function getVideoAssetStatus(assetId: string) {
  const asset = await findVideoAssetById(assetId)
  if (!asset) {
    throw new Error('VIDEO_NOT_FOUND')
  }

  const latestJob = await findLatestTranscodeJob(assetId)

  return {
    assetId: asset.id,
    status: asset.status,
    progressPct: latestJob?.progressPct ?? (asset.status === 'ready' ? 100 : 0),
    errorMessage: asset.errorMessage || latestJob?.errorMessage || null,
    renditions: asset.renditions,
  }
}

/**
 * Consolidated player beacon handling: watch progress, QoE events, active stream heartbeat.
 */
export async function recordPlayerBeacon(
  beacon: {
    titleId: string
    episodeId?: string
    videoAssetId?: string
    anonymousId?: string
    progress?: {
      positionSeconds: number
      durationSeconds: number
      isCompleted: boolean
    }
    playbackSessionId?: string
    events?: Array<{
      eventType: string
      positionSeconds?: number
      quality?: string
      deviceType?: string
      occurredAt: string
    }>
  },
  user?: SessionUser | null,
  userAgent?: string,
) {
  let progressSaved = false
  let eventsIngested = 0

  // 1. Save watch progress if profile is present
  if (user?.profileId && beacon.progress) {
    await upsertWatchProgress({
      profileId: user.profileId,
      titleId: beacon.titleId,
      episodeId: beacon.episodeId,
      positionSeconds: Math.floor(beacon.progress.positionSeconds),
      durationSeconds: Math.floor(beacon.progress.durationSeconds),
      isCompleted: beacon.progress.isCompleted,
    })
    progressSaved = true
  }

  // 2. Batch insert QoE events
  if (beacon.events && beacon.events.length > 0) {
    const playEvents = beacon.events.slice(0, 50).map((e) => ({
      profileId: user?.profileId ?? undefined,
      anonymousId: !user?.profileId ? beacon.anonymousId : undefined,
      titleId: beacon.titleId,
      episodeId: beacon.episodeId,
      videoAssetId: beacon.videoAssetId,
      eventType: e.eventType,
      positionSeconds: Math.floor(e.positionSeconds ?? 0),
      quality: e.quality,
      deviceType: e.deviceType,
      userAgent,
      occurredAt: new Date(e.occurredAt || Date.now()),
    }))

    const result = await insertPlayEvents(playEvents)
    eventsIngested = result.count
  }

  // 3. Heartbeat for playback session tracking (TTL 30 seconds)
  if (beacon.playbackSessionId && user?.sub) {
    try {
      await redis.setex(`stream:${user.sub}:${beacon.playbackSessionId}`, 30, 'active')
    } catch {
      // Redis error shouldn't fail beacon
    }
  }

  return {
    progressSaved,
    eventsIngested,
  }
}

export { rewriteMasterPlaylist, rewriteVariantPlaylist, getVariantHeightByIndex, hmacSign }

'use server'

import { requireAdmin, getSessionUser } from '@/modules/auth'
import {
  getVideoPlayback,
  initiateVideoUpload,
  getPartUploadUrl,
  completeVideoUpload,
  abortVideoUpload,
  recordPlayerBeacon,
  getVideoAssetStatus,
} from './service'

export async function getVideoPlaybackAction(assetIdOrSlug: string) {
  const user = await getSessionUser()
  return getVideoPlayback(assetIdOrSlug, user)
}

export async function initiateVideoUploadAction(params: {
  filename: string
  sizeBytes: number
  titleId?: string
  episodeId?: string
}) {
  await requireAdmin()
  return initiateVideoUpload(params)
}

export async function getPartUploadUrlAction(params: {
  uploadId: string
  s3Key: string
  partNumber: number
}) {
  await requireAdmin()
  return getPartUploadUrl(params)
}

export async function completeVideoUploadAction(params: {
  uploadId: string
  s3Key: string
  assetId: string
  parts: Array<{ partNumber: number; etag: string }>
}) {
  await requireAdmin()
  return completeVideoUpload(params)
}

export async function abortVideoUploadAction(params: {
  uploadId: string
  s3Key: string
  assetId: string
}) {
  await requireAdmin()
  return abortVideoUpload(params)
}

export async function getVideoAssetStatusAction(assetId: string) {
  await requireAdmin()
  return getVideoAssetStatus(assetId)
}

export async function recordPlayerBeaconAction(beaconData: {
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
}) {
  const user = await getSessionUser()
  return recordPlayerBeacon(beaconData, user)
}

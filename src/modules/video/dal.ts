import { db } from '@/lib/db'
import type { Prisma } from '@prisma/client'

/**
 * Data Access Layer for Video Assets, Transcode Jobs, Playback and Beacons.
 * ONLY file in src/modules/video that may import prisma or '@/lib/db'.
 */

export async function findVideoAssetById(id: string) {
  return db.videoAsset.findUnique({
    where: { id },
    include: {
      title: {
        select: {
          id: true,
          slug: true,
          title: true,
          minAge: true,
          minTierRank: true,
          status: true,
        },
      },
      episode: {
        select: {
          id: true,
          titleId: true,
          episodeNumber: true,
          title: true,
        },
      },
      subtitles: true,
    },
  })
}

export async function findActiveVideoAssetByTitleSlug(slug: string) {
  return db.videoAsset.findFirst({
    where: {
      isActive: true,
      title: {
        slug,
      },
    },
    include: {
      title: {
        select: {
          id: true,
          slug: true,
          title: true,
          minAge: true,
          minTierRank: true,
          status: true,
        },
      },
      episode: {
        select: {
          id: true,
          titleId: true,
          episodeNumber: true,
          title: true,
        },
      },
      subtitles: true,
    },
  })
}

export async function createPendingVideoAsset(data: {
  rawS3Key: string
  rawSizeBytes: bigint
  titleId?: string
  episodeId?: string
}) {
  return db.videoAsset.create({
    data: {
      rawS3Key: data.rawS3Key,
      rawSizeBytes: data.rawSizeBytes,
      titleId: data.titleId,
      episodeId: data.episodeId,
      status: 'pending',
      isActive: false,
    },
  })
}

export async function updateVideoAssetStatus(
  id: string,
  data: {
    status: string
    errorMessage?: string | null
    isActive?: boolean
    hlsBasePath?: string
    durationSeconds?: number
    renditions?: Prisma.InputJsonValue
  },
) {
  return db.videoAsset.update({
    where: { id },
    data,
  })
}

export async function createTranscodeJob(data: {
  videoAssetId: string
  pgBossId?: string
  status?: string
}) {
  return db.transcodeJob.create({
    data: {
      videoAssetId: data.videoAssetId,
      pgBossId: data.pgBossId,
      status: data.status ?? 'pending',
    },
  })
}

export async function findLatestTranscodeJob(videoAssetId: string) {
  return db.transcodeJob.findFirst({
    where: { videoAssetId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function updateTranscodeJobProgress(
  id: string,
  data: {
    progressPct?: number
    status?: string
    errorMessage?: string
    ffprobeMeta?: Prisma.InputJsonValue
  },
) {
  return db.transcodeJob.update({
    where: { id },
    data,
  })
}

export async function upsertWatchProgress(data: {
  profileId: string
  titleId: string
  episodeId?: string
  positionSeconds: number
  durationSeconds: number
  isCompleted: boolean
}) {
  // Check if existing progress row exists for profile + title (+ episode)
  const existing = await db.watchProgress.findFirst({
    where: {
      profileId: data.profileId,
      titleId: data.titleId,
      episodeId: data.episodeId ?? null,
    },
  })

  if (existing) {
    return db.watchProgress.update({
      where: { id: existing.id },
      data: {
        positionSeconds: data.positionSeconds,
        durationSeconds: data.durationSeconds,
        isCompleted: data.isCompleted,
        watchedAt: new Date(),
      },
    })
  }

  return db.watchProgress.create({
    data: {
      profileId: data.profileId,
      titleId: data.titleId,
      episodeId: data.episodeId,
      positionSeconds: data.positionSeconds,
      durationSeconds: data.durationSeconds,
      isCompleted: data.isCompleted,
      watchedAt: new Date(),
    },
  })
}

export async function insertPlayEvents(
  events: Array<{
    profileId?: string
    anonymousId?: string
    titleId: string
    episodeId?: string
    videoAssetId?: string
    eventType: string
    positionSeconds: number
    quality?: string
    deviceType?: string
    userAgent?: string
    occurredAt: Date
  }>,
) {
  if (events.length === 0) return { count: 0 }

  return db.playEvent.createMany({
    data: events,
  })
}

export async function findTitleBySlug(slug: string) {
  return db.title.findUnique({
    where: { slug },
    include: {
      videoAssets: {
        where: { isActive: true },
        include: { subtitles: true },
      },
    },
  })
}

// ------------------------------------------------------------------------------
// Playback Session & Concurrency DAL Functions
// ------------------------------------------------------------------------------

export async function createPlaybackSession(data: {
  accountId: string
  profileId: string
  titleId: string
  deviceType?: string
  ipAddress?: string
}) {
  return db.playbackSession.create({
    data: {
      accountId: data.accountId,
      profileId: data.profileId,
      titleId: data.titleId,
      deviceType: data.deviceType,
      ipAddress: data.ipAddress,
      startedAt: new Date(),
      lastHeartbeatAt: new Date(),
    },
    include: {
      account: {
        include: { plan: true },
      },
    },
  })
}

export async function findPlaybackSessionById(id: string) {
  return db.playbackSession.findUnique({
    where: { id },
    include: {
      account: {
        include: { plan: true },
      },
    },
  })
}

export async function findActivePlaybackSessions(accountId: string, activeSince: Date) {
  const sessions = await db.playbackSession.findMany({
    where: {
      accountId,
      endedAt: null,
      lastHeartbeatAt: {
        gte: activeSince,
      },
    },
    orderBy: {
      lastHeartbeatAt: 'desc',
    },
  })

  if (sessions.length === 0) return []

  // Join titles for rich display
  const titleIds = Array.from(new Set(sessions.map((s) => s.titleId)))
  const titles = await db.title.findMany({
    where: { id: { in: titleIds } },
    select: { id: true, title: true, slug: true, backdropUrl: true },
  })
  const titleMap = new Map(titles.map((t) => [t.id, t]))

  return sessions.map((s) => ({
    ...s,
    title: titleMap.get(s.titleId) || null,
  }))
}

export async function countActivePlaybackSessions(accountId: string, activeSince: Date) {
  return db.playbackSession.count({
    where: {
      accountId,
      endedAt: null,
      lastHeartbeatAt: {
        gte: activeSince,
      },
    },
  })
}

export async function updatePlaybackSessionHeartbeat(id: string) {
  return db.playbackSession.updateMany({
    where: {
      id,
      endedAt: null,
    },
    data: {
      lastHeartbeatAt: new Date(),
    },
  })
}

export async function endPlaybackSession(id: string) {
  return db.playbackSession.updateMany({
    where: {
      id,
      endedAt: null,
    },
    data: {
      endedAt: new Date(),
    },
  })
}

export async function endAllPlaybackSessionsForAccount(accountId: string) {
  return db.playbackSession.updateMany({
    where: {
      accountId,
      endedAt: null,
    },
    data: {
      endedAt: new Date(),
    },
  })
}


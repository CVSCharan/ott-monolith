import { db } from '@/lib/db'
import type { Prisma } from '@prisma/client'

export interface VisibilityContext {
  isKids?: boolean
  maxMaturityRank?: number
  planTierRank?: number
}

/**
 * Builds the canonical visibility filter for content queries.
 * Enforces status='published', publishAt <= now(), and profile maturity rating limits.
 */
export function buildVisibilityFilter(ctx?: VisibilityContext): Prisma.TitleWhereInput {
  const now = new Date()

  const conditions: Prisma.TitleWhereInput[] = [
    { status: 'published' },
    {
      OR: [{ publishAt: null }, { publishAt: { lte: now } }],
    },
  ]

  if (ctx?.isKids) {
    // Kids profile: max maturity age <= 7 (U and U/A 7+ only)
    conditions.push({ minAge: { lte: 7 } })
  } else if (ctx?.maxMaturityRank !== undefined && ctx.maxMaturityRank >= 0) {
    conditions.push({ minAge: { lte: ctx.maxMaturityRank } })
  }

  return { AND: conditions }
}

export async function findActiveBillboard(ctx?: VisibilityContext) {
  const visibilityWhere = buildVisibilityFilter(ctx)

  const billboard = await db.billboard.findFirst({
    where: {
      isActive: true,
      title: visibilityWhere,
    },
    include: {
      title: {
        include: {
          genres: { include: { genre: true } },
          videoAssets: { where: { isActive: true }, select: { id: true, durationSeconds: true } },
        },
      },
    },
    orderBy: { position: 'asc' },
  })

  if (billboard) return billboard.title

  // Fallback: return the first published title matching visibility
  return db.title.findFirst({
    where: visibilityWhere,
    include: {
      genres: { include: { genre: true } },
      videoAssets: { where: { isActive: true }, select: { id: true, durationSeconds: true } },
    },
    orderBy: { playCount: 'desc' },
  })
}

export async function findRailsWithItems(ctx?: VisibilityContext) {
  const visibilityWhere = buildVisibilityFilter(ctx)

  const rails = await db.rail.findMany({
    where: { isActive: true },
    orderBy: { position: 'asc' },
    include: {
      items: {
        where: { title: visibilityWhere },
        orderBy: { position: 'asc' },
        include: {
          title: {
            include: {
              genres: { include: { genre: true } },
              videoAssets: {
                where: { isActive: true },
                select: { id: true, durationSeconds: true },
              },
            },
          },
        },
      },
    },
  })

  return rails.map((rail) => ({
    ...rail,
    items: rail.items.map((item) => item.title),
  }))
}

export async function findTop10Titles(ctx?: VisibilityContext) {
  const visibilityWhere = buildVisibilityFilter(ctx)

  return db.title.findMany({
    where: visibilityWhere,
    orderBy: { playCount: 'desc' },
    take: 10,
    include: {
      genres: { include: { genre: true } },
      videoAssets: { where: { isActive: true }, select: { id: true, durationSeconds: true } },
    },
  })
}

export async function findTitleBySlugWithDetails(slug: string, ctx?: VisibilityContext) {
  const title = await db.title.findUnique({
    where: { slug },
    include: {
      genres: { include: { genre: true } },
      cast: {
        include: { person: true },
        orderBy: { displayOrder: 'asc' },
      },
      seasons: {
        include: {
          episodes: {
            orderBy: { episodeNumber: 'asc' },
          },
        },
        orderBy: { seasonNumber: 'asc' },
      },
      videoAssets: {
        where: { isActive: true },
        include: { subtitles: true },
      },
    },
  })

  if (!title) return null

  // Check visibility
  if (title.status !== 'published' && !ctx?.planTierRank) return null
  if (ctx?.isKids && title.minAge > 7) return null

  return title
}

export async function findMoreLikeThis(
  titleId: string,
  genreIds: string[],
  ctx?: VisibilityContext,
) {
  const visibilityWhere = buildVisibilityFilter(ctx)

  return db.title.findMany({
    where: {
      id: { not: titleId },
      genres: {
        some: {
          genreId: { in: genreIds },
        },
      },
      ...visibilityWhere,
    },
    take: 6,
    include: {
      genres: { include: { genre: true } },
      videoAssets: { where: { isActive: true }, select: { id: true, durationSeconds: true } },
    },
    orderBy: { playCount: 'desc' },
  })
}

export async function searchTitlesInDb(
  query: string,
  filters?: { genre?: string; type?: string; minAge?: number },
  ctx?: VisibilityContext,
) {
  const visibilityWhere = buildVisibilityFilter(ctx)
  const trimmed = query.trim()

  const andConditions: Prisma.TitleWhereInput[] = [visibilityWhere]

  if (trimmed.length > 0) {
    andConditions.push({
      OR: [
        { title: { contains: trimmed, mode: 'insensitive' } },
        { synopsis: { contains: trimmed, mode: 'insensitive' } },
        { description: { contains: trimmed, mode: 'insensitive' } },
        {
          genres: {
            some: {
              genre: {
                name: { contains: trimmed, mode: 'insensitive' },
              },
            },
          },
        },
      ],
    })
  }

  if (filters?.type) {
    andConditions.push({ type: filters.type })
  }

  if (filters?.genre) {
    andConditions.push({
      genres: {
        some: {
          genre: {
            slug: filters.genre.toLowerCase(),
          },
        },
      },
    })
  }

  return db.title.findMany({
    where: { AND: andConditions },
    take: 30,
    include: {
      genres: { include: { genre: true } },
      videoAssets: { where: { isActive: true }, select: { id: true, durationSeconds: true } },
    },
    orderBy: { playCount: 'desc' },
  })
}

export async function searchAutocomplete(query: string, ctx?: VisibilityContext) {
  const visibilityWhere = buildVisibilityFilter(ctx)
  const trimmed = query.trim()

  return db.title.findMany({
    where: {
      AND: [visibilityWhere, { title: { contains: trimmed, mode: 'insensitive' } }],
    },
    take: 6,
    select: {
      slug: true,
      title: true,
      type: true,
      thumbnailUrl: true,
      minAge: true,
      minTierRank: true,
    },
    orderBy: { playCount: 'desc' },
  })
}

export async function findWatchlistByProfile(profileId: string) {
  return db.watchlistItem.findMany({
    where: { profileId },
    orderBy: { addedAt: 'desc' },
    include: {
      title: {
        include: {
          genres: { include: { genre: true } },
          videoAssets: { where: { isActive: true }, select: { id: true, durationSeconds: true } },
        },
      },
    },
  })
}

export async function addTitleToWatchlist(profileId: string, titleId: string) {
  return db.watchlistItem.upsert({
    where: {
      profileId_titleId: { profileId, titleId },
    },
    update: {},
    create: {
      profileId,
      titleId,
    },
  })
}

export async function removeTitleFromWatchlist(profileId: string, titleId: string) {
  return db.watchlistItem.deleteMany({
    where: { profileId, titleId },
  })
}

export async function rateTitleInDb(profileId: string, titleId: string, value: 'like' | 'dislike') {
  // Check previous rating
  const existing = await db.rating.findUnique({
    where: { profileId_titleId: { profileId, titleId } },
  })

  if (existing?.value === value) {
    // Toggle off if same value
    await db.rating.delete({
      where: { id: existing.id },
    })

    if (value === 'like') {
      await db.title.update({
        where: { id: titleId },
        data: { likeCount: { decrement: 1 } },
      })
    } else {
      await db.title.update({
        where: { id: titleId },
        data: { dislikeCount: { decrement: 1 } },
      })
    }

    return { value: null }
  }

  // Upsert new rating
  await db.rating.upsert({
    where: { profileId_titleId: { profileId, titleId } },
    update: { value },
    create: { profileId, titleId, value },
  })

  // Adjust counts
  if (value === 'like') {
    await db.title.update({
      where: { id: titleId },
      data: {
        likeCount: { increment: 1 },
        dislikeCount: existing?.value === 'dislike' ? { decrement: 1 } : undefined,
      },
    })
  } else {
    await db.title.update({
      where: { id: titleId },
      data: {
        dislikeCount: { increment: 1 },
        likeCount: existing?.value === 'like' ? { decrement: 1 } : undefined,
      },
    })
  }

  return { value }
}

export async function findWatchHistoryByProfile(profileId: string) {
  return db.watchProgress.findMany({
    where: { profileId },
    orderBy: { updatedAt: 'desc' },
    include: {
      title: {
        include: {
          genres: { include: { genre: true } },
          videoAssets: { where: { isActive: true }, select: { id: true, durationSeconds: true } },
        },
      },
      episode: true,
    },
  })
}

export async function getAllPublishedGenres() {
  return db.genre.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { titles: true },
      },
    },
  })
}

export async function listTitlesForAdmin() {
  return db.title.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      genres: { include: { genre: true } },
      videoAssets: { select: { id: true, status: true, durationSeconds: true } },
    },
  })
}

export async function updateTitleStatusInDb(
  id: string,
  status: 'draft' | 'published' | 'archived',
) {
  return db.title.update({
    where: { id },
    data: {
      status,
      publishAt: status === 'published' ? new Date() : undefined,
    },
  })
}

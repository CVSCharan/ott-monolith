import {
  findActiveBillboard,
  findRailsWithItems,
  findTop10Titles,
  findTitleBySlugWithDetails,
  findMoreLikeThis,
  searchTitlesInDb,
  searchAutocomplete,
  findWatchlistByProfile,
  addTitleToWatchlist,
  removeTitleFromWatchlist,
  rateTitleInDb,
  findWatchHistoryByProfile,
  getAllPublishedGenres,
  type VisibilityContext,
} from './dal'
import type { SessionUser } from '@/modules/auth'

/**
 * Maps DB integer age rating to standard certification string.
 */
export function formatMaturityRating(minAge: number): 'U' | 'U/A 7+' | 'U/A 13+' | 'U/A 16+' | 'A' {
  if (minAge <= 0) return 'U'
  if (minAge <= 7) return 'U/A 7+'
  if (minAge <= 13) return 'U/A 13+'
  if (minAge <= 16) return 'U/A 16+'
  return 'A'
}

export interface TitleInput {
  id: string
  slug: string
  title: string
  type: string
  synopsis?: string | null
  description?: string | null
  releaseYear?: number | null
  durationSeconds?: number | null
  minAge: number
  minTierRank: number
  dominantColor?: string | null
  thumbnailUrl?: string | null
  posterUrl?: string | null
  backdropUrl?: string | null
  trailerUrl?: string | null
  likeCount?: number
  playCount?: number
  genres?: Array<{ genre?: { name: string } | null; name?: string }>
}

/**
 * Transforms Prisma Title record into client-ready presentation payload with plan lock metadata.
 */
export function transformTitle(title: TitleInput, userTierRank = 0) {
  const isLocked = title.minTierRank > userTierRank
  let requiredPlan: 'FREE' | 'STANDARD' | 'PREMIUM' = 'FREE'
  if (title.minTierRank === 1) requiredPlan = 'STANDARD'
  else if (title.minTierRank >= 2) requiredPlan = 'PREMIUM'

  const durationMin = title.durationSeconds ? Math.floor(title.durationSeconds / 60) : 90
  const hours = Math.floor(durationMin / 60)
  const mins = durationMin % 60
  const durationStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`

  const genres =
    title.genres?.map((g) => g.genre?.name || g.name || 'Drama') || ['Drama']

  return {
    id: title.id,
    slug: title.slug,
    title: title.title,
    type: title.type,
    synopsis: title.synopsis || '',
    fullDescription: title.description || title.synopsis || '',
    releaseYear: title.releaseYear || 2024,
    duration: durationStr,
    durationSeconds: title.durationSeconds || 5400,
    maturityRating: formatMaturityRating(title.minAge),
    minAge: title.minAge,
    genres,
    requiredPlan,
    minTierRank: title.minTierRank,
    isLocked,
    dominantColor: title.dominantColor || '#1d3527',
    thumbnailUrl: title.thumbnailUrl || title.backdropUrl,
    posterUrl: title.posterUrl || title.thumbnailUrl,
    backdropUrl: title.backdropUrl || title.thumbnailUrl,
    trailerUrl: title.trailerUrl || '',
    likeCount: title.likeCount || 0,
    playCount: title.playCount || 0,
    matchScore: Math.min(99, 85 + ((title.likeCount || 0) % 14)),
  }
}

function resolveUserContext(user?: SessionUser | null): { ctx: VisibilityContext; tierRank: number } {
  let tierRank = 0
  if (user?.planSlug === 'standard') tierRank = 1
  else if (user?.planSlug === 'premium') tierRank = 2

  const ctx: VisibilityContext = {
    isKids: user?.isKids,
    maxMaturityRank: user?.maxMaturityRank ?? (user?.isKids ? 7 : 18),
    planTierRank: tierRank,
  }

  return { ctx, tierRank }
}

export async function getHomeCatalog(user?: SessionUser | null) {
  const { ctx, tierRank } = resolveUserContext(user)

  const [rawBillboard, rawRails, rawTop10] = await Promise.all([
    findActiveBillboard(ctx),
    findRailsWithItems(ctx),
    findTop10Titles(ctx),
  ])

  const billboard = rawBillboard ? transformTitle(rawBillboard, tierRank) : null
  const top10 = rawTop10.map((t) => transformTitle(t, tierRank))

  // If DB rails exist, format them
  const formattedRails: Array<{
    id: string
    title: string
    isTop10?: boolean
    items: Array<ReturnType<typeof transformTitle>>
  }> = []

  // Always prepend Top 10 Indian Trending rail if items exist
  if (top10.length > 0) {
    formattedRails.push({
      id: 'rail-top-10',
      title: 'Top 10 in India Today',
      isTop10: true,
      items: top10,
    })
  }

  if (rawRails.length > 0) {
    rawRails.forEach((r) => {
      if (r.items.length > 0) {
        formattedRails.push({
          id: r.id,
          title: r.name,
          items: r.items.map((t) => transformTitle(t, tierRank)),
        })
      }
    })
  } else {
    // If no manual rails in DB yet, assemble curated rails from top titles
    const allTitles = await findTop10Titles({ ...ctx })
    const transformed = allTitles.map((t) => transformTitle(t, tierRank))

    formattedRails.push({
      id: 'rail-trending-now',
      title: 'Trending Now',
      items: transformed,
    })

    const actionSciFi = transformed.filter((t) =>
      t.genres.some((g: string) => ['Action', 'Sci-Fi', 'Fantasy'].includes(g))
    )
    if (actionSciFi.length > 0) {
      formattedRails.push({
        id: 'rail-action-scifi',
        title: 'High-Octane Action & Sci-Fi',
        items: actionSciFi,
      })
    }

    const animationFamily = transformed.filter((t) =>
      t.genres.some((g: string) => ['Animation', 'Family', 'Comedy'].includes(g))
    )
    if (animationFamily.length > 0) {
      formattedRails.push({
        id: 'rail-animation',
        title: 'Critically Acclaimed Animation',
        items: animationFamily,
      })
    }
  }

  return {
    billboard,
    rails: formattedRails,
  }
}

export async function getTitleDetail(slug: string, user?: SessionUser | null) {
  const { ctx, tierRank } = resolveUserContext(user)

  const rawTitle = await findTitleBySlugWithDetails(slug, ctx)
  if (!rawTitle) {
    throw new Error('TITLE_NOT_FOUND')
  }

  const genreIds = rawTitle.genres.map((g) => g.genreId)
  const rawRecommendations = await findMoreLikeThis(rawTitle.id, genreIds, ctx)

  const formatted = transformTitle(rawTitle, tierRank)
  const recommendations = rawRecommendations.map((t) => transformTitle(t, tierRank))

  const cast = rawTitle.cast.map((c) => ({
    name: c.person.name,
    role: c.characterName || c.role,
  }))

  const seasons = rawTitle.seasons.map((s) => ({
    seasonNumber: s.seasonNumber,
    title: s.title,
    episodes: s.episodes.map((e) => ({
      id: e.id,
      episodeNumber: e.episodeNumber,
      title: e.title,
      description: e.description || '',
      durationSeconds: e.durationSeconds,
      thumbnailUrl: e.thumbnailUrl,
    })),
  }))

  return {
    ...formatted,
    cast,
    seasons,
    recommendations,
  }
}

export async function searchCatalog(
  query: string,
  filters?: { genre?: string; type?: string; minAge?: number },
  user?: SessionUser | null
) {
  const { ctx, tierRank } = resolveUserContext(user)
  const results = await searchTitlesInDb(query, filters, ctx)
  return results.map((t) => transformTitle(t, tierRank))
}

export async function getAutocomplete(query: string, user?: SessionUser | null) {
  const { ctx } = resolveUserContext(user)
  return searchAutocomplete(query, ctx)
}

export async function getWatchlist(profileId: string, user?: SessionUser | null) {
  const { tierRank } = resolveUserContext(user)
  const items = await findWatchlistByProfile(profileId)
  return items.map((item) => ({
    id: item.id,
    addedAt: item.addedAt,
    title: transformTitle(item.title, tierRank),
  }))
}

export async function addToWatchlist(profileId: string, titleId: string) {
  return addTitleToWatchlist(profileId, titleId)
}

export async function removeFromWatchlist(profileId: string, titleId: string) {
  return removeTitleFromWatchlist(profileId, titleId)
}

export async function rateTitle(profileId: string, titleId: string, value: 'like' | 'dislike') {
  return rateTitleInDb(profileId, titleId, value)
}

export async function getWatchHistory(profileId: string, user?: SessionUser | null) {
  const { tierRank } = resolveUserContext(user)
  const items = await findWatchHistoryByProfile(profileId)
  return items.map((item) => ({
    id: item.id,
    positionSeconds: item.positionSeconds,
    durationSeconds: item.durationSeconds,
    isCompleted: item.isCompleted,
    watchedAt: item.watchedAt,
    title: transformTitle(item.title, tierRank),
    episode: item.episode,
  }))
}

export async function getGenres() {
  return getAllPublishedGenres()
}

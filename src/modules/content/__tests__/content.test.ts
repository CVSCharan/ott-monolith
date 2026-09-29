import { describe, it, expect } from 'vitest'
import { formatMaturityRating, transformTitle } from '../service'
import { buildVisibilityFilter } from '../dal'

describe('Content Service & Transformation Unit Tests', () => {
  describe('formatMaturityRating', () => {
    it('correctly maps age numbers to statutory Indian certification labels', () => {
      expect(formatMaturityRating(0)).toBe('U')
      expect(formatMaturityRating(7)).toBe('U/A 7+')
      expect(formatMaturityRating(13)).toBe('U/A 13+')
      expect(formatMaturityRating(16)).toBe('U/A 16+')
      expect(formatMaturityRating(18)).toBe('A')
    })
  })

  describe('transformTitle & Plan Tier Gating', () => {
    const sampleRawTitle = {
      id: 'mock-title-1',
      slug: 'test-title',
      title: 'Test Movie',
      type: 'movie',
      synopsis: 'A test synopsis',
      description: 'A longer description',
      releaseYear: 2024,
      durationSeconds: 5520, // 92 mins -> 1h 32m
      minAge: 13,
      minTierRank: 1, // Standard plan required
      dominantColor: '#1a2238',
      thumbnailUrl: 'https://images.unsplash.com/thumb.jpg',
      posterUrl: 'https://images.unsplash.com/poster.jpg',
      backdropUrl: 'https://images.unsplash.com/backdrop.jpg',
      trailerUrl: 'https://sample.mp4',
      likeCount: 200,
      playCount: 1500,
      genres: [{ name: 'Action' }, { name: 'Sci-Fi' }],
    }

    it('formats duration string correctly', () => {
      const transformed = transformTitle(sampleRawTitle, 0)
      expect(transformed.duration).toBe('1h 32m')
      expect(transformed.durationSeconds).toBe(5520)
    })

    it('locks titles exceeding user plan tier rank', () => {
      // Free user (tierRank = 0) viewing Standard title (minTierRank = 1)
      const freeView = transformTitle(sampleRawTitle, 0)
      expect(freeView.isLocked).toBe(true)
      expect(freeView.requiredPlan).toBe('STANDARD')

      // Standard user (tierRank = 1) viewing Standard title
      const standardView = transformTitle(sampleRawTitle, 1)
      expect(standardView.isLocked).toBe(false)

      // Premium user (tierRank = 2) viewing Standard title
      const premiumView = transformTitle(sampleRawTitle, 2)
      expect(premiumView.isLocked).toBe(false)
    })

    it('correctly gates Premium-tier titles', () => {
      const premiumTitle = { ...sampleRawTitle, minTierRank: 2 }

      // Standard user viewing Premium title
      const standardView = transformTitle(premiumTitle, 1)
      expect(standardView.isLocked).toBe(true)
      expect(standardView.requiredPlan).toBe('PREMIUM')

      // Premium user viewing Premium title
      const premiumView = transformTitle(premiumTitle, 2)
      expect(premiumView.isLocked).toBe(false)
    })
  })

  describe('buildVisibilityFilter', () => {
    it('applies statutory kids maturity restriction', () => {
      const filter = buildVisibilityFilter({ isKids: true })
      expect(filter.AND).toBeDefined()
      const conditions = filter.AND as Array<Record<string, unknown>>
      const hasKidsGate = conditions.some(
        (c) => 'minAge' in c && (c.minAge as { lte: number }).lte === 7,
      )
      expect(hasKidsGate).toBe(true)
    })

    it('applies adult profile custom maturity rating', () => {
      const filter = buildVisibilityFilter({ isKids: false, maxMaturityRank: 16 })
      const conditions = filter.AND as Array<Record<string, unknown>>
      const hasMaturityGate = conditions.some(
        (c) => 'minAge' in c && (c.minAge as { lte: number }).lte === 16,
      )
      expect(hasMaturityGate).toBe(true)
    })
  })
})

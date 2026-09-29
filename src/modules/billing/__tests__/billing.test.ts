import { describe, it, expect } from 'vitest'
import { formatPlan, checkContentEntitlement } from '../service'

describe('Billing Service & Entitlement Unit Tests', () => {
  describe('checkContentEntitlement', () => {
    it('allows access when user tier equals or exceeds content required tier', () => {
      // Free user (tier 0) accessing Free content (tier 0) -> Allowed
      expect(checkContentEntitlement(0, 0)).toBe(true)
      // Standard user (tier 1) accessing Free content (tier 0) -> Allowed
      expect(checkContentEntitlement(1, 0)).toBe(true)
      // Standard user (tier 1) accessing Standard content (tier 1) -> Allowed
      expect(checkContentEntitlement(1, 1)).toBe(true)
      // Premium user (tier 2) accessing Standard content (tier 1) -> Allowed
      expect(checkContentEntitlement(2, 1)).toBe(true)
      // Premium user (tier 2) accessing Premium content (tier 2) -> Allowed
      expect(checkContentEntitlement(2, 2)).toBe(true)
    })

    it('denies access when user tier is lower than content required tier', () => {
      // Free user (tier 0) accessing Standard content (tier 1) -> Denied
      expect(checkContentEntitlement(0, 1)).toBe(false)
      // Free user (tier 0) accessing Premium content (tier 2) -> Denied
      expect(checkContentEntitlement(0, 2)).toBe(false)
      // Standard user (tier 1) accessing Premium content (tier 2) -> Denied
      expect(checkContentEntitlement(1, 2)).toBe(false)
    })
  })

  describe('formatPlan', () => {
    it('formats free plan correctly with zero price and SD resolution', () => {
      const rawFree = {
        id: 'plan-free-1',
        name: 'Free',
        slug: 'free',
        pricePaise: 0,
        maxProfiles: 1,
        maxStreams: 1,
        maxQualityP: 480,
        maxTierRank: 0,
      }

      const formatted = formatPlan(rawFree)
      expect(formatted.priceFormatted).toBe('Free')
      expect(formatted.resolutionLabel).toBe('480p (SD)')
      expect(formatted.features.length).toBeGreaterThan(0)
      expect(formatted.features[0]).toContain('Unlimited')
    })

    it('formats standard plan correctly with ₹149/mo and 720p HD', () => {
      const rawStandard = {
        id: 'plan-std-1',
        name: 'Standard',
        slug: 'standard',
        pricePaise: 14900,
        maxProfiles: 3,
        maxStreams: 2,
        maxQualityP: 720,
        maxTierRank: 1,
      }

      const formatted = formatPlan(rawStandard)
      expect(formatted.priceFormatted).toBe('₹149/mo')
      expect(formatted.resolutionLabel).toBe('720p (HD)')
      expect(formatted.maxStreams).toBe(2)
      expect(formatted.maxProfiles).toBe(3)
    })

    it('formats premium plan correctly with ₹249/mo and 1080p Full HD', () => {
      const rawPremium = {
        id: 'plan-prem-1',
        name: 'Premium',
        slug: 'premium',
        pricePaise: 24900,
        maxProfiles: 5,
        maxStreams: 4,
        maxQualityP: 1080,
        maxTierRank: 2,
      }

      const formatted = formatPlan(rawPremium)
      expect(formatted.priceFormatted).toBe('₹249/mo')
      expect(formatted.resolutionLabel).toBe('1080p (Full HD)')
      expect(formatted.maxStreams).toBe(4)
      expect(formatted.maxProfiles).toBe(5)
    })
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  registerPlaybackSession,
  sendPlaybackHeartbeat,
  terminatePlaybackSession,
  getActivePlaybackSessionsForAccount,
  terminateAllPlaybackSessions,
  ConcurrentStreamLimitError,
} from '../service'
import * as dal from '../dal'
import * as billing from '@/modules/billing'
import { redis } from '@/lib/redis'

vi.mock('../dal', () => ({
  findVideoAssetById: vi.fn(),
  findActiveVideoAssetByTitleSlug: vi.fn(),
  createPendingVideoAsset: vi.fn(),
  updateVideoAssetStatus: vi.fn(),
  createTranscodeJob: vi.fn(),
  findLatestTranscodeJob: vi.fn(),
  upsertWatchProgress: vi.fn(),
  insertPlayEvents: vi.fn(),
  createPlaybackSession: vi.fn(),
  findPlaybackSessionById: vi.fn(),
  findActivePlaybackSessions: vi.fn(),
  countActivePlaybackSessions: vi.fn(),
  updatePlaybackSessionHeartbeat: vi.fn(),
  endPlaybackSession: vi.fn(),
  endAllPlaybackSessionsForAccount: vi.fn(),
}))

vi.mock('@/modules/billing', () => ({
  getAccountSubscription: vi.fn(),
}))

vi.mock('@/lib/redis', () => ({
  redis: {
    get: vi.fn(),
    setex: vi.fn().mockResolvedValue('OK'),
    del: vi.fn().mockResolvedValue(1),
  },
}))

describe('Real-time Concurrent Stream Limiter (PlaybackSession)', () => {
  const accountId = 'acc-1111-2222-3333'
  const profileId = 'prof-4444-5555'
  const titleId = 'title-7777-8888'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('registerPlaybackSession', () => {
    it('registers a new session when account is under concurrent stream limit', async () => {
      vi.mocked(billing.getAccountSubscription).mockResolvedValue({
        accountId,
        email: 'user@streamforge.internal',
        role: 'user',
        plan: {
          id: 'plan-std',
          name: 'Standard',
          slug: 'standard',
          pricePaise: 14900,
          maxProfiles: 3,
          maxStreams: 2,
          maxQualityP: 720,
          maxTierRank: 1,
          priceFormatted: '₹149/mo',
          resolutionLabel: '720p (HD)',
          features: [],
        },
        isExpired: false,
        expiresAt: null,
      })

      vi.mocked(dal.findActivePlaybackSessions).mockResolvedValue([])

      const mockSession = {
        id: 'session-new-1',
        accountId,
        profileId,
        titleId,
        deviceType: 'desktop',
        ipAddress: '192.168.1.1',
        startedAt: new Date(),
        lastHeartbeatAt: new Date(),
        endedAt: null,
        account: {
          id: accountId,
          plan: null,
        },
      }
      vi.mocked(dal.createPlaybackSession).mockResolvedValue(
        mockSession as unknown as Awaited<ReturnType<typeof dal.createPlaybackSession>>,
      )

      const result = await registerPlaybackSession({
        accountId,
        profileId,
        titleId,
        deviceType: 'desktop',
        ipAddress: '192.168.1.1',
      })

      expect(result.sessionId).toBe('session-new-1')
      expect(result.maxStreams).toBe(2)
      expect(result.activeStreams).toBe(1)
      expect(dal.createPlaybackSession).toHaveBeenCalledTimes(1)
      expect(redis.setex).toHaveBeenCalledWith(`stream:${accountId}:session-new-1`, 60, 'active')
    })

    it('rejects registration and throws ConcurrentStreamLimitError when quota is reached', async () => {
      // Free plan allows 1 stream
      vi.mocked(billing.getAccountSubscription).mockResolvedValue({
        accountId,
        email: 'user@streamforge.internal',
        role: 'user',
        plan: {
          id: 'plan-free',
          name: 'Free',
          slug: 'free',
          pricePaise: 0,
          maxProfiles: 1,
          maxStreams: 1,
          maxQualityP: 480,
          maxTierRank: 0,
          priceFormatted: 'Free',
          resolutionLabel: '480p (SD)',
          features: [],
        },
        isExpired: false,
        expiresAt: null,
      })

      const existingActiveSessions = [
        {
          id: 'session-existing-1',
          accountId,
          profileId: 'prof-other',
          titleId: 'title-other',
          deviceType: 'mobile',
          ipAddress: '10.0.0.1',
          startedAt: new Date('2026-09-30T01:00:00Z'),
          lastHeartbeatAt: new Date('2026-09-30T01:00:30Z'),
          endedAt: null,
          title: {
            id: 'title-other',
            title: 'Cosmic Horizons',
            slug: 'cosmic-horizons',
            backdropUrl: '/images/cosmic.jpg',
          },
        },
      ]
      vi.mocked(dal.findActivePlaybackSessions).mockResolvedValue(
        existingActiveSessions as unknown as Awaited<ReturnType<typeof dal.findActivePlaybackSessions>>,
      )

      await expect(
        registerPlaybackSession({
          accountId,
          profileId,
          titleId,
          deviceType: 'desktop',
        }),
      ).rejects.toThrow(ConcurrentStreamLimitError)

      try {
        await registerPlaybackSession({
          accountId,
          profileId,
          titleId,
          deviceType: 'desktop',
        })
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(ConcurrentStreamLimitError)
        const error = err as ConcurrentStreamLimitError
        expect(error.code).toBe('CONCURRENT_STREAM_LIMIT_EXCEEDED')
        expect(error.maxStreams).toBe(1)
        expect(error.activeStreams).toBe(1)
        expect(error.activeSessions).toHaveLength(1)
        expect(error.activeSessions[0].titleName).toBe('Cosmic Horizons')
      }

      expect(dal.createPlaybackSession).not.toHaveBeenCalled()
    })

    it('defaults to 1 stream if account has no active subscription or expired plan', async () => {
      vi.mocked(billing.getAccountSubscription).mockResolvedValue(null)
      vi.mocked(dal.findActivePlaybackSessions).mockResolvedValue([])

      const mockSession = {
        id: 'session-default-1',
        accountId,
        profileId,
        titleId,
        deviceType: 'tablet',
        ipAddress: '10.0.0.2',
        startedAt: new Date(),
        lastHeartbeatAt: new Date(),
        endedAt: null,
        account: { id: accountId, plan: null },
      }
      vi.mocked(dal.createPlaybackSession).mockResolvedValue(
        mockSession as unknown as Awaited<ReturnType<typeof dal.createPlaybackSession>>,
      )

      const result = await registerPlaybackSession({
        accountId,
        profileId,
        titleId,
        deviceType: 'tablet',
      })

      expect(result.maxStreams).toBe(1)
      expect(result.activeStreams).toBe(1)
    })
  })

  describe('sendPlaybackHeartbeat', () => {
    it('successfully extends heartbeat in database and redis for active session', async () => {
      const sessionId = 'session-123'
      vi.mocked(dal.findPlaybackSessionById).mockResolvedValue({
        id: sessionId,
        accountId,
        profileId,
        titleId,
        deviceType: 'desktop',
        ipAddress: '127.0.0.1',
        startedAt: new Date(),
        lastHeartbeatAt: new Date(),
        endedAt: null,
        account: { id: accountId, plan: null },
      } as unknown as Awaited<ReturnType<typeof dal.findPlaybackSessionById>>)

      vi.mocked(dal.updatePlaybackSessionHeartbeat).mockResolvedValue({ count: 1 })

      const result = await sendPlaybackHeartbeat(sessionId, accountId)

      expect(result.success).toBe(true)
      expect(dal.updatePlaybackSessionHeartbeat).toHaveBeenCalledWith(sessionId)
      expect(redis.setex).toHaveBeenCalledWith(`stream:${accountId}:${sessionId}`, 60, 'active')
    })

    it('returns failure when session is not found or already ended', async () => {
      const sessionId = 'session-ended'
      vi.mocked(dal.findPlaybackSessionById).mockResolvedValue({
        id: sessionId,
        accountId,
        profileId,
        titleId,
        deviceType: null,
        ipAddress: null,
        startedAt: new Date(),
        lastHeartbeatAt: new Date(),
        endedAt: new Date(),
        account: { id: accountId, plan: null },
      } as unknown as Awaited<ReturnType<typeof dal.findPlaybackSessionById>>)

      const result = await sendPlaybackHeartbeat(sessionId, accountId)

      expect(result.success).toBe(false)
      expect(dal.updatePlaybackSessionHeartbeat).not.toHaveBeenCalled()
    })

    it('returns failure when session belongs to a different account', async () => {
      const sessionId = 'session-other'
      vi.mocked(dal.findPlaybackSessionById).mockResolvedValue({
        id: sessionId,
        accountId: 'different-account',
        profileId,
        titleId,
        deviceType: null,
        ipAddress: null,
        startedAt: new Date(),
        lastHeartbeatAt: new Date(),
        endedAt: null,
        account: { id: 'different-account', plan: null },
      } as unknown as Awaited<ReturnType<typeof dal.findPlaybackSessionById>>)

      const result = await sendPlaybackHeartbeat(sessionId, accountId)

      expect(result.success).toBe(false)
      expect(dal.updatePlaybackSessionHeartbeat).not.toHaveBeenCalled()
    })
  })

  describe('terminatePlaybackSession', () => {
    it('successfully terminates session and removes redis stream key', async () => {
      const sessionId = 'session-to-kill'
      vi.mocked(dal.findPlaybackSessionById).mockResolvedValue({
        id: sessionId,
        accountId,
        profileId,
        titleId,
        deviceType: null,
        ipAddress: null,
        startedAt: new Date(),
        lastHeartbeatAt: new Date(),
        endedAt: null,
        account: { id: accountId, plan: null },
      } as unknown as Awaited<ReturnType<typeof dal.findPlaybackSessionById>>)
      vi.mocked(dal.endPlaybackSession).mockResolvedValue({ count: 1 })

      const result = await terminatePlaybackSession(sessionId, accountId)

      expect(result.success).toBe(true)
      expect(result.terminatedSessionId).toBe(sessionId)
      expect(dal.endPlaybackSession).toHaveBeenCalledWith(sessionId)
      expect(redis.del).toHaveBeenCalledWith(`stream:${accountId}:${sessionId}`)
    })

    it('prevents non-admin user from terminating another user session', async () => {
      const sessionId = 'session-someone-else'
      vi.mocked(dal.findPlaybackSessionById).mockResolvedValue({
        id: sessionId,
        accountId: 'victim-account',
        profileId,
        titleId,
        deviceType: null,
        ipAddress: null,
        startedAt: new Date(),
        lastHeartbeatAt: new Date(),
        endedAt: null,
        account: { id: 'victim-account', plan: null },
      } as unknown as Awaited<ReturnType<typeof dal.findPlaybackSessionById>>)

      await expect(
        terminatePlaybackSession(sessionId, accountId, false),
      ).rejects.toThrow('FORBIDDEN')

      expect(dal.endPlaybackSession).not.toHaveBeenCalled()
    })

    it('allows admin to terminate any active session across accounts', async () => {
      const sessionId = 'session-violator'
      vi.mocked(dal.findPlaybackSessionById).mockResolvedValue({
        id: sessionId,
        accountId: 'violator-account',
        profileId,
        titleId,
        deviceType: null,
        ipAddress: null,
        startedAt: new Date(),
        lastHeartbeatAt: new Date(),
        endedAt: null,
        account: { id: 'violator-account', plan: null },
      } as unknown as Awaited<ReturnType<typeof dal.findPlaybackSessionById>>)
      vi.mocked(dal.endPlaybackSession).mockResolvedValue({ count: 1 })

      const result = await terminatePlaybackSession(sessionId, 'admin-account', true)

      expect(result.success).toBe(true)
      expect(dal.endPlaybackSession).toHaveBeenCalledWith(sessionId)
      expect(redis.del).toHaveBeenCalledWith(`stream:violator-account:${sessionId}`)
    })
  })

  describe('getActivePlaybackSessionsForAccount', () => {
    it('returns active sessions with title metadata and plan quota', async () => {
      vi.mocked(billing.getAccountSubscription).mockResolvedValue({
        accountId,
        email: 'user@streamforge.internal',
        role: 'user',
        plan: {
          id: 'plan-prem',
          name: 'Premium',
          slug: 'premium',
          pricePaise: 49900,
          maxProfiles: 5,
          maxStreams: 4,
          maxQualityP: 2160,
          maxTierRank: 2,
          priceFormatted: '₹499/mo',
          resolutionLabel: '4K (Ultra HD)',
          features: [],
        },
        isExpired: false,
        expiresAt: null,
      })

      const activeList = [
        {
          id: 's-1',
          accountId,
          profileId,
          titleId: 't-1',
          deviceType: 'tv',
          ipAddress: '192.168.1.10',
          startedAt: new Date(),
          lastHeartbeatAt: new Date(),
          endedAt: null,
          title: { id: 't-1', title: 'Elephant Dream', slug: 'elephant-dream', backdropUrl: null },
        },
      ]
      vi.mocked(dal.findActivePlaybackSessions).mockResolvedValue(
        activeList as unknown as Awaited<ReturnType<typeof dal.findActivePlaybackSessions>>,
      )

      const result = await getActivePlaybackSessionsForAccount(accountId)

      expect(result.activeStreams).toBe(1)
      expect(result.maxStreams).toBe(4)
      expect(result.sessions[0].title?.title).toBe('Elephant Dream')
      expect(result.sessions[0].deviceType).toBe('tv')
    })
  })

  describe('terminateAllPlaybackSessions', () => {
    it('terminates all sessions for an account', async () => {
      vi.mocked(dal.endAllPlaybackSessionsForAccount).mockResolvedValue({ count: 3 })

      const result = await terminateAllPlaybackSessions(accountId)

      expect(result.success).toBe(true)
      expect(dal.endAllPlaybackSessionsForAccount).toHaveBeenCalledWith(accountId)
    })
  })
})

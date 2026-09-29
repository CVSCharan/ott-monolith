import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword } from '../service'
import {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '@/lib/jwt'

describe('Auth Service - Password Hashing & Verification', () => {
  it('correctly hashes a password and verifies it', async () => {
    const password = 'SuperSecretPassword123!'
    const hash = await hashPassword(password)

    expect(hash).toMatch(/^scrypt:[a-f0-9]{32}:[a-f0-9]{128}$/)

    const isValid = await verifyPassword(password, hash)
    expect(isValid).toBe(true)

    const isInvalid = await verifyPassword('WrongPassword', hash)
    expect(isInvalid).toBe(false)
  })

  it('rejects malformed or tampered hash strings gracefully', async () => {
    expect(await verifyPassword('password', 'invalid-hash-string')).toBe(false)
    expect(await verifyPassword('password', '')).toBe(false)
    expect(await verifyPassword('password', 'bcrypt:fake:hash')).toBe(false)
  })
})

describe('JWT Utilities', () => {
  it('signs and verifies an access token with expected payload', async () => {
    const payload = {
      sub: 'user-uuid-12345',
      email: 'test@streamforge.dev',
      role: 'user' as const,
      planSlug: 'standard' as const,
      profileId: 'profile-uuid-67890',
      isKids: false,
      maxMaturityRank: 13,
    }

    const token = await signAccessToken(payload)
    expect(typeof token).toBe('string')
    expect(token.split('.')).toHaveLength(3)

    const verified = await verifyAccessToken(token)
    expect(verified).not.toBeNull()
    expect(verified?.sub).toBe(payload.sub)
    expect(verified?.email).toBe(payload.email)
    expect(verified?.role).toBe(payload.role)
    expect(verified?.planSlug).toBe(payload.planSlug)
    expect(verified?.profileId).toBe(payload.profileId)
    expect(verified?.isKids).toBe(false)
  })

  it('returns null when verifying an invalid or tampered access token', async () => {
    const invalidToken = 'eyJhbGciOiJIUzI1NiJ9.e30.tampered_signature'
    const result = await verifyAccessToken(invalidToken)
    expect(result).toBeNull()
  })

  it('signs and verifies a refresh token', async () => {
    const payload = {
      sub: 'user-uuid-12345',
      familyId: 'family-uuid-999',
      tokenId: 'token-uuid-111',
    }

    const token = await signRefreshToken(payload)
    const verified = await verifyRefreshToken(token)
    expect(verified).not.toBeNull()
    expect(verified?.sub).toBe(payload.sub)
    expect(verified?.familyId).toBe(payload.familyId)
    expect(verified?.tokenId).toBe(payload.tokenId)
  })
})

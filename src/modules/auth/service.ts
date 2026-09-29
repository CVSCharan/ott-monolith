import crypto from 'node:crypto'
import { promisify } from 'node:util'
import * as dal from './dal'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@/lib/jwt'

const scrypt = promisify(crypto.scrypt)

// ── Password Hashing Utilities ─────────────────────────────────
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex')
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer
  return `scrypt:${salt}:${derivedKey.toString('hex')}`
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const [algo, salt, key] = storedHash.split(':')
    if (algo !== 'scrypt' || !salt || !key) return false

    const derivedKey = (await scrypt(password, salt, 64)) as Buffer
    const keyBuffer = Buffer.from(key, 'hex')
    return crypto.timingSafeEqual(derivedKey, keyBuffer)
  } catch {
    return false
  }
}

// Constant-time dummy verification for unknown emails to defend against timing attacks
const DUMMY_HASH =
  'scrypt:00000000000000000000000000000000:00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'

// ── Business Logic & Service Functions ─────────────────────────

export async function registerAccount(email: string, password: string) {
  const existing = await dal.findAccountByEmail(email)
  if (existing) {
    throw new Error('An account with this email already exists.')
  }

  const defaultPlan = await dal.getDefaultPlan()
  const passwordHash = await hashPassword(password)

  const account = await dal.createAccount({
    email,
    passwordHash,
    role: 'user',
    planId: defaultPlan?.id,
  })

  return account
}

export async function authenticate(email: string, password: string) {
  const account = await dal.findAccountByEmail(email)

  if (!account) {
    // Run dummy check to prevent timing analysis
    await verifyPassword(password, DUMMY_HASH)
    throw new Error('Invalid email or password.')
  }

  const isValid = await verifyPassword(password, account.passwordHash)
  if (!isValid) {
    throw new Error('Invalid email or password.')
  }

  const primaryProfile = account.profiles[0] || null

  // Generate tokens
  const planSlug = (account.plan?.slug as 'free' | 'standard' | 'premium') || 'free'
  const accessToken = await signAccessToken({
    sub: account.id,
    email: account.email,
    role: account.role as 'user' | 'admin',
    planSlug,
    profileId: primaryProfile?.id || null,
    isKids: primaryProfile?.isKids || false,
    maxMaturityRank: primaryProfile?.isKids ? 7 : 18,
  })

  const familyId = crypto.randomUUID()
  const rawRefreshToken = crypto.randomBytes(32).toString('hex')
  const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const dbToken = await dal.createRefreshToken({
    accountId: account.id,
    tokenHash,
    familyId,
    expiresAt,
  })

  const clientRefreshToken = await signRefreshToken({
    sub: account.id,
    familyId,
    tokenId: dbToken.id,
  })

  return {
    account,
    accessToken,
    refreshToken: clientRefreshToken,
    activeProfile: primaryProfile,
  }
}

export async function rotateSession(refreshTokenJwt: string) {
  const payload = await verifyRefreshToken(refreshTokenJwt)
  if (!payload) {
    throw new Error('Invalid or expired refresh token.')
  }

  const tokenHash = crypto.createHash('sha256').update(payload.tokenId).digest('hex')
  const tokenRecord = await dal.findRefreshTokenByHash(tokenHash)

  if (!tokenRecord) {
    throw new Error('Refresh token not found.')
  }

  // Token reuse detection: if already revoked, revoke the entire family!
  if (tokenRecord.isRevoked) {
    await dal.revokeRefreshTokenFamily(tokenRecord.familyId)
    throw new Error('Refresh token reuse detected. All sessions revoked for security.')
  }

  const account = tokenRecord.account
  const planSlug = (account.plan?.slug as 'free' | 'standard' | 'premium') || 'free'

  const newAccessToken = await signAccessToken({
    sub: account.id,
    email: account.email,
    role: account.role as 'user' | 'admin',
    planSlug,
    profileId: null,
    isKids: false,
    maxMaturityRank: 18,
  })

  const newRawToken = crypto.randomBytes(32).toString('hex')
  const newTokenHash = crypto.createHash('sha256').update(newRawToken).digest('hex')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const [, newDbToken] = await dal.rotateRefreshToken(tokenRecord.id, {
    accountId: account.id,
    tokenHash: newTokenHash,
    familyId: tokenRecord.familyId,
    expiresAt,
  })

  const newClientRefreshToken = await signRefreshToken({
    sub: account.id,
    familyId: tokenRecord.familyId,
    tokenId: newDbToken.id,
  })

  return {
    accessToken: newAccessToken,
    refreshToken: newClientRefreshToken,
  }
}

export async function verifyParentalPin(
  accountId: string,
  pin: string,
  ipAddress?: string,
): Promise<boolean> {
  const account = await dal.findAccountById(accountId)
  if (!account) throw new Error('Account not found.')

  // Check lockout
  if (account.pinLockedUntil && account.pinLockedUntil > new Date()) {
    const remainingMinutes = Math.ceil(
      (account.pinLockedUntil.getTime() - Date.now()) / (60 * 1000),
    )
    throw new Error(
      `Parental PIN entry is temporarily locked due to too many failed attempts. Try again in ${remainingMinutes} minutes.`,
    )
  }

  if (!account.parentalPinHash) {
    // No PIN set
    return true
  }

  const isMatch = await verifyPassword(pin, account.parentalPinHash)

  if (isMatch) {
    // Reset attempts on success
    await dal.updatePinAttempts(accountId, 0, null)
    await dal.logParentalPinEvent({
      accountId,
      action: 'verify',
      success: true,
      ipAddress,
    })
    return true
  }

  // Failed attempt
  const nextAttempts = account.pinAttempts + 1
  const shouldLock = nextAttempts >= 5
  const lockedUntil = shouldLock ? new Date(Date.now() + 15 * 60 * 1000) : null

  await dal.updatePinAttempts(accountId, nextAttempts, lockedUntil)
  await dal.logParentalPinEvent({
    accountId,
    action: shouldLock ? 'lockout' : 'verify',
    success: false,
    ipAddress,
  })

  if (shouldLock) {
    throw new Error('Too many incorrect PIN attempts. Parental PIN locked for 15 minutes.')
  }

  throw new Error(`Incorrect PIN. ${5 - nextAttempts} attempts remaining.`)
}

export async function selectActiveProfile(
  accountId: string,
  targetProfileId: string,
  currentIsKids: boolean = false,
  pin?: string,
) {
  const account = await dal.findAccountById(accountId)
  if (!account) throw new Error('Account not found.')

  const targetProfile = await dal.findProfileById(targetProfileId)
  if (!targetProfile || targetProfile.accountId !== accountId) {
    throw new Error('Profile not found.')
  }

  // Leaving a kids profile to a non-kids profile requires PIN
  if (currentIsKids && !targetProfile.isKids) {
    if (!pin) {
      throw new Error('Parental PIN required to switch from Kids to an Adult profile.')
    }
    await verifyParentalPin(accountId, pin)
  }

  const planSlug = (account.plan?.slug as 'free' | 'standard' | 'premium') || 'free'

  const newAccessToken = await signAccessToken({
    sub: account.id,
    email: account.email,
    role: account.role as 'user' | 'admin',
    planSlug,
    profileId: targetProfile.id,
    isKids: targetProfile.isKids,
    maxMaturityRank: targetProfile.isKids ? 7 : 18,
  })

  return {
    accessToken: newAccessToken,
    profile: targetProfile,
  }
}

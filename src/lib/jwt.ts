import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import { env } from '@/lib/env'

export interface AccessTokenPayload extends JWTPayload {
  sub: string // Account ID
  email: string
  role: 'user' | 'admin'
  planSlug: 'free' | 'standard' | 'premium'
  profileId: string | null
  isKids: boolean
  maxMaturityRank: number
}

export interface RefreshTokenPayload extends JWTPayload {
  sub: string // Account ID
  familyId: string
  tokenId: string
}

const accessSecret = new TextEncoder().encode(env.JWT_ACCESS_SECRET)
const refreshSecret = new TextEncoder().encode(env.JWT_REFRESH_SECRET)

/**
 * Signs a 15-minute access token.
 */
export async function signAccessToken(
  payload: Omit<AccessTokenPayload, 'iat' | 'exp'>,
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(accessSecret)
}

/**
 * Verifies an access token. Returns payload or null if expired/invalid.
 */
export async function verifyAccessToken(token: string): Promise<AccessTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, accessSecret, {
      algorithms: ['HS256'],
    })
    return payload as AccessTokenPayload
  } catch {
    return null
  }
}

/**
 * Signs a 7-day refresh token.
 */
export async function signRefreshToken(
  payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>,
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(refreshSecret)
}

/**
 * Verifies a refresh token.
 */
export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, refreshSecret, {
      algorithms: ['HS256'],
    })
    return payload as RefreshTokenPayload
  } catch {
    return null
  }
}

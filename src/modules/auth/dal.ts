import { db } from '@/lib/db'

/**
 * Data Access Layer (DAL) for Auth & Account operations.
 * Strictly encapsulates all database interaction for the auth module.
 */

export async function findAccountByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase()
  return db.account.findFirst({
    where: {
      email: {
        equals: normalizedEmail,
        mode: 'insensitive',
      },
    },
    include: {
      plan: true,
      profiles: true,
    },
  })
}

export async function findAccountById(id: string) {
  return db.account.findUnique({
    where: { id },
    include: {
      plan: true,
      profiles: true,
    },
  })
}

export async function createAccount(data: {
  email: string
  passwordHash: string
  role?: string
  planId?: string
}) {
  const normalizedEmail = data.email.trim().toLowerCase()

  return db.account.create({
    data: {
      email: normalizedEmail,
      passwordHash: data.passwordHash,
      role: data.role || 'user',
      planId: data.planId,
      profiles: {
        create: {
          name: 'Primary Profile',
          isKids: false,
        },
      },
    },
    include: {
      plan: true,
      profiles: true,
    },
  })
}

export async function getDefaultPlan() {
  return db.plan.findFirst({
    where: { slug: 'free' },
  })
}

export async function updateAccountPin(accountId: string, pinHash: string) {
  return db.account.update({
    where: { id: accountId },
    data: {
      parentalPinHash: pinHash,
      pinAttempts: 0,
      pinLockedUntil: null,
    },
  })
}

export async function updatePinAttempts(
  accountId: string,
  attempts: number,
  lockedUntil: Date | null,
) {
  return db.account.update({
    where: { id: accountId },
    data: {
      pinAttempts: attempts,
      pinLockedUntil: lockedUntil,
    },
  })
}

export async function logParentalPinEvent(data: {
  accountId: string
  action: string
  success: boolean
  ipAddress?: string
}) {
  return db.parentalPinEvent.create({
    data: {
      accountId: data.accountId,
      action: data.action,
      success: data.success,
      ipAddress: data.ipAddress,
    },
  })
}

export async function createRefreshToken(data: {
  accountId: string
  tokenHash: string
  familyId: string
  expiresAt: Date
}) {
  return db.refreshToken.create({
    data: {
      accountId: data.accountId,
      tokenHash: data.tokenHash,
      familyId: data.familyId,
      expiresAt: data.expiresAt,
    },
  })
}

export async function findRefreshTokenByHash(tokenHash: string) {
  return db.refreshToken.findUnique({
    where: { tokenHash },
    include: { account: { include: { plan: true } } },
  })
}

export async function rotateRefreshToken(
  oldTokenId: string,
  newToken: {
    accountId: string
    tokenHash: string
    familyId: string
    expiresAt: Date
  },
) {
  return db.$transaction([
    db.refreshToken.update({
      where: { id: oldTokenId },
      data: {
        isRevoked: true,
        replacedAt: new Date(),
      },
    }),
    db.refreshToken.create({
      data: {
        accountId: newToken.accountId,
        tokenHash: newToken.tokenHash,
        familyId: newToken.familyId,
        expiresAt: newToken.expiresAt,
      },
    }),
  ])
}

export async function revokeRefreshTokenFamily(familyId: string) {
  return db.refreshToken.updateMany({
    where: { familyId },
    data: { isRevoked: true },
  })
}

export async function findProfileById(profileId: string) {
  return db.profile.findUnique({
    where: { id: profileId },
  })
}

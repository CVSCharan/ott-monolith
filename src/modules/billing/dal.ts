import { db } from '@/lib/db'
import type { Plan } from '@prisma/client'

/**
 * Data Access Layer (DAL) for billing, plans, and account subscription state.
 * Strictly isolates database access to this file.
 */

export async function findAllPlans(): Promise<Plan[]> {
  return db.plan.findMany({
    orderBy: { maxTierRank: 'asc' },
  })
}

export async function findPlanById(id: string): Promise<Plan | null> {
  return db.plan.findUnique({
    where: { id },
  })
}

export async function findPlanBySlug(slug: string): Promise<Plan | null> {
  return db.plan.findUnique({
    where: { slug },
  })
}

export async function getAccountWithPlan(accountId: string) {
  return db.account.findUnique({
    where: { id: accountId },
    select: {
      id: true,
      email: true,
      role: true,
      planId: true,
      planExpiresAt: true,
      plan: true,
    },
  })
}

export async function updateAccountPlan(accountId: string, planId: string, expiresAt: Date | null) {
  return db.account.update({
    where: { id: accountId },
    data: {
      planId,
      planExpiresAt: expiresAt,
    },
    include: {
      plan: true,
    },
  })
}

export async function clearAccountPlan(accountId: string) {
  return db.account.update({
    where: { id: accountId },
    data: {
      planId: null,
      planExpiresAt: null,
    },
    include: {
      plan: true,
    },
  })
}

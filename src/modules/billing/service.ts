import {
  findAllPlans,
  findPlanById,
  findPlanBySlug,
  getAccountWithPlan,
  updateAccountPlan,
} from './dal'

export interface PlanDisplay {
  id: string
  name: string
  slug: string
  pricePaise: number
  priceFormatted: string
  maxProfiles: number
  maxStreams: number
  maxQualityP: number
  maxTierRank: number
  resolutionLabel: string
  features: string[]
}

export function formatPlan(plan: {
  id: string
  name: string
  slug: string
  pricePaise: number
  maxProfiles: number
  maxStreams: number
  maxQualityP: number
  maxTierRank: number
}): PlanDisplay {
  const priceRupees = plan.pricePaise / 100
  const priceFormatted = priceRupees === 0 ? 'Free' : `₹${priceRupees}/mo`

  const resolutionMap: Record<number, string> = {
    480: '480p (SD)',
    720: '720p (HD)',
    1080: '1080p (Full HD)',
    2160: '4K (Ultra HD)',
  }

  const featuresMap: Record<string, string[]> = {
    free: [
      'Unlimited ad-supported streaming',
      'Watch on phone and tablet',
      '480p Standard Definition',
      '1 active device stream',
      '1 user profile',
    ],
    standard: [
      'All Free content + Standard catalogue',
      'High Definition 720p resolution',
      'Watch on phone, tablet, laptop & TV',
      'Up to 2 simultaneous streams',
      'Up to 3 user profiles with Kids mode',
      'Ad-free experience',
    ],
    premium: [
      'Full access to entire 4K & 1080p library',
      'Full HD & Ultra HD HDR video quality',
      'Up to 4 simultaneous streams',
      'Up to 5 customizable user profiles',
      'Dolby 5.1 & Spatial Audio support',
      'VIP early release access',
    ],
  }

  return {
    ...plan,
    priceFormatted,
    resolutionLabel: resolutionMap[plan.maxQualityP] || `${plan.maxQualityP}p`,
    features: featuresMap[plan.slug] || [
      `${plan.maxQualityP}p quality`,
      `${plan.maxStreams} stream(s)`,
      `${plan.maxProfiles} profile(s)`,
    ],
  }
}

/**
 * Returns all active subscription plans.
 */
export async function getPlansList(): Promise<PlanDisplay[]> {
  const plans = await findAllPlans()
  return plans.map(formatPlan)
}

/**
 * Check whether a user tier satisfies content minimum tier rank.
 */
export function checkContentEntitlement(
  userTierRank: number,
  contentMinTierRank: number,
): boolean {
  return userTierRank >= contentMinTierRank
}

/**
 * Retrieves the current subscription details for an account.
 */
export async function getAccountSubscription(accountId: string) {
  const account = await getAccountWithPlan(accountId)
  if (!account) return null

  // If no plan or expired, fallback to free
  const now = new Date()
  const isExpired = account.planExpiresAt && account.planExpiresAt < now

  if (!account.plan || isExpired) {
    const freePlan = await findPlanBySlug('free')
    return {
      accountId: account.id,
      email: account.email,
      role: account.role,
      plan: freePlan ? formatPlan(freePlan) : null,
      isExpired: Boolean(isExpired),
      expiresAt: account.planExpiresAt,
    }
  }

  return {
    accountId: account.id,
    email: account.email,
    role: account.role,
    plan: formatPlan(account.plan),
    isExpired: false,
    expiresAt: account.planExpiresAt,
  }
}

/**
 * Subscribes or upgrades an account to a specific plan.
 */
export async function subscribeAccountToPlan(
  accountId: string,
  planId: string,
) {
  const plan = await findPlanById(planId)
  if (!plan) {
    throw new Error('PLAN_NOT_FOUND')
  }

  // 30 days active period for paid plans, null for free plan
  let expiresAt: Date | null = null
  if (plan.pricePaise > 0) {
    expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)
  }

  const updatedAccount = await updateAccountPlan(accountId, plan.id, expiresAt)
  return {
    success: true,
    plan: formatPlan(plan),
    expiresAt: updatedAccount.planExpiresAt,
  }
}

'use server'

import { requireSession } from '@/modules/auth'
import { subscribeAccountToPlan, type PlanDisplay } from './service'
import { revalidatePath } from 'next/cache'

export type ActionResult<T = void> =
  { success: true; data: T } | { success: false; code: string; message: string; details?: unknown }

/**
 * Server Action: Subscribes the authenticated account to a plan.
 */
export async function subscribeToPlanAction(
  planId: string,
): Promise<ActionResult<{ plan: PlanDisplay; expiresAt: Date | null }>> {
  try {
    const session = await requireSession()

    if (!session || !session.sub) {
      return {
        success: false,
        code: 'UNAUTHORIZED',
        message: 'You must be logged in to change your subscription plan.',
      }
    }

    const result = await subscribeAccountToPlan(session.sub, planId)

    revalidatePath('/plans')
    revalidatePath('/')

    return {
      success: true,
      data: {
        plan: result.plan,
        expiresAt: result.expiresAt,
      },
    }
  } catch (error) {
    return {
      success: false,
      code: 'SUBSCRIPTION_ERROR',
      message: error instanceof Error ? error.message : 'Failed to update subscription.',
    }
  }
}

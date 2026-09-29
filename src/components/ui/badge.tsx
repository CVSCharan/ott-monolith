import * as React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Lock } from 'lucide-react'
import type { MaturityRating, PlanTier } from '@/lib/mock-data'

export interface MaturityBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  rating: MaturityRating
}

export function MaturityBadge({ rating, className, ...props }: MaturityBadgeProps) {
  const ratingStyles: Record<MaturityRating, string> = {
    U: 'border-maturity-u text-maturity-u bg-maturity-u/10',
    'U/A 7+': 'border-maturity-7 text-maturity-7 bg-maturity-7/10',
    'U/A 13+': 'border-maturity-13 text-maturity-13 bg-maturity-13/10',
    'U/A 16+': 'border-maturity-16 text-maturity-16 bg-maturity-16/10',
    A: 'border-maturity-18 text-maturity-18 bg-maturity-18/10',
  }

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center justify-center font-ui text-caption font-semibold tracking-wide border px-1.5 py-0.5 rounded-sm select-none',
          ratingStyles[rating],
          className,
        ),
      )}
      {...props}
    >
      {rating}
    </span>
  )
}

export interface PlanLockBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  plan: PlanTier
}

export function PlanLockBadge({ plan, className, ...props }: PlanLockBadgeProps) {
  if (plan === 'FREE') return null

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1 font-ui text-caption font-semibold tracking-wide bg-accent-soft text-accent-300 border border-accent-500/40 px-2 py-0.5 rounded-sm select-none shadow-sm backdrop-blur-xs',
          className,
        ),
      )}
      {...props}
    >
      <Lock className="w-3 h-3 text-accent-400 stroke-[2.2]" aria-hidden="true" />
      <span>{plan}</span>
    </span>
  )
}

export interface QualityBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  quality: '4K UHD' | 'HD' | 'HDR' | '5.1' | string
}

export function QualityBadge({ quality, className, ...props }: QualityBadgeProps) {
  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center justify-center font-ui text-caption font-medium border border-border text-text-muted px-1.5 py-0.5 rounded-sm select-none',
          className,
        ),
      )}
      {...props}
    >
      {quality}
    </span>
  )
}

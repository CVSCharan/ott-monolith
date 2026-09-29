'use client'

import * as React from 'react'
import { Check, Sparkles, Shield, Tv, Smartphone, Award, ArrowRight, Loader2 } from 'lucide-react'
import { subscribeToPlanAction } from '@/modules/billing/actions'

export interface PlanItem {
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

interface PlanSelectorProps {
  plans: PlanItem[]
  currentPlanSlug?: string
}

export function PlanSelector({ plans, currentPlanSlug = 'free' }: PlanSelectorProps) {
  const [selectedPlanId, setSelectedPlanId] = React.useState<string>(
    plans.find((p) => p.slug === currentPlanSlug)?.id || plans[0]?.id || '',
  )
  const [activePlanSlug, setActivePlanSlug] = React.useState<string>(currentPlanSlug)
  const [isLoading, setIsLoading] = React.useState(false)
  const [statusMessage, setStatusMessage] = React.useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const handleSelectPlan = async (plan: PlanItem) => {
    setSelectedPlanId(plan.id)
    if (plan.slug === activePlanSlug) return

    setIsLoading(true)
    setStatusMessage(null)

    try {
      const res = await subscribeToPlanAction(plan.id)
      if (res.success) {
        setActivePlanSlug(plan.slug)
        setStatusMessage({
          type: 'success',
          text: `Success! You are now subscribed to the ${plan.name} plan.`,
        })
      } else {
        setStatusMessage({
          type: 'error',
          text: res.message || 'Unable to update plan. Please log in first.',
        })
      }
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'A network error occurred. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-page-gutter py-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 text-caption font-semibold mb-4">
          <Sparkles className="w-4 h-4" />
          <span>FLEXIBLE PLANS · CANCEL ANYTIME</span>
        </div>
        <h1 className="text-display-md md:text-display-lg font-display font-bold text-text-primary tracking-tight mb-4">
          Choose the plan that fits your entertainment
        </h1>
        <p className="text-body-md text-text-secondary">
          Enjoy unlimited blockbuster movies, award-winning originals, and ad-free 4K Ultra HD streaming across all your devices.
        </p>
      </div>

      {/* Notification Banner */}
      {statusMessage && (
        <div
          role="status"
          className={`p-4 rounded-lg mb-8 max-w-2xl mx-auto text-body-sm font-medium border flex items-center justify-between ${
            statusMessage.type === 'success'
              ? 'bg-success-soft border-success text-success'
              : 'bg-error-soft border-error text-error'
          }`}
        >
          <span>{statusMessage.text}</span>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-caption underline font-semibold hover:opacity-80"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
        {plans.map((plan) => {
          const isSelected = selectedPlanId === plan.id
          const isCurrent = activePlanSlug === plan.slug
          const isPopular = plan.slug === 'premium'

          return (
            <div
              key={plan.id}
              className={`relative rounded-xl flex flex-col justify-between transition-all duration-fast p-6 md:p-8 ${
                isPopular
                  ? 'bg-gradient-to-b from-bg-surface to-bg-card border-2 border-accent-500 shadow-accent-glow'
                  : 'bg-bg-surface/80 border border-border hover:border-border/80'
              } ${isSelected ? 'ring-2 ring-accent-400' : ''}`}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-accent-500 text-white text-caption font-bold px-3 py-0.5 rounded-full tracking-wider uppercase shadow-md flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  Most Popular
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold text-heading-2 text-text-primary">
                    {plan.name}
                  </h3>
                  {isCurrent && (
                    <span className="text-caption font-semibold bg-bg-surface border border-accent-400 text-accent-400 px-2.5 py-0.5 rounded-full">
                      Active Plan
                    </span>
                  )}
                </div>

                <div className="mb-6">
                  <span className="font-display text-display-md font-bold text-text-primary">
                    {plan.priceFormatted}
                  </span>
                  {plan.pricePaise > 0 && (
                    <span className="text-body-sm text-text-muted ml-1">billed monthly</span>
                  )}
                </div>

                <div className="space-y-2 mb-8 pb-6 border-b border-border/60">
                  <div className="flex items-center justify-between text-body-sm">
                    <span className="text-text-secondary">Resolution:</span>
                    <span className="font-semibold text-text-primary">{plan.resolutionLabel}</span>
                  </div>
                  <div className="flex items-center justify-between text-body-sm">
                    <span className="text-text-secondary">Simultaneous Streams:</span>
                    <span className="font-semibold text-text-primary">{plan.maxStreams} devices</span>
                  </div>
                  <div className="flex items-center justify-between text-body-sm">
                    <span className="text-text-secondary">Profiles:</span>
                    <span className="font-semibold text-text-primary">{plan.maxProfiles} max</span>
                  </div>
                </div>

                {/* Features List */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-body-sm text-text-secondary">
                      <Check className="w-4 h-4 text-accent-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div>
                <button
                  type="button"
                  disabled={isLoading || isCurrent}
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full py-3 px-4 rounded-md font-semibold text-body-sm transition-all flex items-center justify-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-accent-400 ${
                    isCurrent
                      ? 'bg-bg-surface border border-border text-text-muted cursor-default'
                      : isPopular
                      ? 'bg-accent-500 hover:bg-accent-600 text-white shadow-md'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                  }`}
                >
                  {isLoading && isSelected ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : isCurrent ? (
                    <span>Current Active Plan</span>
                  ) : (
                    <>
                      <span>{plan.pricePaise > 0 ? `Upgrade to ${plan.name}` : `Switch to ${plan.name}`}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Comparison Matrix Table */}
      <div className="mt-16 bg-bg-surface/60 border border-border rounded-xl p-6 md:p-8">
        <h2 className="font-display font-bold text-heading-2 text-text-primary mb-6">
          Detailed Feature Comparison
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/80">
                <th className="py-4 px-4 text-body-sm font-semibold text-text-secondary">Feature</th>
                {plans.map((p) => (
                  <th key={p.id} className="py-4 px-4 text-body-sm font-bold text-text-primary text-center">
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-body-sm">
              <tr>
                <td className="py-3 px-4 text-text-secondary">Monthly Price</td>
                {plans.map((p) => (
                  <td key={p.id} className="py-3 px-4 text-center font-semibold text-text-primary">
                    {p.priceFormatted}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 text-text-secondary">Maximum Video Quality</td>
                {plans.map((p) => (
                  <td key={p.id} className="py-3 px-4 text-center text-text-primary">
                    {p.resolutionLabel}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 text-text-secondary">Supported Screens</td>
                {plans.map((p) => (
                  <td key={p.id} className="py-3 px-4 text-center text-text-primary">
                    {p.slug === 'free' ? 'Phone, Tablet' : 'TV, Computer, Phone, Tablet'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 text-text-secondary">Simultaneous Streams</td>
                {plans.map((p) => (
                  <td key={p.id} className="py-3 px-4 text-center text-text-primary">
                    {p.maxStreams}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 text-text-secondary">Offline Downloads</td>
                {plans.map((p) => (
                  <td key={p.id} className="py-3 px-4 text-center">
                    {p.slug === 'free' ? (
                      <span className="text-text-muted">—</span>
                    ) : (
                      <Check className="w-4 h-4 text-accent-400 mx-auto" />
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 text-text-secondary">Spatial Audio (Dolby Atmos)</td>
                {plans.map((p) => (
                  <td key={p.id} className="py-3 px-4 text-center">
                    {p.slug === 'premium' ? (
                      <Check className="w-4 h-4 text-accent-400 mx-auto" />
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 text-text-secondary">Ad-Free Viewing</td>
                {plans.map((p) => (
                  <td key={p.id} className="py-3 px-4 text-center">
                    {p.slug !== 'free' ? (
                      <Check className="w-4 h-4 text-accent-400 mx-auto" />
                    ) : (
                      <span className="text-text-muted">Ad-supported</span>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Trust & Guarantee Badges */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="p-4 rounded-lg bg-bg-surface/40 border border-border/50 flex flex-col items-center">
          <Shield className="w-6 h-6 text-accent-400 mb-2" />
          <h4 className="font-semibold text-text-primary text-body-sm">No Long-Term Contracts</h4>
          <p className="text-caption text-text-muted">Upgrade, downgrade, or cancel with zero hassle online.</p>
        </div>
        <div className="p-4 rounded-lg bg-bg-surface/40 border border-border/50 flex flex-col items-center">
          <Tv className="w-6 h-6 text-accent-400 mb-2" />
          <h4 className="font-semibold text-text-primary text-body-sm">Watch Everywhere</h4>
          <p className="text-caption text-text-muted">Stream seamlessly across smart TVs, phones, tablets, and web.</p>
        </div>
        <div className="p-4 rounded-lg bg-bg-surface/40 border border-border/50 flex flex-col items-center">
          <Smartphone className="w-6 h-6 text-accent-400 mb-2" />
          <h4 className="font-semibold text-text-primary text-body-sm">Tailored for Profiles</h4>
          <p className="text-caption text-text-muted">Individual recommendations and statutory parental controls.</p>
        </div>
      </div>
    </div>
  )
}

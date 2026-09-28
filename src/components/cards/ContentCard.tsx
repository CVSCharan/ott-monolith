'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Play, Plus, Check, Info } from 'lucide-react'
import { MaturityBadge, PlanLockBadge } from '@/components/ui/badge'
import type { MockTitle } from '@/lib/mock-data'

export interface ContentCardProps {
  title: MockTitle
  aspectRatio?: 'video' | 'poster'
  onMoreInfo: (title: MockTitle) => void
  rank?: number // for Top 10 rails
}

export function ContentCard({
  title,
  aspectRatio = 'video',
  onMoreInfo,
  rank,
}: ContentCardProps) {
  const [inList, setInList] = React.useState(false)

  const handleToggleList = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setInList(!inList)
  }

  const handleMoreInfoClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onMoreInfo(title)
  }

  const isPoster = aspectRatio === 'poster'
  const imageUrl = isPoster ? title.posterUrl : title.backdropUrl

  return (
    <div
      className={`content-card group relative flex-shrink-0 rounded-md overflow-hidden bg-bg-surface border border-border select-none outline-none focus-within:ring-2 focus-within:ring-accent-400 ${
        isPoster
          ? 'w-[140px] sm:w-[170px] md:w-[200px] aspect-poster'
          : 'w-[230px] sm:w-[280px] md:w-[320px] aspect-video'
      }`}
    >
      {/* ── Main Playback Navigation Link (Covers card) ── */}
      <Link
        href={`/watch/${title.slug}`}
        className="absolute inset-0 z-0 outline-none"
        aria-label={`Watch ${title.title}`}
      >
        <Image
          src={imageUrl}
          alt={title.title}
          fill
          sizes={isPoster ? '200px' : '320px'}
          className="object-cover object-center transition-transform duration-base group-hover:scale-105"
        />

        {/* Ambient dominant color overlay at rest */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: `${title.dominantColor}20` }}
        />

        {/* Subtle bottom vignette for title legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-base/90 via-transparent to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-fast" />
      </Link>

      {/* ── Plan Lock Badge (Top Right) ── */}
      <div className="absolute top-2 right-2 z-10 pointer-events-none">
        <PlanLockBadge plan={title.requiredPlan} />
      </div>

      {/* ── Top-10 Numeral Badge if specified in card ── */}
      {rank && (
        <div className="absolute top-2 left-2 z-10 pointer-events-none bg-bg-base/70 backdrop-blur-xs px-2 py-0.5 rounded-sm border border-border">
          <span className="font-display font-bold text-caption text-accent-300">
            #{rank}
          </span>
        </div>
      )}

      {/* ── Rest State: Bottom Title Label ── */}
      <div className="absolute inset-x-0 bottom-0 p-3 z-10 pointer-events-none transition-opacity duration-fast group-hover:opacity-0">
        <p className="font-display font-bold text-body-sm text-text-primary truncate">
          {title.title}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-caption font-semibold text-success">
            {title.matchScore}% Match
          </span>
          <MaturityBadge rating={title.maturityRating} className="text-[10px] py-0 px-1" />
        </div>
      </div>

      {/* ── Hover Expansion Overlay ── */}
      <div className="absolute inset-0 z-20 flex flex-col justify-end p-3 bg-bg-elevated/95 backdrop-blur-sm opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-fast">
        {/* Title */}
        <p className="font-display font-bold text-body-sm text-text-primary line-clamp-1 mb-1">
          {title.title}
        </p>

        {/* Metadata Row */}
        <div className="flex items-center gap-2 mb-2 text-caption">
          <span className="font-semibold text-success">{title.matchScore}% Match</span>
          <MaturityBadge rating={title.maturityRating} className="text-[10px] py-0 px-1" />
          <span className="text-text-muted">{title.duration}</span>
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/50">
          <div className="flex items-center gap-1.5">
            {/* Play Button */}
            <Link
              href={`/watch/${title.slug}`}
              className="p-2 rounded-full bg-accent-500 hover:bg-accent-600 text-white shadow-sm transition-transform active:scale-90 outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
              aria-label={`Play ${title.title}`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
            </Link>

            {/* My List Toggle Button */}
            <button
              type="button"
              onClick={handleToggleList}
              className={`p-2 rounded-full border transition-all active:scale-90 outline-none focus-visible:ring-2 focus-visible:ring-accent-400 ${
                inList
                  ? 'bg-accent-soft border-accent-400 text-accent-300'
                  : 'bg-bg-surface border-border hover:border-border-hover text-text-primary'
              }`}
              aria-label={inList ? `Remove ${title.title} from My List` : `Add ${title.title} to My List`}
            >
              {inList ? (
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              ) : (
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              )}
            </button>
          </div>

          {/* Quick-View "More info" Button */}
          <button
            type="button"
            onClick={handleMoreInfoClick}
            className="p-2 rounded-full bg-bg-surface border border-border hover:border-border-hover text-text-primary hover:text-accent-300 transition-all active:scale-90 outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
            aria-label={`More details about ${title.title}`}
          >
            <Info className="w-3.5 h-3.5 stroke-[2]" />
          </button>
        </div>
      </div>
    </div>
  )
}

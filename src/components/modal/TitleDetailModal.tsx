'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Play, Plus, Check, ThumbsUp, Volume2, VolumeX } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { MaturityBadge, PlanLockBadge, QualityBadge } from '@/components/ui/badge'
import type { MockTitle } from '@/lib/mock-data'
import { MOCK_TITLES } from '@/lib/mock-data'

export interface TitleDetailModalProps {
  title: MockTitle | null
  isOpen: boolean
  onClose: () => void
  onSelectSimilarTitle?: (title: MockTitle) => void
}

export function TitleDetailModal({
  title,
  isOpen,
  onClose,
  onSelectSimilarTitle,
}: TitleDetailModalProps) {
  const [inList, setInList] = React.useState(false)
  const [isLiked, setIsLiked] = React.useState(false)
  const [isMuted, setIsMuted] = React.useState(true)

  if (!title) return null

  // Find similar titles sharing genres
  const similarTitles = MOCK_TITLES.filter(
    (item) => item.id !== title.id && item.genres.some((g) => title.genres.includes(g)),
  ).slice(0, 3)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="p-0 overflow-hidden bg-bg-surface border-border max-w-3xl">
        {/* ── Top Backdrop Area with Ambient Color & Scrim ── */}
        <div className="relative w-full aspect-video min-h-[300px] sm:min-h-[380px] bg-bg-base overflow-hidden">
          <Image
            src={title.backdropUrl}
            alt={title.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 800px"
            className="object-cover object-center"
          />

          {/* Dominant Color Ambient Overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ backgroundColor: `${title.dominantColor}40` }}
          />

          {/* Vignette Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-bg-surface via-bg-surface/40 to-transparent pointer-events-none" />

          {/* Foreground Title & Primary Actions */}
          <div className="absolute inset-x-0 bottom-6 px-6 sm:px-8 z-10 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <PlanLockBadge plan={title.requiredPlan} />
            </div>

            <DialogTitle className="font-display font-bold text-heading-1 sm:text-display-lg text-text-primary drop-shadow-md">
              {title.title}
            </DialogTitle>

            <div className="flex items-center justify-between gap-4 pt-1">
              <div className="flex items-center gap-3">
                <Link href={`/watch/${title.slug}`} className="outline-none">
                  <Button variant="primary" size="md" className="gap-2 px-6">
                    <Play className="w-4 h-4 fill-current" />
                    <span>Play</span>
                  </Button>
                </Link>

                <Button
                  variant="glass"
                  size="icon"
                  onClick={() => setInList(!inList)}
                  aria-label={inList ? 'Remove from My List' : 'Add to My List'}
                  className={inList ? 'border-accent-400 text-accent-300' : ''}
                >
                  {inList ? (
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                  )}
                </Button>

                <Button
                  variant="glass"
                  size="icon"
                  onClick={() => setIsLiked(!isLiked)}
                  aria-label={isLiked ? 'Unlike' : 'Like'}
                  className={isLiked ? 'border-accent-400 text-accent-300 fill-accent-300' : ''}
                >
                  <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                </Button>
              </div>

              <Button
                variant="glass"
                size="icon"
                onClick={() => setIsMuted(!isMuted)}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
                className="bg-bg-scrim/80"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* ── Details Body ── */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column: Synopsis & Key Info */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex flex-wrap items-center gap-3 font-ui text-body-sm">
                <span className="font-bold text-success">{title.matchScore}% Match</span>
                <span className="text-text-secondary">{title.releaseYear}</span>
                <span className="text-text-secondary">{title.duration}</span>
                <MaturityBadge rating={title.maturityRating} />
                <QualityBadge quality={title.qualityBadge} />
              </div>

              <DialogDescription className="font-ui text-body text-text-primary leading-relaxed">
                {title.fullDescription}
              </DialogDescription>

              <div className="pt-2 border-t border-border/40 space-y-1.5 font-ui text-caption text-text-secondary">
                <p>
                  <span className="text-text-muted">Audio:</span> {title.audioTracks.join(', ')}
                </p>
                <p>
                  <span className="text-text-muted">Subtitles:</span> {title.subtitles.join(', ')}
                </p>
              </div>
            </div>

            {/* Right Column: Cast, Genres, Director */}
            <div className="space-y-4 font-ui text-body-sm border-t md:border-t-0 md:border-l border-border/40 pt-4 md:pt-0 md:pl-6">
              <div>
                <p className="text-caption text-text-muted mb-1">Cast</p>
                <p className="text-text-secondary leading-normal">{title.cast.join(', ')}</p>
              </div>

              <div>
                <p className="text-caption text-text-muted mb-1">Genres</p>
                <p className="text-text-secondary leading-normal">{title.genres.join(', ')}</p>
              </div>

              <div>
                <p className="text-caption text-text-muted mb-1">Director</p>
                <p className="text-text-secondary">{title.director}</p>
              </div>
            </div>
          </div>

          {/* ── More Like This Section ── */}
          {similarTitles.length > 0 && (
            <div className="pt-6 border-t border-border space-y-4">
              <h3 className="font-display font-bold text-heading-3 text-text-primary">
                More Like This
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {similarTitles.map((similar) => (
                  <div
                    key={similar.id}
                    onClick={() => onSelectSimilarTitle?.(similar)}
                    className="group cursor-pointer rounded-md overflow-hidden bg-bg-elevated border border-border hover:border-accent-400 transition-all duration-fast"
                  >
                    <div className="relative aspect-video w-full bg-bg-base">
                      <Image
                        src={similar.backdropUrl}
                        alt={similar.title}
                        fill
                        sizes="240px"
                        className="object-cover group-hover:scale-105 transition-transform duration-fast"
                      />
                      <div className="absolute top-2 right-2">
                        <PlanLockBadge plan={similar.requiredPlan} />
                      </div>
                    </div>

                    <div className="p-3 space-y-1.5">
                      <div className="flex items-center justify-between text-caption">
                        <span className="font-semibold text-success">
                          {similar.matchScore}% Match
                        </span>
                        <MaturityBadge rating={similar.maturityRating} className="text-[10px]" />
                      </div>
                      <p className="font-display font-semibold text-body-sm text-text-primary truncate">
                        {similar.title}
                      </p>
                      <p className="font-ui text-caption text-text-muted line-clamp-2">
                        {similar.synopsis}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

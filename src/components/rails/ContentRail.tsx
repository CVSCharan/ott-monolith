'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight, ChevronRight as ArrowLink } from 'lucide-react'
import { ContentCard } from '@/components/cards/ContentCard'
import type { MockTitle } from '@/lib/mock-data'

export interface ContentRailProps {
  id: string
  title: string
  items: MockTitle[]
  isTop10?: boolean
  aspectRatio?: 'video' | 'poster'
  onMoreInfo: (title: MockTitle) => void
}

export function ContentRail({
  id,
  title,
  items,
  isTop10 = false,
  aspectRatio = 'video',
  onMoreInfo,
}: ContentRailProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null)
  const [canScrollLeft, setCanScrollLeft] = React.useState(false)
  const [canScrollRight, setCanScrollRight] = React.useState(true)

  const updateScrollButtons = React.useCallback(() => {
    if (!scrollContainerRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
    setCanScrollLeft(scrollLeft > 10)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10)
  }, [])

  React.useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return

    updateScrollButtons()
    el.addEventListener('scroll', updateScrollButtons, { passive: true })
    window.addEventListener('resize', updateScrollButtons)

    return () => {
      el.removeEventListener('scroll', updateScrollButtons)
      window.removeEventListener('resize', updateScrollButtons)
    }
  }, [updateScrollButtons, items])

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return
    const container = scrollContainerRef.current
    const scrollAmount = container.clientWidth * 0.75
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  return (
    <section className="relative my-8 sm:my-10 group/rail" aria-labelledby={`rail-heading-${id}`}>
      {/* ── Rail Header ── */}
      <div className="flex items-center justify-between px-page-gutter max-w-7xl mx-auto mb-3">
        <h2
          id={`rail-heading-${id}`}
          className="font-display font-bold text-heading-2 text-text-primary flex items-center gap-1.5 group cursor-pointer"
        >
          <span>{title}</span>
          <ArrowLink className="w-4 h-4 text-accent-400 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-fast" />
        </h2>
      </div>

      {/* ── Rail Track with Previous / Next Controls ── */}
      <div className="relative px-page-gutter max-w-7xl mx-auto">
        {/* Scroll Left Button */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-10 sm:w-12 h-2/3 glass border-r border-y border-border rounded-r-md flex items-center justify-center text-text-primary hover:text-accent-300 opacity-0 group-hover/rail:opacity-100 transition-opacity duration-fast outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-accent-400"
            aria-label={`Scroll ${title} left`}
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
          </button>
        )}

        {/* Scroll Right Button */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-10 sm:w-12 h-2/3 glass border-l border-y border-border rounded-l-md flex items-center justify-center text-text-primary hover:text-accent-300 opacity-0 group-hover/rail:opacity-100 transition-opacity duration-fast outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-accent-400"
            aria-label={`Scroll ${title} right`}
          >
            <ChevronRight className="w-6 h-6 stroke-[2.5]" />
          </button>
        )}

        {/* ── Scrollable Track ── */}
        <div
          ref={scrollContainerRef}
          className="content-rail-items scroll-smooth"
          tabIndex={0}
          role="region"
          aria-label={`${title} carousel`}
        >
          {items.map((item, index) => {
            const rank = index + 1
            if (isTop10) {
              return (
                <div
                  key={`${id}-${item.id}-${rank}`}
                  className="flex items-center flex-shrink-0 group/top10"
                >
                  {/* Oversized Top 10 Numeral */}
                  <span
                    className="top10-numeral text-[7rem] sm:text-[9rem] font-black leading-none -mr-4 sm:-mr-6 select-none pointer-events-none drop-shadow-lg z-0"
                    aria-hidden="true"
                  >
                    {rank}
                  </span>

                  {/* Top-10 Card (Portrait or Landscape) */}
                  <div className="relative z-10">
                    <ContentCard
                      title={item}
                      aspectRatio={aspectRatio === 'poster' ? 'poster' : 'poster'}
                      onMoreInfo={onMoreInfo}
                      rank={rank}
                    />
                  </div>
                </div>
              )
            }

            return (
              <ContentCard
                key={`${id}-${item.id}`}
                title={item}
                aspectRatio={aspectRatio}
                onMoreInfo={onMoreInfo}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}

'use client'

import * as React from 'react'
import Image from 'next/image'
import { Play, Info, Volume2, VolumeX, Pause, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MaturityBadge, QualityBadge } from '@/components/ui/badge'
import { shouldAutoplayTrailer } from '@/lib/device-capabilities'
import type { MockTitle } from '@/lib/mock-data'

export interface BillboardProps {
  title: MockTitle
  onMoreInfo: (title: MockTitle) => void
  onPlay: (title: MockTitle) => void
}

export function Billboard({ title, onMoreInfo, onPlay }: BillboardProps) {
  const [isPlayingTrailer, setIsPlayingTrailer] = React.useState(false)
  const [isTrailerBuffering, setIsTrailerBuffering] = React.useState(false)
  const [isPaused, setIsPaused] = React.useState(false)
  const [isMuted, setIsMuted] = React.useState(true)
  const [isVideoEnded, setIsVideoEnded] = React.useState(false)
  const [canAutoplay, setCanAutoplay] = React.useState(false)

  const videoRef = React.useRef<HTMLVideoElement | null>(null)

  // Verify client device capabilities before mounting trailer video
  React.useEffect(() => {
    // 2.5s idle delay before mounting & playing trailer if capabilities allow
    const timer = setTimeout(() => {
      if (shouldAutoplayTrailer()) {
        setCanAutoplay(true)
        setIsTrailerBuffering(true)
        setIsPlayingTrailer(true)
      }
    }, 2500)

    return () => clearTimeout(timer)
  }, [])

  const handleTogglePlayPause = () => {
    if (!videoRef.current) return

    if (videoRef.current.paused) {
      videoRef.current.play()
      setIsPaused(false)
      setIsVideoEnded(false)
    } else {
      videoRef.current.pause()
      setIsPaused(true)
    }
  }

  const handleToggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !videoRef.current.muted
    setIsMuted(videoRef.current.muted)
  }

  const handleVideoEnded = () => {
    setIsVideoEnded(true)
    setIsPlayingTrailer(false)
  }

  const handleReplay = () => {
    if (!videoRef.current) return
    videoRef.current.currentTime = 0
    videoRef.current.play()
    setIsVideoEnded(false)
    setIsPaused(false)
    setIsPlayingTrailer(true)
  }

  return (
    <section
      className="relative w-full h-[75vh] min-h-[500px] max-h-[850px] overflow-hidden select-none bg-bg-base"
      aria-label={`Featured: ${title.title}`}
    >
      {/* ── Background Layer: Static Poster with Ken Burns subtle zoom ── */}
      <div className="absolute inset-0 z-0">
        <Image
          src={title.backdropUrl}
          alt={title.title}
          fill
          priority
          sizes="100vw"
          className={`object-cover object-center ${
            canAutoplay && !isPaused ? 'animate-ken-burns' : ''
          }`}
        />

        {/* Dynamic ambient color overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundColor: `${title.dominantColor}33`, // 20% alpha
          }}
        />

        {/* ── Video Trailer Layer (Mounted only if device capabilities pass) ── */}
        {canAutoplay && isPlayingTrailer && !isVideoEnded && (
          <video
            ref={videoRef}
            src={title.trailerUrl}
            autoPlay
            muted={isMuted}
            playsInline
            onPlaying={() => setIsTrailerBuffering(false)}
            onEnded={handleVideoEnded}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-cinematic ease-cinematic ${
              isTrailerBuffering ? 'opacity-0' : 'opacity-100'
            }`}
          />
        )}

        {/* Vignette content scrim (Standard gradient rule) */}
        <div className="absolute inset-0 billboard-vignette pointer-events-none" />
      </div>

      {/* ── Foreground Content ── */}
      <div className="relative z-10 flex flex-col justify-end h-full px-page-gutter max-w-7xl mx-auto pb-16 sm:pb-24">
        <div className="max-w-2xl space-y-4">
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-ui text-caption font-bold text-success bg-success-soft px-2 py-0.5 rounded-sm">
              {title.matchScore}% Match
            </span>
            <MaturityBadge rating={title.maturityRating} />
            <span className="font-ui text-caption text-text-secondary font-medium">
              {title.duration}
            </span>
            <QualityBadge quality={title.qualityBadge} />
            <div className="hidden sm:flex items-center gap-1.5 text-caption text-text-muted">
              {title.genres.slice(0, 3).map((genre, idx) => (
                <span key={genre}>
                  {idx > 0 && <span className="mx-1">•</span>}
                  {genre}
                </span>
              ))}
            </div>
          </div>

          {/* Title Heading */}
          <h1 className="font-display font-bold text-display-xl leading-tight tracking-tight text-text-primary text-balance drop-shadow-md">
            {title.title}
          </h1>

          {/* Synopsis */}
          <p className="font-ui text-body text-text-secondary line-clamp-3 max-w-xl text-pretty leading-relaxed drop-shadow-sm">
            {title.synopsis}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={() => onPlay(title)}
              aria-label={`Play ${title.title}`}
              className="px-8 shadow-card"
            >
              <Play className="w-5 h-5 fill-current stroke-[1.5]" />
              <span>Play Now</span>
            </Button>

            <Button
              variant="glass"
              size="lg"
              onClick={() => onMoreInfo(title)}
              aria-label={`More information about ${title.title}`}
            >
              <Info className="w-5 h-5 stroke-[2]" />
              <span>More Info</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ── Visible Trailer Controls (Lifecycle: Pause, Volume, Replay) ── */}
      {canAutoplay && (
        <div className="absolute right-page-gutter bottom-16 sm:bottom-24 z-20 flex items-center gap-2">
          {isVideoEnded ? (
            <Button
              variant="glass"
              size="icon"
              onClick={handleReplay}
              aria-label="Replay preview trailer"
              className="bg-bg-scrim/80 hover:bg-bg-elevated border-border"
            >
              <RotateCcw className="w-4 h-4 text-text-primary" />
            </Button>
          ) : (
            isPlayingTrailer && (
              <>
                <Button
                  variant="glass"
                  size="icon"
                  onClick={handleTogglePlayPause}
                  aria-label={isPaused ? 'Resume preview trailer' : 'Pause preview trailer'}
                  className="bg-bg-scrim/80 hover:bg-bg-elevated border-border"
                >
                  {isPaused ? (
                    <Play className="w-4 h-4 text-text-primary fill-current" />
                  ) : (
                    <Pause className="w-4 h-4 text-text-primary" />
                  )}
                </Button>

                <Button
                  variant="glass"
                  size="icon"
                  onClick={handleToggleMute}
                  aria-label={isMuted ? 'Unmute preview trailer' : 'Mute preview trailer'}
                  className="bg-bg-scrim/80 hover:bg-bg-elevated border-border"
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 text-text-primary" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-text-primary" />
                  )}
                </Button>
              </>
            )
          )}
        </div>
      )}
    </section>
  )
}

'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Play,
  Pause,
  ArrowLeft,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Settings,
  Subtitles,
  Lock,
} from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { MOCK_TITLES, type MockTitle } from '@/lib/mock-data'
import { MaturityBadge } from '@/components/ui/badge'

export default function WatchPlayerPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params?.slug as string

  const title: MockTitle =
    MOCK_TITLES.find((t) => t.slug === slug) || MOCK_TITLES[0]

  const videoRef = React.useRef<HTMLVideoElement | null>(null)
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  const [isPlaying, setIsPlaying] = React.useState(true)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [duration, setDuration] = React.useState(0)
  const [isMuted, setIsMuted] = React.useState(false)
  const [volume, setVolume] = React.useState(1)
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [showControls, setShowControls] = React.useState(true)
  const [selectedQuality, setSelectedQuality] = React.useState('1080p')
  const [selectedSubtitle, setSelectedSubtitle] = React.useState('Off')

  const controlsTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const hideControlsAfterDelay = React.useCallback(() => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)
  }, [isPlaying])

  const handleMouseMove = () => {
    setShowControls(true)
    hideControlsAfterDelay()
  }

  React.useEffect(() => {
    hideControlsAfterDelay()
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    }
  }, [hideControlsAfterDelay])

  const togglePlay = () => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play()
      setIsPlaying(true)
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
      setShowControls(true)
    }
  }

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    setCurrentTime(videoRef.current.currentTime)
  }

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return
    setDuration(videoRef.current.duration)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return
    const newTime = parseFloat(e.target.value)
    videoRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const skipSeconds = (seconds: number) => {
    if (!videoRef.current) return
    videoRef.current.currentTime = Math.max(
      0,
      Math.min(videoRef.current.currentTime + seconds, duration)
    )
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    const nextMuted = !isMuted
    videoRef.current.muted = nextMuted
    setIsMuted(nextMuted)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return
    const val = parseFloat(e.target.value)
    videoRef.current.volume = val
    setVolume(val)
    setIsMuted(val === 0)
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setIsFullscreen(false)
    }
  }

  const formatTime = (timeInSeconds: number) => {
    const mins = Math.floor(timeInSeconds / 60)
    const secs = Math.floor(timeInSeconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-screen h-screen bg-bg-base overflow-hidden select-none cursor-default"
    >
      {/* ── HTML5 / HLS Video Element ── */}
      <video
        ref={videoRef}
        src={title.trailerUrl}
        autoPlay
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onClick={togglePlay}
        className="w-full h-full object-contain cursor-pointer"
      />

      {/* ── Overlay Scrim for Controls ── */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-bg-base/90 via-transparent to-bg-base/80 transition-opacity duration-fast pointer-events-none ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* ── Top Bar: Back Button & Title ── */}
      <div
        className={`absolute top-0 inset-x-0 p-6 z-30 flex items-center justify-between transition-opacity duration-fast ${
          showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2.5 rounded-full bg-bg-elevated/70 hover:bg-bg-elevated text-text-primary transition-all active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
            aria-label="Back to browse"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2]" />
          </button>

          <div>
            <h1 className="font-display font-bold text-heading-3 text-text-primary flex items-center gap-2">
              <span>{title.title}</span>
              <MaturityBadge rating={title.maturityRating} className="text-[10px]" />
            </h1>
            <p className="font-ui text-caption text-text-muted">
              {title.type === 'series' ? 'S1 : E1 • Pilot' : title.genres.join(' • ')}
            </p>
          </div>
        </div>
      </div>

      {/* ── Bottom Controls Bar ── */}
      <div
        className={`absolute bottom-0 inset-x-0 p-6 sm:p-8 z-30 flex flex-col gap-3 transition-opacity duration-fast ${
          showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Timeline Scrubber Bar (ScaleY 4px -> 8px on hover) */}
        <div className="group/scrubber relative w-full flex items-center py-2 cursor-pointer">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer accent-accent-500 transition-all duration-instant group-hover/scrubber:h-2"
            aria-label="Seek video position"
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between gap-4 font-ui text-body-sm text-text-primary">
          {/* Left Controls: Play, Skip, Volume, Time */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={togglePlay}
              className="p-2 rounded-full hover:bg-bg-elevated/60 text-text-primary transition-transform active:scale-90 outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-current" />
              ) : (
                <Play className="w-6 h-6 fill-current" />
              )}
            </button>

            {/* Rewind 10s */}
            <button
              type="button"
              onClick={() => skipSeconds(-10)}
              className="p-2 rounded-full hover:bg-bg-elevated/60 text-text-secondary hover:text-text-primary transition-all active:scale-90 outline-none"
              aria-label="Rewind 10 seconds"
            >
              <RotateCcw className="w-5 h-5 stroke-[1.8]" />
            </button>

            {/* Fast-Forward 10s */}
            <button
              type="button"
              onClick={() => skipSeconds(10)}
              className="p-2 rounded-full hover:bg-bg-elevated/60 text-text-secondary hover:text-text-primary transition-all active:scale-90 outline-none"
              aria-label="Forward 10 seconds"
            >
              <RotateCw className="w-5 h-5 stroke-[1.8]" />
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-2 group/vol">
              <button
                type="button"
                onClick={toggleMute}
                className="p-2 rounded-full hover:bg-bg-elevated/60 text-text-primary outline-none"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-border rounded-lg appearance-none cursor-pointer accent-accent-500 opacity-80 group-hover/vol:opacity-100"
                aria-label="Volume slider"
              />
            </div>

            {/* Time Indicator */}
            <span className="text-caption text-text-muted ml-2 font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right Controls: Subtitles, Quality, Fullscreen */}
          <div className="flex items-center gap-3">
            {/* Subtitles & Audio Selector */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  type="button"
                  className="p-2 rounded-full hover:bg-bg-elevated/60 text-text-secondary hover:text-text-primary transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
                  aria-label="Audio and Subtitles"
                >
                  <Subtitles className="w-5 h-5 stroke-[1.8]" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="z-dropdown min-w-44 bg-bg-elevated border border-border rounded-md p-1.5 shadow-modal text-caption text-text-primary"
                  sideOffset={10}
                  align="end"
                >
                  <p className="px-3 py-1.5 text-[11px] font-bold text-text-muted uppercase tracking-wider">
                    Subtitles
                  </p>
                  {['Off', 'English [CC]', 'Spanish', 'Hindi'].map((sub) => (
                    <DropdownMenu.Item
                      key={sub}
                      onClick={() => setSelectedSubtitle(sub)}
                      className={`px-3 py-1.5 rounded-sm cursor-pointer hover:bg-bg-surface outline-none flex items-center justify-between ${
                        selectedSubtitle === sub ? 'text-accent-300 font-semibold' : ''
                      }`}
                    >
                      <span>{sub}</span>
                      {selectedSubtitle === sub && <span className="w-1.5 h-1.5 rounded-full bg-accent-400" />}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>

            {/* Quality Selector with Plan Tiers */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  type="button"
                  className="p-2 rounded-full hover:bg-bg-elevated/60 text-text-secondary hover:text-text-primary transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
                  aria-label="Stream Quality Settings"
                >
                  <Settings className="w-5 h-5 stroke-[1.8]" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="z-dropdown min-w-48 bg-bg-elevated border border-border rounded-md p-1.5 shadow-modal text-caption text-text-primary"
                  sideOffset={10}
                  align="end"
                >
                  <p className="px-3 py-1.5 text-[11px] font-bold text-text-muted uppercase tracking-wider">
                    Video Quality
                  </p>
                  {[
                    { label: 'Auto (1080p)', val: 'Auto', locked: false },
                    { label: '1080p Full HD', val: '1080p', locked: false },
                    { label: '720p HD', val: '720p', locked: false },
                    { label: '4K Ultra HD', val: '4k', locked: true, plan: 'PREMIUM' },
                  ].map((q) => (
                    <DropdownMenu.Item
                      key={q.val}
                      onClick={() => !q.locked && setSelectedQuality(q.val)}
                      disabled={q.locked}
                      className={`px-3 py-1.5 rounded-sm flex items-center justify-between ${
                        q.locked
                          ? 'opacity-50 cursor-not-allowed'
                          : 'cursor-pointer hover:bg-bg-surface'
                      } ${selectedQuality === q.val ? 'text-accent-300 font-semibold' : ''}`}
                    >
                      <span>{q.label}</span>
                      {q.locked ? (
                        <span className="flex items-center gap-1 text-[10px] text-accent-400">
                          <Lock className="w-2.5 h-2.5" />
                          {q.plan}
                        </span>
                      ) : selectedQuality === q.val ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-400" />
                      ) : null}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>

            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2 rounded-full hover:bg-bg-elevated/60 text-text-secondary hover:text-text-primary transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5 stroke-[1.8]" />
              ) : (
                <Maximize className="w-5 h-5 stroke-[1.8]" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

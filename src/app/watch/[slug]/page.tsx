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
import type HlsType from 'hls.js'

interface PlaybackData {
  hlsMasterUrl: string
  subtitles: Array<{
    languageCode: string
    label: string
    isDefault: boolean
    vttUrl: string
  }>
  maxQualityP: number
  durationSeconds: number
}

interface QualityOption {
  label: string
  height: number
  levelIndex: number
  locked: boolean
  plan?: string
}

export default function WatchPlayerPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params?.slug as string

  const title: MockTitle =
    MOCK_TITLES.find((t) => t.slug === slug) || MOCK_TITLES[0]

  const videoRef = React.useRef<HTMLVideoElement | null>(null)
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const hlsRef = React.useRef<HlsType | null>(null)
  const sessionIdRef = React.useRef<string>(crypto.randomUUID())

  const [isPlaying, setIsPlaying] = React.useState(true)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [duration, setDuration] = React.useState(0)
  const [isMuted, setIsMuted] = React.useState(false)
  const [volume, setVolume] = React.useState(1)
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [showControls, setShowControls] = React.useState(true)
  const [selectedQuality, setSelectedQuality] = React.useState<string>('Auto')
  const [availableQualities, setAvailableQualities] = React.useState<QualityOption[]>([])
  const [selectedSubtitle, setSelectedSubtitle] = React.useState('Off')
  const [subtitlesList, setSubtitlesList] = React.useState<Array<{ code: string; label: string }>>([
    { code: 'off', label: 'Off' },
  ])
  const [playbackData, setPlaybackData] = React.useState<PlaybackData | null>(null)

  const controlsTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const beaconIntervalRef = React.useRef<NodeJS.Timeout | null>(null)

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

  // ── Send Player Beacon (Progress & QoE) ──────────────────────
  const sendBeacon = React.useCallback(
    (eventType = 'heartbeat') => {
      if (!videoRef.current) return
      const currentPos = videoRef.current.currentTime
      const currentDur = videoRef.current.duration || duration || 1

      const payload = {
        titleId: title.id,
        videoAssetId: slug,
        playbackSessionId: sessionIdRef.current,
        progress: {
          positionSeconds: currentPos,
          durationSeconds: currentDur,
          isCompleted: currentPos > currentDur * 0.9,
        },
        events: [
          {
            eventType,
            positionSeconds: currentPos,
            quality: selectedQuality,
            deviceType: 'desktop',
            occurredAt: new Date().toISOString(),
          },
        ],
      }

      // Try sendBeacon on unload, fallback to fetch with keepalive
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        navigator.sendBeacon('/api/player/beacon', blob)
      } else {
        fetch('/api/player/beacon', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(() => {})
      }
    },
    [title.id, slug, duration, selectedQuality]
  )

  // ── 10s Debounced Beacon Loop ────────────────────────────────
  React.useEffect(() => {
    beaconIntervalRef.current = setInterval(() => {
      if (isPlaying) {
        sendBeacon('heartbeat')
      }
    }, 10000)

    const handleBeforeUnload = () => sendBeacon('pause')
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      if (beaconIntervalRef.current) clearInterval(beaconIntervalRef.current)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      sendBeacon('pause')
    }
  }, [isPlaying, sendBeacon])

  // ── Fetch Playback Info & Attach HLS ─────────────────────────
  React.useEffect(() => {
    let isCancelled = false

    async function initializePlayer() {
      const video = videoRef.current
      if (!video) return

      try {
        // Fetch signed playback info
        const res = await fetch(`/api/video/playback/${slug}`)
        let data: PlaybackData | null = null
        if (res.ok) {
          const json = await res.json()
          data = json.data
        }

        if (isCancelled) return

        if (data) {
          setPlaybackData(data)
          if (data.durationSeconds) setDuration(data.durationSeconds)

          if (data.subtitles && data.subtitles.length > 0) {
            setSubtitlesList([
              { code: 'off', label: 'Off' },
              ...data.subtitles.map((s) => ({ code: s.languageCode, label: s.label })),
            ])
          }
        }

        const streamUrl = data?.hlsMasterUrl || title.trailerUrl
        const HlsModule = (await import('hls.js')).default

        if (HlsModule.isSupported() && data?.hlsMasterUrl) {
          if (hlsRef.current) {
            hlsRef.current.destroy()
          }

          const hls = new HlsModule({
            enableWorker: true,
            lowLatencyMode: true,
          })
          hlsRef.current = hls

          hls.loadSource(streamUrl)
          hls.attachMedia(video)

          hls.on(HlsModule.Events.MANIFEST_PARSED, (_, manifestData) => {
            const maxP = data?.maxQualityP ?? 1080
            const qualities: QualityOption[] = [
              { label: 'Auto', height: 0, levelIndex: -1, locked: false },
            ]

            manifestData.levels.forEach((lvl, idx) => {
              const h = lvl.height
              const isLocked = h > maxP
              qualities.push({
                label: `${h}p`,
                height: h,
                levelIndex: idx,
                locked: isLocked,
                plan: isLocked ? (h >= 1080 ? 'PREMIUM' : 'STANDARD') : undefined,
              })
            })

            // Add standard options if levels are sparse
            if (qualities.length <= 1) {
              qualities.push(
                { label: '480p SD', height: 480, levelIndex: 0, locked: false },
                { label: '720p HD', height: 720, levelIndex: 1, locked: maxP < 720, plan: 'STANDARD' },
                { label: '1080p FHD', height: 1080, levelIndex: 2, locked: maxP < 1080, plan: 'PREMIUM' }
              )
            }

            setAvailableQualities(qualities)
            video.play().catch(() => setIsPlaying(false))
          })

          hls.on(HlsModule.Events.ERROR, (_, errorData) => {
            if (errorData.fatal) {
              // Fallback gracefully to direct trailer MP4
              video.src = title.trailerUrl
              video.play().catch(() => setIsPlaying(false))
            }
          })
        } else if (video.canPlayType('application/vnd.apple.mpegurl') && data?.hlsMasterUrl) {
          // Native Safari HLS
          video.src = data.hlsMasterUrl
          video.play().catch(() => setIsPlaying(false))
        } else {
          // Fallback to direct MP4
          video.src = title.trailerUrl
          video.play().catch(() => setIsPlaying(false))
        }
      } catch {
        // Network or module error fallback
        if (video) {
          video.src = title.trailerUrl
          video.play().catch(() => setIsPlaying(false))
        }
      }
    }

    initializePlayer()

    return () => {
      isCancelled = true
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [slug, title.trailerUrl])

  const togglePlay = () => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play()
      setIsPlaying(true)
      sendBeacon('play')
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
      setShowControls(true)
      sendBeacon('pause')
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
    sendBeacon('seek')
  }

  const skipSeconds = (seconds: number) => {
    if (!videoRef.current) return
    videoRef.current.currentTime = Math.max(
      0,
      Math.min(videoRef.current.currentTime + seconds, duration)
    )
    sendBeacon('seek')
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

  const handleQualityChange = (q: QualityOption) => {
    if (q.locked) return
    setSelectedQuality(q.label)
    if (hlsRef.current) {
      hlsRef.current.currentLevel = q.levelIndex
    }
    sendBeacon('quality_change')
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
        autoPlay
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onClick={togglePlay}
        className="w-full h-full object-contain cursor-pointer"
      >
        {playbackData?.subtitles?.map((s) => (
          <track
            key={s.languageCode}
            kind="subtitles"
            label={s.label}
            srcLang={s.languageCode}
            src={s.vttUrl}
            default={s.isDefault}
          />
        ))}
      </video>

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
                  {subtitlesList.map((sub) => (
                    <DropdownMenu.Item
                      key={sub.code}
                      onClick={() => setSelectedSubtitle(sub.label)}
                      className={`px-3 py-1.5 rounded-sm cursor-pointer hover:bg-bg-surface outline-none flex items-center justify-between ${
                        selectedSubtitle === sub.label ? 'text-accent-300 font-semibold' : ''
                      }`}
                    >
                      <span>{sub.label}</span>
                      {selectedSubtitle === sub.label && (
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-400" />
                      )}
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
                  {(availableQualities.length > 0
                    ? availableQualities
                    : [
                        { label: 'Auto (1080p)', height: 0, levelIndex: -1, locked: false },
                        { label: '1080p Full HD', height: 1080, levelIndex: 2, locked: false },
                        { label: '720p HD', height: 720, levelIndex: 1, locked: false },
                        { label: '4K Ultra HD', height: 2160, levelIndex: 3, locked: true, plan: 'PREMIUM' },
                      ]
                  ).map((q) => (
                    <DropdownMenu.Item
                      key={q.label}
                      onClick={() => handleQualityChange(q)}
                      disabled={q.locked}
                      className={`px-3 py-1.5 rounded-sm flex items-center justify-between ${
                        q.locked
                          ? 'opacity-50 cursor-not-allowed'
                          : 'cursor-pointer hover:bg-bg-surface'
                      } ${selectedQuality === q.label ? 'text-accent-300 font-semibold' : ''}`}
                    >
                      <span>{q.label}</span>
                      {q.locked ? (
                        <span className="flex items-center gap-1 text-[10px] text-accent-400">
                          <Lock className="w-2.5 h-2.5" />
                          {q.plan}
                        </span>
                      ) : selectedQuality === q.label ? (
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

'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Sparkles, Lock, ShieldAlert, Check } from 'lucide-react'
import { selectProfileAction } from '@/modules/auth/actions'

export interface ProfileItem {
  id: string
  name: string
  isKids: boolean
  avatarColor: string
}

export interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  currentProfileId?: string
  isKidsMode?: boolean
  onProfileSelected?: (profile: ProfileItem) => void
}

const DEFAULT_PROFILES: ProfileItem[] = [
  {
    id: 'prof-adult-01',
    name: 'John Doe',
    isKids: false,
    avatarColor: 'bg-accent-600',
  },
  {
    id: 'prof-kids-02',
    name: 'Kids Profile',
    isKids: true,
    avatarColor: 'bg-maturity-u',
  },
  {
    id: 'prof-admin-03',
    name: 'Admin',
    isKids: false,
    avatarColor: 'bg-accent-500',
  },
]

export function ProfileModal({
  isOpen,
  onClose,
  currentProfileId = 'prof-adult-01',
  isKidsMode = false,
  onProfileSelected,
}: ProfileModalProps) {
  const [selectedTarget, setSelectedTarget] = React.useState<ProfileItem | null>(null)
  const [requiresPin, setRequiresPin] = React.useState(false)
  const [pin, setPin] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [isPending, setIsPending] = React.useState(false)

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setRequiresPin(false)
      setPin('')
      setError(null)
      onClose()
    }
  }

  const handleSelect = async (profile: ProfileItem) => {
    setError(null)

    // If leaving a kids profile to a non-kids profile, require parental PIN
    if (isKidsMode && !profile.isKids) {
      setSelectedTarget(profile)
      setRequiresPin(true)
      return
    }

    await applyProfileSwitch(profile)
  }

  const applyProfileSwitch = async (profile: ProfileItem, enteredPin?: string) => {
    setIsPending(true)
    setError(null)

    try {
      const result = await selectProfileAction(profile.id, enteredPin)

      if (!result.success) {
        setError(result.error || 'Failed to switch profile.')
        return
      }

      onProfileSelected?.(profile)
      onClose()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsPending(false)
    }
  }

  const handleVerifyPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTarget) return

    if (pin.length !== 4) {
      setError('Please enter a 4-digit PIN.')
      return
    }

    await applyProfileSwitch(selectedTarget, pin)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl p-6 sm:p-8 bg-bg-surface border-border">
        {!requiresPin ? (
          <>
            <DialogTitle className="font-display font-bold text-heading-2 text-text-primary text-center">
              Who’s Watching?
            </DialogTitle>
            <DialogDescription className="font-ui text-caption text-text-muted text-center mb-8">
              Select your profile to load personalized recommendations and settings.
            </DialogDescription>

            {error && (
              <div className="p-3 mb-6 rounded-md bg-error-soft border border-error/40 text-error text-caption font-medium">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 py-4">
              {DEFAULT_PROFILES.map((profile) => {
                const isActive = profile.id === currentProfileId

                return (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => handleSelect(profile)}
                    disabled={isPending}
                    className="flex flex-col items-center gap-3 group outline-none focus-visible:ring-2 focus-visible:ring-accent-400 rounded-lg p-3 transition-transform active:scale-95"
                  >
                    <div
                      className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg flex items-center justify-center text-white font-display font-bold text-heading-1 shadow-card transition-all duration-fast group-hover:ring-4 group-hover:ring-white/30 ${
                        profile.avatarColor
                      } ${isActive ? 'ring-2 ring-accent-400' : ''}`}
                    >
                      {profile.name.charAt(0)}

                      {profile.isKids && (
                        <div className="absolute top-1.5 right-1.5 bg-bg-base/70 p-1 rounded-full text-white">
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                      )}

                      {isActive && (
                        <div className="absolute bottom-1.5 right-1.5 bg-accent-500 p-1 rounded-full text-white">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <span className="font-ui text-body-sm font-semibold text-text-secondary group-hover:text-text-primary transition-colors text-center">
                      {profile.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </>
        ) : (
          /* ── Parental PIN Verification Form ── */
          <div>
            <div className="w-12 h-12 rounded-full bg-accent-soft border border-accent-400/40 text-accent-300 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 stroke-[2]" />
            </div>

            <DialogTitle className="font-display font-bold text-heading-2 text-text-primary text-center">
              Parental PIN Required
            </DialogTitle>
            <DialogDescription className="font-ui text-caption text-text-muted text-center mb-6">
              Enter your 4-digit account PIN to exit Kids Mode and access {selectedTarget?.name}.
            </DialogDescription>

            {error && (
              <div className="p-3 mb-4 rounded-md bg-error-soft border border-error/40 text-error text-caption font-medium flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleVerifyPinSubmit} className="space-y-6">
              <div className="flex justify-center">
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  autoFocus
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-36 text-center tracking-[1em] text-heading-1 font-mono py-2 rounded-md bg-bg-input border border-border text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
                />
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setRequiresPin(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  disabled={isPending || pin.length !== 4}
                >
                  {isPending ? 'Verifying...' : 'Unlock Profile'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

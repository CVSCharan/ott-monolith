'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { loginAction, signUpAction } from '@/modules/auth/actions'

export interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  initialMode?: 'login' | 'signup'
}

export function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
}: AuthModalProps) {
  const [mode, setMode] = React.useState<'login' | 'signup'>(initialMode)
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [isPending, setIsPending] = React.useState(false)

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setError(null)
      onClose()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsPending(true)

    const formData = new FormData()
    formData.append('email', email)
    formData.append('password', password)

    try {
      const action = mode === 'login' ? loginAction : signUpAction
      const result = await action(formData)

      if (!result.success) {
        setError(result.error || 'Authentication failed.')
      } else {
        onClose()
        onSuccess?.()
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md p-6 sm:p-8 bg-bg-surface border-border">
        <DialogTitle className="font-display font-bold text-heading-2 text-text-primary text-center">
          {mode === 'login' ? 'Sign In to StreamForge' : 'Create Your Account'}
        </DialogTitle>
        <DialogDescription className="font-ui text-caption text-text-muted text-center mb-6">
          {mode === 'login'
            ? 'Access your watchlist, custom profiles, and 4K streams.'
            : 'Start streaming your favorite series, movies, and family specials.'}
        </DialogDescription>

        {/* Tab Switcher */}
        <div className="flex border-b border-border mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('login')
              setError(null)
            }}
            className={`flex-1 py-2 text-body-sm font-semibold border-b-2 transition-colors outline-none ${
              mode === 'login'
                ? 'border-accent-400 text-text-primary'
                : 'border-transparent text-text-muted hover:text-text-secondary'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup')
              setError(null)
            }}
            className={`flex-1 py-2 text-body-sm font-semibold border-b-2 transition-colors outline-none ${
              mode === 'signup'
                ? 'border-accent-400 text-text-primary'
                : 'border-transparent text-text-muted hover:text-text-secondary'
            }`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-md bg-error-soft border border-error/40 text-error text-caption font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="auth-email"
              className="block font-ui text-caption font-medium text-text-secondary mb-1.5"
            >
              Email Address
            </label>
            <input
              id="auth-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 rounded-md bg-bg-input border border-border text-text-primary placeholder:text-text-muted outline-none focus-visible:ring-2 focus-visible:ring-accent-400 transition-colors text-body-sm"
            />
          </div>

          <div>
            <label
              htmlFor="auth-password"
              className="block font-ui text-caption font-medium text-text-secondary mb-1.5"
            >
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-md bg-bg-input border border-border text-text-primary placeholder:text-text-muted outline-none focus-visible:ring-2 focus-visible:ring-accent-400 transition-colors text-body-sm"
            />
            {mode === 'signup' && (
              <p className="text-[11px] text-text-muted mt-1">
                Must be at least 8 characters long.
              </p>
            )}
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isPending}
              className="w-full"
            >
              {isPending
                ? 'Please wait...'
                : mode === 'login'
                ? 'Sign In'
                : 'Create Account'}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center text-caption text-text-muted">
          Demo Admin Credentials: <br />
          <span className="font-mono text-text-secondary">admin@streamforge.dev</span> /{' '}
          <span className="font-mono text-text-secondary">StreamForge_Admin_DevPassword_2026!</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}

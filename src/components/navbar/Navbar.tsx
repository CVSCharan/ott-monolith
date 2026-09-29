'use client'

import * as React from 'react'
import Link from 'next/link'
import { Search, Bell, Sparkles, ChevronDown, User, ShieldCheck, LogOut } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { logoutAction } from '@/modules/auth/actions'

export interface NavbarProps {
  isKidsMode?: boolean
  onToggleKidsMode?: () => void
  onOpenAuth?: (mode: 'login' | 'signup') => void
  onOpenProfileSwitch?: () => void
  activeProfileName?: string
  isAuthenticated?: boolean
}

export function Navbar({
  isKidsMode = false,
  onToggleKidsMode,
  onOpenAuth,
  onOpenProfileSwitch,
  activeProfileName = 'John Doe',
  isAuthenticated = true,
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [isSearchOpen, setIsSearchOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className="fixed top-0 inset-x-0 h-16 z-navbar select-none">
      {/* Hardware-accelerated crossfade backdrop layer */}
      <div
        className={`absolute inset-0 bg-bg-base/85 backdrop-blur-md border-b border-border transition-opacity duration-fast pointer-events-none ${
          isScrolled ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
      />

      <nav
        className="relative z-10 flex items-center justify-between h-full px-page-gutter max-w-7xl mx-auto"
        aria-label="Main Navigation"
      >
        {/* Left: Brand & Navigation Links */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 group outline-none focus-visible:ring-2 focus-visible:ring-accent-400 rounded-sm"
          >
            <div className="w-8 h-8 rounded-md bg-accent-500 flex items-center justify-center shadow-accent-glow text-white font-display font-bold text-heading-3">
              S
            </div>
            <span className="font-display font-bold text-heading-2 tracking-wide text-text-primary group-hover:text-accent-300 transition-colors duration-fast">
              STREAM<span className="text-accent-400">FORGE</span>
            </span>
          </Link>

          {!isKidsMode ? (
            <ul className="hidden md:flex items-center gap-6 font-ui text-body-sm text-text-secondary font-medium">
              <li>
                <Link
                  href="/"
                  className="text-text-primary font-semibold hover:text-accent-300 transition-colors duration-fast"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="#series"
                  className="hover:text-text-primary transition-colors duration-fast"
                >
                  Series
                </Link>
              </li>
              <li>
                <Link
                  href="#movies"
                  className="hover:text-text-primary transition-colors duration-fast"
                >
                  Movies
                </Link>
              </li>
              <li>
                <Link
                  href="#new"
                  className="hover:text-text-primary transition-colors duration-fast"
                >
                  New & Popular
                </Link>
              </li>
              <li>
                <Link
                  href="#mylist"
                  className="hover:text-text-primary transition-colors duration-fast"
                >
                  My List
                </Link>
              </li>
            </ul>
          ) : (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-maturity-u/10 border border-maturity-u text-maturity-u text-caption font-semibold">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>KIDS ZONE ACTIVE</span>
            </div>
          )}
        </div>

        {/* Right: Search, Kids Toggle, Notifications, Profile */}
        <div className="flex items-center gap-4">
          {/* Search Bar / Trigger */}
          <div className="relative flex items-center">
            {isSearchOpen ? (
              <div className="flex items-center bg-bg-surface border border-border-focus rounded-full px-3 py-1.5 transition-all duration-fast">
                <Search className="w-4 h-4 text-text-muted mr-2" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Titles, people, genres..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-text-primary text-body-sm placeholder:text-text-muted outline-none w-36 sm:w-56"
                  autoFocus
                  onBlur={() => !searchQuery && setIsSearchOpen(false)}
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-text-secondary hover:text-text-primary transition-colors duration-fast rounded-full hover:bg-bg-elevated outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
                aria-label="Search catalog"
              >
                <Search className="w-5 h-5 stroke-[1.8]" />
              </button>
            )}
          </div>

          {/* Kids Mode Toggle */}
          <button
            type="button"
            onClick={onToggleKidsMode}
            className={`px-2.5 py-1 rounded-sm text-caption font-semibold tracking-wide border transition-all duration-fast outline-none focus-visible:ring-2 focus-visible:ring-accent-400 active:scale-95 ${
              isKidsMode
                ? 'bg-maturity-u text-bg-base border-maturity-u font-bold shadow-sm'
                : 'border-border text-text-secondary hover:text-text-primary hover:border-border-hover'
            }`}
            aria-label={isKidsMode ? 'Exit Kids mode' : 'Enter Kids mode'}
          >
            KIDS
          </button>

          {/* Notifications */}
          <button
            type="button"
            className="p-2 text-text-secondary hover:text-text-primary transition-colors duration-fast rounded-full hover:bg-bg-elevated outline-none focus-visible:ring-2 focus-visible:ring-accent-400 relative"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 stroke-[1.8]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-500" />
          </button>

          {isAuthenticated ? (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-1.5 p-1 rounded-full border border-border hover:border-accent-400 transition-colors duration-fast outline-none focus-visible:ring-2 focus-visible:ring-accent-400 group"
                  aria-label="User profile menu"
                >
                  <div className="w-8 h-8 rounded-full bg-accent-600 flex items-center justify-center text-white text-caption font-bold shadow-sm">
                    {isKidsMode ? 'KD' : activeProfileName.charAt(0)}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-text-muted group-hover:text-text-primary transition-transform duration-fast" />
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="z-dropdown min-w-48 bg-bg-elevated border border-border rounded-md p-1.5 shadow-modal font-ui text-body-sm text-text-primary outline-none animate-in fade-in-50 duration-fast"
                  sideOffset={8}
                  align="end"
                >
                  <div className="px-3 py-2 border-b border-border/50 mb-1">
                    <p className="font-semibold text-text-primary">
                      {isKidsMode ? 'Kids Profile' : activeProfileName}
                    </p>
                    <p className="text-caption text-text-muted">
                      {isKidsMode ? 'Restricted to U & U/A 7+' : 'Premium 4K UHD Plan'}
                    </p>
                  </div>

                  <DropdownMenu.Item
                    onClick={onOpenProfileSwitch}
                    className="flex items-center gap-2 px-3 py-2 rounded-sm cursor-pointer hover:bg-bg-surface hover:text-accent-300 outline-none transition-colors duration-fast"
                  >
                    <User className="w-4 h-4 text-text-muted" />
                    <span>Switch Profiles</span>
                  </DropdownMenu.Item>

                  <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 rounded-sm cursor-pointer hover:bg-bg-surface hover:text-accent-300 outline-none transition-colors duration-fast">
                    <ShieldCheck className="w-4 h-4 text-text-muted" />
                    <span>Account & Billing</span>
                  </DropdownMenu.Item>

                  <DropdownMenu.Separator className="h-px bg-border my-1" />

                  <DropdownMenu.Item
                    onClick={() => logoutAction()}
                    className="flex items-center gap-2 px-3 py-2 rounded-sm cursor-pointer text-error hover:bg-error-soft outline-none transition-colors duration-fast"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out of StreamForge</span>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          ) : (
            <button
              type="button"
              onClick={() => onOpenAuth?.('login')}
              className="px-4 py-1.5 rounded-md bg-accent-500 hover:bg-accent-600 text-white font-semibold text-body-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
            >
              Sign In
            </button>
          )}
        </div>
      </nav>
    </header>
  )
}

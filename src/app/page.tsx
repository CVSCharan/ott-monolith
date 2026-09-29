'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar/Navbar'
import { Billboard } from '@/components/billboard/Billboard'
import { ContentRail } from '@/components/rails/ContentRail'
import { TitleDetailModal } from '@/components/modal/TitleDetailModal'
import { AuthModal } from '@/components/auth/AuthModal'
import { ProfileModal, type ProfileItem } from '@/components/auth/ProfileModal'
import { Footer } from '@/components/footer/Footer'
import {
  MOCK_TITLES,
  MOCK_RAILS,
  FEATURED_BILLBOARD,
  type MockTitle,
} from '@/lib/mock-data'

export default function HomePage() {
  const router = useRouter()
  const [selectedTitle, setSelectedTitle] = React.useState<MockTitle | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [isKidsMode, setIsKidsMode] = React.useState(false)

  // Auth & Profile state
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false)
  const [authMode, setAuthMode] = React.useState<'login' | 'signup'>('login')
  const [isProfileModalOpen, setIsProfileModalOpen] = React.useState(false)
  const [activeProfile, setActiveProfile] = React.useState<ProfileItem>({
    id: 'prof-adult-01',
    name: 'John Doe',
    isKids: false,
    avatarColor: 'bg-accent-600',
  })

  // Filter content when Kids Mode is enabled (U and U/A 7+ only)
  const visibleTitles = React.useMemo(() => {
    if (!isKidsMode) return MOCK_TITLES
    return MOCK_TITLES.filter((item) => item.isKids)
  }, [isKidsMode])

  const featuredBillboard = React.useMemo(() => {
    if (!isKidsMode) return FEATURED_BILLBOARD
    return visibleTitles[0] || FEATURED_BILLBOARD
  }, [isKidsMode, visibleTitles])

  const filteredRails = React.useMemo(() => {
    if (!isKidsMode) return MOCK_RAILS

    return [
      {
        id: 'rail-kids-favorites',
        title: 'Popular with Kids & Family',
        isTop10: false,
        items: visibleTitles,
      },
      {
        id: 'rail-kids-animated',
        title: 'Fun Animated Adventures',
        isTop10: false,
        items: [...visibleTitles].reverse(),
      },
    ]
  }, [isKidsMode, visibleTitles])

  const handleOpenMoreInfo = (title: MockTitle) => {
    setSelectedTitle(title)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handlePlayTitle = (title: MockTitle) => {
    router.push(`/watch/${title.slug}`)
  }

  const handleToggleKidsMode = () => {
    if (isKidsMode) {
      // Leaving Kids mode requires parental PIN verification via the profile modal
      setIsProfileModalOpen(true)
    } else {
      setIsKidsMode(true)
      setActiveProfile({
        id: 'prof-kids-02',
        name: 'Kids Profile',
        isKids: true,
        avatarColor: 'bg-maturity-u',
      })
    }
  }

  const handleProfileSelected = (profile: ProfileItem) => {
    setActiveProfile(profile)
    setIsKidsMode(profile.isKids)
  }

  return (
    <div className="min-h-screen bg-bg-base text-text-primary font-ui flex flex-col selection:bg-accent-500 selection:text-white">
      {/* ── Fixed Navigation Bar ── */}
      <Navbar
        isKidsMode={isKidsMode}
        onToggleKidsMode={handleToggleKidsMode}
        onOpenAuth={(mode) => {
          setAuthMode(mode)
          setIsAuthModalOpen(true)
        }}
        onOpenProfileSwitch={() => setIsProfileModalOpen(true)}
        activeProfileName={activeProfile.name}
        isAuthenticated={true}
      />

      <main className="flex-1">
        {/* ── Hero Billboard ── */}
        <Billboard
          title={featuredBillboard}
          onMoreInfo={handleOpenMoreInfo}
          onPlay={handlePlayTitle}
        />

        {/* ── Curated Content Rails ── */}
        <div className="relative z-10 -mt-12 sm:-mt-16 space-y-2 pb-12">
          {filteredRails.map((rail, index) => (
            <ContentRail
              key={rail.id}
              id={rail.id}
              title={rail.title}
              items={rail.items}
              isTop10={rail.isTop10}
              aspectRatio={index % 2 === 0 ? 'video' : 'poster'}
              onMoreInfo={handleOpenMoreInfo}
            />
          ))}
        </div>
      </main>

      {/* ── Interactive Title Quick-View Modal ── */}
      <TitleDetailModal
        title={selectedTitle}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSelectSimilarTitle={handleOpenMoreInfo}
      />

      {/* ── Authentication Dialog (Sign In / Sign Up) ── */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />

      {/* ── Profile Switcher & Parental PIN Verification Dialog ── */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentProfileId={activeProfile.id}
        isKidsMode={isKidsMode}
        onProfileSelected={handleProfileSelected}
      />

      {/* ── Platform Footer ── */}
      <Footer />
    </div>
  )
}

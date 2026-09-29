import * as React from 'react'
import Link from 'next/link'
import { Globe } from 'lucide-react'

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-bg-surface/50 text-text-muted font-ui text-caption py-12 px-page-gutter select-none">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top: Customer Care / Questions */}
        <p className="text-body-sm text-text-secondary">
          Questions? Contact StreamForge Support at{' '}
          <a
            href="mailto:support@streamforge.example.com"
            className="text-accent-400 hover:text-accent-300 underline underline-offset-4 transition-colors"
          >
            support@streamforge.example.com
          </a>
        </p>

        {/* Links Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          <ul className="space-y-2.5">
            <li>
              <Link href="/help" className="hover:text-text-primary transition-colors">
                Help Center
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-text-primary transition-colors">
                Terms of Use
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-text-primary transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/legal/dmca" className="hover:text-text-primary transition-colors">
                Content Takedown (DMCA)
              </Link>
            </li>
          </ul>

          <ul className="space-y-2.5">
            <li>
              <Link href="/account" className="hover:text-text-primary transition-colors">
                Manage Account
              </Link>
            </li>
            <li>
              <Link href="/devices" className="hover:text-text-primary transition-colors">
                Supported Devices
              </Link>
            </li>
            <li>
              <Link href="/plans" className="hover:text-text-primary transition-colors">
                Subscription Plans
              </Link>
            </li>
            <li>
              <Link href="/speedtest" className="hover:text-text-primary transition-colors">
                Speed Test
              </Link>
            </li>
          </ul>

          <ul className="space-y-2.5">
            <li>
              <Link href="/cookies" className="hover:text-text-primary transition-colors">
                Cookie Preferences
              </Link>
            </li>
            <li>
              <Link href="/corporate" className="hover:text-text-primary transition-colors">
                Corporate Information
              </Link>
            </li>
            <li>
              <Link href="/trust" className="hover:text-text-primary transition-colors">
                Security & Trust Center
              </Link>
            </li>
            <li>
              <Link href="/status" className="hover:text-text-primary transition-colors">
                Service Status
              </Link>
            </li>
          </ul>

          <ul className="space-y-2.5">
            <li>
              <Link href="/attribution" className="hover:text-text-primary transition-colors">
                Media Attribution (CC BY)
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-text-primary transition-colors">
                About StreamForge
              </Link>
            </li>
            <li>
              <Link href="/press" className="hover:text-text-primary transition-colors">
                Press & Media Kit
              </Link>
            </li>
            <li>
              <Link href="/investors" className="hover:text-text-primary transition-colors">
                Investor Relations
              </Link>
            </li>
          </ul>
        </div>

        {/* Language Selector */}
        <div className="pt-2">
          <div className="inline-flex items-center gap-2 border border-border px-3 py-1.5 rounded-sm bg-bg-surface text-text-primary text-caption font-medium">
            <Globe className="w-3.5 h-3.5 text-text-muted" aria-hidden="true" />
            <span>English (India)</span>
          </div>
        </div>

        {/* Media Attribution Statement */}
        <div className="pt-4 border-t border-border/40 text-[11px] leading-relaxed text-text-muted/80 space-y-1">
          <p>
            StreamForge sample titles (Big Buck Bunny, Tears of Steel, Sintel, Cosmos Laundromat,
            Spring, Elephants Dream) are open-source films provided under the Creative Commons
            Attribution 3.0 / 4.0 licenses by the Blender Foundation (peach.blender.org,
            mango.blender.org).
          </p>
          <p>© 2026 StreamForge Technologies Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

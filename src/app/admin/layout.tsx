import * as React from 'react'
import Link from 'next/link'
import {
  Film,
  Sliders,
  Cpu,
  BarChart3,
  ExternalLink,
  ShieldAlert,
  Home,
  FileCode,
  HeartPulse,
  Users as UsersIcon,
  Activity,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-bg-surface/90 border-r border-border flex flex-col justify-between shrink-0">
        <div>
          {/* Admin Header */}
          <div className="h-16 px-6 border-b border-border flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-accent-500 flex items-center justify-center font-display font-bold text-white text-caption">
                SF
              </div>
              <span className="font-display font-bold text-body-md tracking-wider">
                ADMIN<span className="text-accent-400">CONSOLE</span>
              </span>
            </Link>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-error-soft text-error border border-error/30 uppercase tracking-wider">
              RBAC
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-body-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-card transition-colors"
            >
              <BarChart3 className="w-4 h-4 text-accent-400" />
              <span>Overview</span>
            </Link>

            <Link
              href="/admin/content"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-body-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-card transition-colors"
            >
              <Film className="w-4 h-4 text-accent-400" />
              <span>Content Library</span>
            </Link>

            <Link
              href="/admin/rails"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-body-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-card transition-colors"
            >
              <Sliders className="w-4 h-4 text-accent-400" />
              <span>Rails Curation</span>
            </Link>

            <Link
              href="/admin/transcode"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-body-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-card transition-colors"
            >
              <Cpu className="w-4 h-4 text-accent-400" />
              <span>Transcode Queue</span>
            </Link>

            <Link
              href="/admin/analytics"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-body-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-card transition-colors"
            >
              <Activity className="w-4 h-4 text-accent-400" />
              <span>Streaming Analytics</span>
            </Link>

            <Link
              href="/admin/users"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-body-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-card transition-colors"
            >
              <UsersIcon className="w-4 h-4 text-accent-400" />
              <span>Subscribers</span>
            </Link>
          </nav>

          {/* Diagnostics Section */}
          <div className="px-4 py-2">
            <p className="px-3 text-[10px] font-bold tracking-wider text-text-muted uppercase mb-2">
              System Diagnostics
            </p>
            <div className="space-y-1">
              <Link
                href="/api/docs"
                target="_blank"
                className="flex items-center justify-between px-3 py-1.5 rounded-md text-caption text-text-secondary hover:text-text-primary hover:bg-bg-card transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FileCode className="w-3.5 h-3.5 text-accent-400" />
                  <span>OpenAPI / Swagger</span>
                </div>
                <ExternalLink className="w-3 h-3 text-text-muted" />
              </Link>
              <Link
                href="/api/health/ready"
                target="_blank"
                className="flex items-center justify-between px-3 py-1.5 rounded-md text-caption text-text-secondary hover:text-text-primary hover:bg-bg-card transition-colors"
              >
                <div className="flex items-center gap-2">
                  <HeartPulse className="w-3.5 h-3.5 text-success" />
                  <span>Readiness Probe</span>
                </div>
                <ExternalLink className="w-3 h-3 text-text-muted" />
              </Link>
            </div>
          </div>
        </div>

        {/* Footer / Exit */}
        <div className="p-4 border-t border-border">
          <div className="p-3 rounded-lg bg-bg-card border border-border/60 mb-3">
            <div className="flex items-center gap-2 text-caption text-text-secondary">
              <ShieldAlert className="w-4 h-4 text-accent-400" />
              <span>Audit Logging Active</span>
            </div>
          </div>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-md bg-white/5 hover:bg-white/10 text-text-secondary hover:text-text-primary text-caption font-semibold transition-colors border border-border"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to User App</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}

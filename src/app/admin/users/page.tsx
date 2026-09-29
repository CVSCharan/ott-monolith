import * as React from 'react'
import {
  Users as UsersIcon,
  Shield,
  Search,
  CheckCircle,
  AlertTriangle,
  Layers,
  Calendar,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'User & Subscription Management | Admin Console',
}

interface MockUser {
  id: string
  email: string
  role: 'admin' | 'user'
  plan: 'free' | 'standard' | 'premium'
  status: 'active' | 'suspended'
  profilesCount: number
  createdAt: string
  lastActive: string
}

const INITIAL_USERS: MockUser[] = [
  {
    id: 'usr-1',
    email: 'admin@streamforge.internal',
    role: 'admin',
    plan: 'premium',
    status: 'active',
    profilesCount: 3,
    createdAt: '2026-09-01',
    lastActive: 'Just now',
  },
  {
    id: 'usr-2',
    email: 'charlie.streaming@gmail.com',
    role: 'user',
    plan: 'standard',
    status: 'active',
    profilesCount: 2,
    createdAt: '2026-09-12',
    lastActive: '2 hours ago',
  },
  {
    id: 'usr-3',
    email: 'dev.tester@streamforge.internal',
    role: 'user',
    plan: 'premium',
    status: 'active',
    profilesCount: 4,
    createdAt: '2026-09-15',
    lastActive: 'Yesterday',
  },
  {
    id: 'usr-4',
    email: 'free.viewer@example.org',
    role: 'user',
    plan: 'free',
    status: 'active',
    profilesCount: 1,
    createdAt: '2026-09-20',
    lastActive: '3 days ago',
  },
  {
    id: 'usr-5',
    email: 'flagged.account@suspicious.net',
    role: 'user',
    plan: 'free',
    status: 'suspended',
    profilesCount: 1,
    createdAt: '2026-09-25',
    lastActive: '5 days ago',
  },
]

export default function AdminUsersPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-accent-400" />
            <h1 className="text-heading-1 font-display font-bold text-text-primary tracking-tight">
              User & Access Control
            </h1>
          </div>
          <p className="text-body-sm text-text-secondary mt-1">
            Manage subscriber accounts, assign subscription tiers, and control account security status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-card border border-border text-body-sm">
            <span className="text-text-muted">Total Accounts:</span>
            <span className="font-bold text-text-primary">1,428</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-bg-surface/80 border border-border">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search accounts by email..."
            className="w-full pl-9 pr-4 py-2 bg-bg-card border border-border rounded-lg text-body-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select className="px-3 py-2 bg-bg-card border border-border rounded-lg text-body-sm text-text-secondary focus:outline-none focus:border-accent-500">
            <option value="all">All Plans</option>
            <option value="premium">Premium (₹249/mo)</option>
            <option value="standard">Standard (₹149/mo)</option>
            <option value="free">Free Tier</option>
          </select>

          <select className="px-3 py-2 bg-bg-card border border-border rounded-lg text-body-sm text-text-secondary focus:outline-none focus:border-accent-500">
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-bg-surface/60">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-bg-card/50 text-caption font-semibold uppercase tracking-wider text-text-muted">
              <th className="p-4">Account Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Active Plan</th>
              <th className="p-4">Profiles</th>
              <th className="p-4">Status</th>
              <th className="p-4">Last Activity</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-body-sm">
            {INITIAL_USERS.map((user) => (
              <tr key={user.id} className="hover:bg-bg-card/40 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-accent-500/20 text-accent-400 font-bold flex items-center justify-center text-caption shrink-0">
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-medium text-text-primary block">{user.email}</span>
                      <span className="text-[11px] text-text-muted flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Joined {user.createdAt}
                      </span>
                    </div>
                  </div>
                </td>

                <td className="p-4">
                  {user.role === 'admin' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-caption font-semibold bg-accent-500/20 text-accent-400 border border-accent-500/30">
                      <Shield className="w-3 h-3" /> Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-caption font-medium bg-white/5 text-text-secondary border border-border">
                      User
                    </span>
                  )}
                </td>

                <td className="p-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-caption font-bold uppercase tracking-wider ${
                      user.plan === 'premium'
                        ? 'bg-accent-500/20 text-accent-400 border border-accent-500/30'
                        : user.plan === 'standard'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-white/10 text-text-secondary border border-border'
                    }`}
                  >
                    <Layers className="w-3 h-3" />
                    {user.plan}
                  </span>
                </td>

                <td className="p-4 font-mono text-text-secondary">
                  {user.profilesCount} / 5
                </td>

                <td className="p-4">
                  {user.status === 'active' ? (
                    <span className="inline-flex items-center gap-1 text-caption text-success font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-caption text-error font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5" /> Suspended
                    </span>
                  )}
                </td>

                <td className="p-4 text-text-muted text-caption">
                  {user.lastActive}
                </td>

                <td className="p-4 text-right">
                  <div className="inline-flex items-center gap-2">
                    <button
                      type="button"
                      className="px-2.5 py-1 rounded bg-bg-card hover:bg-bg-surface border border-border text-caption font-semibold text-text-secondary hover:text-text-primary transition-colors"
                    >
                      Change Plan
                    </button>
                    {user.status === 'active' ? (
                      <button
                        type="button"
                        className="px-2.5 py-1 rounded bg-error-soft/30 hover:bg-error-soft/60 border border-error/30 text-caption font-semibold text-error transition-colors"
                      >
                        Suspend
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="px-2.5 py-1 rounded bg-success-soft/30 hover:bg-success-soft/60 border border-success/30 text-caption font-semibold text-success transition-colors"
                      >
                        Reactivate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

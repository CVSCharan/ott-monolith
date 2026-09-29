import Link from 'next/link'
import Image from 'next/image'
import { getAdminTitlesList } from '@/modules/content'
import {
  Film,
  Plus,
  Tv,
  CheckCircle2,
  Clock,
  Archive,
  ExternalLink,
  Shield,
  Layers,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Content Management | StreamForge Admin',
}

export default async function AdminContentPage() {
  const titles = await getAdminTitlesList()

  const tierLabels: Record<number, { label: string; color: string }> = {
    0: { label: 'FREE', color: 'text-text-muted bg-white/5 border-border' },
    1: { label: 'STANDARD', color: 'text-accent-400 bg-accent-500/10 border-accent-500/30' },
    2: { label: 'PREMIUM', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-caption font-semibold text-accent-400 mb-1 uppercase tracking-wider">
            <Film className="w-4 h-4" />
            <span>Catalog CMS</span>
          </div>
          <h1 className="text-heading-1 font-display font-bold text-text-primary tracking-tight">
            Content Library & Metadata
          </h1>
          <p className="text-body-sm text-text-secondary mt-1">
            Browse, manage, and inspect all {titles.length} movies and episodic titles across all
            tiers.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-accent-500 hover:bg-accent-600 text-white font-semibold text-body-sm transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Title</span>
        </button>
      </div>

      {/* Content Table */}
      <div className="bg-bg-surface/80 border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-bg-card/60 text-caption font-bold text-text-secondary uppercase tracking-wider">
                <th className="py-3.5 px-4">Title</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Maturity</th>
                <th className="py-3.5 px-4">Min Tier</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Plays</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-body-sm">
              {titles.map((title) => {
                const tier = tierLabels[title.minTierRank] || tierLabels[0]

                return (
                  <tr key={title.id} className="hover:bg-bg-card/40 transition-colors">
                    {/* Title + Poster */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-16 rounded bg-bg-card border border-border/80 overflow-hidden relative shrink-0">
                          {title.posterUrl || title.thumbnailUrl ? (
                            <Image
                              src={title.posterUrl || title.thumbnailUrl || ''}
                              alt={title.title}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-text-muted">
                              <Film className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-text-primary hover:text-accent-300 transition-colors">
                            {title.title}
                          </p>
                          <div className="flex items-center gap-2 text-caption text-text-muted mt-0.5">
                            <span>{title.releaseYear || '2024'}</span>
                            <span>•</span>
                            <span>{title.genresList.slice(0, 2).join(', ') || 'General'}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-caption font-medium bg-bg-card border border-border text-text-secondary uppercase">
                        {title.type === 'series' ? (
                          <Tv className="w-3 h-3 text-accent-400" />
                        ) : (
                          <Film className="w-3 h-3 text-text-muted" />
                        )}
                        <span>{title.type}</span>
                      </div>
                    </td>

                    {/* Maturity Rating */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-caption font-semibold bg-bg-card border border-border text-text-primary">
                        <Shield className="w-3 h-3 text-text-muted" />
                        <span>{title.maturityRating}</span>
                      </span>
                    </td>

                    {/* Min Tier */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-caption font-bold border ${tier.color}`}
                      >
                        <Layers className="w-3 h-3" />
                        <span>{tier.label}</span>
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {title.status === 'published' ? (
                        <span className="inline-flex items-center gap-1 text-caption font-semibold text-success">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Published</span>
                        </span>
                      ) : title.status === 'scheduled' ? (
                        <span className="inline-flex items-center gap-1 text-caption font-semibold text-accent-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Scheduled</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-caption font-semibold text-text-muted">
                          <Archive className="w-3.5 h-3.5" />
                          <span>{title.status}</span>
                        </span>
                      )}
                    </td>

                    {/* Play Count */}
                    <td className="py-3.5 px-4 text-center font-mono text-caption text-text-secondary">
                      {title.playCount.toLocaleString()}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          href={`/watch/${title.slug}`}
                          target="_blank"
                          className="p-1.5 rounded hover:bg-bg-surface text-text-secondary hover:text-text-primary transition-colors"
                          title="Preview in Player"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

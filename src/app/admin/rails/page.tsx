import { Sliders, GripVertical, CheckCircle, Eye, Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Rails Curation | StreamForge Admin',
}

export default function AdminRailsPage() {
  const rails = [
    {
      id: 'rail-top-10',
      title: 'Top 10 in India Today',
      slug: 'top-10',
      type: 'dynamic',
      itemCount: 10,
      active: true,
      position: 1,
      badge: 'Automated Play Count',
    },
    {
      id: 'rail-trending-now',
      title: 'Trending Now',
      slug: 'trending-now',
      type: 'curated',
      itemCount: 12,
      active: true,
      position: 2,
      badge: 'Manual Curation',
    },
    {
      id: 'rail-action-blockbusters',
      title: 'Action & Adventure',
      slug: 'action-adventure',
      type: 'genre',
      itemCount: 15,
      active: true,
      position: 3,
      badge: 'Genre Auto-Populated',
    },
    {
      id: 'rail-award-winners',
      title: 'Award-Winning Cinema',
      slug: 'award-winning',
      type: 'curated',
      itemCount: 8,
      active: true,
      position: 4,
      badge: 'Editorial Pick',
    },
    {
      id: 'rail-sci-fi-fantasy',
      title: 'Sci-Fi & Cosmic Worlds',
      slug: 'sci-fi-fantasy',
      type: 'genre',
      itemCount: 10,
      active: true,
      position: 5,
      badge: 'Genre Auto-Populated',
    },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-caption font-semibold text-accent-400 mb-1 uppercase tracking-wider">
            <Sliders className="w-4 h-4" />
            <span>Merchandising</span>
          </div>
          <h1 className="text-heading-1 font-display font-bold text-text-primary tracking-tight">
            Homepage Rails & Merchandising
          </h1>
          <p className="text-body-sm text-text-secondary mt-1">
            Configure order, add custom curated collections, and manage automated discovery rows.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-accent-500 hover:bg-accent-600 text-white font-semibold text-body-sm transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Rail</span>
        </button>
      </div>

      {/* Rails Reorderable List */}
      <div className="space-y-3">
        {rails.map((rail) => (
          <div
            key={rail.id}
            className="flex items-center justify-between p-4 rounded-xl bg-bg-surface/80 border border-border hover:border-border/80 transition-colors"
          >
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="text-text-muted hover:text-text-primary cursor-grab active:cursor-grabbing p-1"
                title="Drag to reorder"
                aria-label={`Reorder ${rail.title}`}
              >
                <GripVertical className="w-5 h-5" />
              </button>

              <div className="w-8 h-8 rounded-md bg-bg-card border border-border flex items-center justify-center font-bold text-caption text-text-secondary">
                #{rail.position}
              </div>

              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="font-semibold text-text-primary text-body-md">
                    {rail.title}
                  </h3>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-300">
                    {rail.badge}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-caption text-text-muted mt-1">
                  <span>Slug: {rail.slug}</span>
                  <span>•</span>
                  <span>{rail.itemCount} Titles</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 text-caption font-semibold text-success bg-success-soft px-2.5 py-1 rounded-md">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Active</span>
              </span>

              <button
                type="button"
                className="p-2 rounded-md hover:bg-bg-card text-text-secondary hover:text-text-primary transition-colors border border-border/50 text-caption font-medium flex items-center gap-1.5"
              >
                <Eye className="w-4 h-4" />
                <span>Edit Items</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

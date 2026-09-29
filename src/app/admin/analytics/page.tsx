import * as React from 'react'
import {
  BarChart3,
  TrendingUp,
  Play,
  Clock,
  Activity,
  HardDrive,
  Film,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Streaming & QoE Analytics | Admin Console',
}

interface TopTitleMetric {
  title: string
  views: number
  completionRate: number
  avgWatchMinutes: number
  bufferRatio: number
}

const TOP_TITLES: TopTitleMetric[] = [
  {
    title: 'Tears of Steel',
    views: 45210,
    completionRate: 84.5,
    avgWatchMinutes: 11.2,
    bufferRatio: 0.42,
  },
  {
    title: 'Big Buck Bunny',
    views: 38940,
    completionRate: 91.2,
    avgWatchMinutes: 9.8,
    bufferRatio: 0.31,
  },
  {
    title: 'Sintel',
    views: 29810,
    completionRate: 78.4,
    avgWatchMinutes: 14.5,
    bufferRatio: 0.55,
  },
  {
    title: 'Elephants Dream',
    views: 18450,
    completionRate: 72.1,
    avgWatchMinutes: 10.1,
    bufferRatio: 0.62,
  },
]

export default function AdminAnalyticsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-accent-400" />
            <h1 className="text-heading-1 font-display font-bold text-text-primary tracking-tight">
              Streaming & QoE Analytics
            </h1>
          </div>
          <p className="text-body-sm text-text-secondary mt-1">
            Aggregated playback telemetry, subscriber engagement, and video delivery quality metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select className="px-3 py-1.5 bg-bg-card border border-border rounded-lg text-body-sm text-text-secondary focus:outline-none focus:border-accent-500">
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-xl bg-bg-surface/80 border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-secondary mb-3">
            <span className="text-caption font-semibold uppercase tracking-wider">Total Plays (7d)</span>
            <Play className="w-4 h-4 text-accent-400" />
          </div>
          <div>
            <span className="text-display-md font-bold text-text-primary">132.4K</span>
            <p className="text-caption text-success font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +14.2% vs last week
            </p>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-bg-surface/80 border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-secondary mb-3">
            <span className="text-caption font-semibold uppercase tracking-wider">Avg Completion Rate</span>
            <Activity className="w-4 h-4 text-accent-400" />
          </div>
          <div>
            <span className="text-display-md font-bold text-text-primary">82.3%</span>
            <p className="text-caption text-text-muted mt-1">Exceeds 75% target budget</p>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-bg-surface/80 border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-secondary mb-3">
            <span className="text-caption font-semibold uppercase tracking-wider">Buffering Ratio</span>
            <Clock className="w-4 h-4 text-accent-400" />
          </div>
          <div>
            <span className="text-display-md font-bold text-success">0.45%</span>
            <p className="text-caption text-text-muted mt-1">Strict SLA: &lt; 1.0% healthy</p>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-bg-surface/80 border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-secondary mb-3">
            <span className="text-caption font-semibold uppercase tracking-wider">Bandwidth Delivered</span>
            <HardDrive className="w-4 h-4 text-accent-400" />
          </div>
          <div>
            <span className="text-display-md font-bold text-text-primary">4.82 TB</span>
            <p className="text-caption text-text-muted mt-1">Zero egress fee via Cloudflare R2</p>
          </div>
        </div>
      </div>

      {/* Plays Volume Trend (Pure SVG Area/Bar Histogram) */}
      <div className="p-6 rounded-xl bg-bg-surface/80 border border-border space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-heading-3 text-text-primary">
            Daily Streaming Sessions
          </h2>
          <span className="text-caption text-text-muted">Aggregated hourly via pg-boss</span>
        </div>

        {/* Visual histogram bars */}
        <div className="h-48 w-full flex items-end justify-between gap-2 pt-6 pb-2 border-b border-border/60">
          {[
            { day: 'Wed', count: 14200, height: '65%' },
            { day: 'Thu', count: 15800, height: '72%' },
            { day: 'Fri', count: 19400, height: '88%' },
            { day: 'Sat', count: 22100, height: '100%' },
            { day: 'Sun', count: 21300, height: '96%' },
            { day: 'Mon', count: 16100, height: '74%' },
            { day: 'Tue', count: 18200, height: '82%' },
          ].map((bar) => (
            <div key={bar.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
              <span className="text-[11px] font-mono text-accent-400 opacity-0 group-hover:opacity-100 transition-opacity">
                {Math.round(bar.count / 1000)}k
              </span>
              <div
                className="w-full max-w-[48px] rounded-t-md bg-accent-500/80 group-hover:bg-accent-500 transition-all cursor-pointer"
                style={{ height: bar.height }}
              ></div>
              <span className="text-caption text-text-muted mt-1">{bar.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Titles Table */}
      <div className="rounded-xl border border-border bg-bg-surface/60 overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-accent-400" />
            <h2 className="font-display font-bold text-heading-3 text-text-primary">
              Top Streamed Content
            </h2>
          </div>
          <span className="text-caption text-text-muted font-mono">Ranked by session starts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-bg-card/50 text-caption font-semibold uppercase tracking-wider text-text-muted">
                <th className="p-4">Title</th>
                <th className="p-4">Play Sessions</th>
                <th className="p-4">Avg Watch Time</th>
                <th className="p-4">Completion</th>
                <th className="p-4 text-right">Buffer Ratio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-body-sm">
              {TOP_TITLES.map((t) => (
                <tr key={t.title} className="hover:bg-bg-card/40 transition-colors">
                  <td className="p-4 font-semibold text-text-primary">{t.title}</td>
                  <td className="p-4 font-mono text-text-secondary">{t.views.toLocaleString()}</td>
                  <td className="p-4 text-text-secondary">{t.avgWatchMinutes} mins</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-accent-500"
                          style={{ width: `${t.completionRate}%` }}
                        ></div>
                      </div>
                      <span className="font-mono text-caption text-text-muted">{t.completionRate}%</span>
                    </div>
                  </td>
                  <td className="p-4 text-right font-mono text-success text-caption">
                    {t.bufferRatio}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

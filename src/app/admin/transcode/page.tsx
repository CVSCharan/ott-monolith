import {
  Cpu,
  HardDrive,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  FileVideo,
  Activity,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Transcode Queue | StreamForge Admin',
}

export default function AdminTranscodePage() {
  const jobs = [
    {
      id: 'job-101',
      title: 'Tears of Steel (Master)',
      assetId: 'asset-7243-9821',
      source: 'tears_of_steel_1080p.mp4 (4.2 GB)',
      ladder: ['360p', '480p', '720p', '1080p'],
      status: 'ready',
      progress: 100,
      workerHost: 'worker-node-01',
      duration: '12m 14s',
      completedAt: 'Just now',
    },
    {
      id: 'job-102',
      title: 'Big Buck Bunny (Full)',
      assetId: 'asset-4821-1192',
      source: 'bbb_sunflower_1080p_60fps.mp4 (2.1 GB)',
      ladder: ['360p', '480p', '720p', '1080p'],
      status: 'ready',
      progress: 100,
      workerHost: 'worker-node-01',
      duration: '9m 40s',
      completedAt: '1 hour ago',
    },
    {
      id: 'job-103',
      title: 'Sintel (Cinema Cut)',
      assetId: 'asset-3918-5521',
      source: 'sintel_trailer_1080p.mp4 (1.4 GB)',
      ladder: ['360p', '480p', '720p', '1080p'],
      status: 'ready',
      progress: 100,
      workerHost: 'worker-node-01',
      duration: '4m 12s',
      completedAt: '3 hours ago',
    },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-caption font-semibold text-accent-400 mb-1 uppercase tracking-wider">
            <Cpu className="w-4 h-4" />
            <span>FFmpeg Pipeline</span>
          </div>
          <h1 className="text-heading-1 font-display font-bold text-text-primary tracking-tight">
            Transcoding Worker & Delivery Pipeline
          </h1>
          <p className="text-body-sm text-text-secondary mt-1">
            Real-time status of multi-bitrate HLS encoding jobs, Docker worker health, and S3 delivery storage.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-bg-surface hover:bg-bg-card border border-border text-text-primary font-semibold text-body-sm transition-colors shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Worker Specs & Health Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-xl bg-bg-surface/80 border border-border flex items-start gap-3.5">
          <div className="p-2.5 rounded-lg bg-success-soft border border-success/30 text-success shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary text-body-sm">Worker Node Health</h3>
            <p className="text-caption text-text-muted mt-0.5">
              Heartbeat active (30s interval). Zero unhandled jobs in queue.
            </p>
            <span className="inline-block mt-2 text-caption font-bold text-success uppercase tracking-wider">
              ONLINE · 0 ERRORS
            </span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-bg-surface/80 border border-border flex items-start gap-3.5">
          <div className="p-2.5 rounded-lg bg-accent-500/10 border border-accent-500/20 text-accent-400 shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary text-body-sm">Host Scratch Volume</h3>
            <p className="text-caption text-text-muted mt-0.5">
              /var/lib/streamforge/scratch (50 GB bounded volume).
            </p>
            <span className="inline-block mt-2 text-caption font-bold text-text-secondary uppercase tracking-wider">
              RAM OOM DEFENCE: ACTIVE
            </span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-bg-surface/80 border border-border flex items-start gap-3.5">
          <div className="p-2.5 rounded-lg bg-white/5 border border-border text-text-primary shrink-0">
            <ShieldCheck className="w-5 h-5 text-accent-400" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary text-body-sm">Worker Sandboxing</h3>
            <p className="text-caption text-text-muted mt-0.5">
              Non-root USER worker · cap_drop ALL · Allowlisted egress only.
            </p>
            <span className="inline-block mt-2 text-caption font-bold text-accent-400 uppercase tracking-wider">
              HARDENED CONTAINER
            </span>
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-bg-surface/80 border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-border bg-bg-card/40 flex items-center justify-between">
          <h2 className="font-semibold text-text-primary text-body-md">
            Recent Transcode Tasks
          </h2>
          <span className="text-caption text-text-muted">
            All variants encoded with aligned keyframes
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-bg-card/60 text-caption font-bold text-text-secondary uppercase tracking-wider">
                <th className="py-3 px-4">Title & Asset ID</th>
                <th className="py-3 px-4">Source Input</th>
                <th className="py-3 px-4">Ladder Renditions</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Duration</th>
                <th className="py-3 px-4 text-right">Completed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-body-sm">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-bg-card/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <FileVideo className="w-4 h-4 text-accent-400 shrink-0" />
                      <div>
                        <p className="font-semibold text-text-primary">{job.title}</p>
                        <p className="font-mono text-caption text-text-muted">{job.assetId}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-caption text-text-secondary">
                    {job.source}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {job.ladder.map((res) => (
                        <span
                          key={res}
                          className="px-2 py-0.5 rounded text-[11px] font-semibold bg-bg-card border border-border text-text-primary font-mono"
                        >
                          {res}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 text-caption font-semibold text-success bg-success-soft px-2.5 py-1 rounded-md">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Ready ({job.progress}%)</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono text-caption text-text-secondary">
                    {job.duration}
                  </td>

                  <td className="py-3.5 px-4 text-right text-caption text-text-muted">
                    {job.completedAt}
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

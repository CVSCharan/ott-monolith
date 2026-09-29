import { checkDatabaseHealth } from './dal'
import { getRedisClient } from '@/lib/redis'

export interface HealthCheckResult {
  status: 'ok' | 'degraded' | 'down'
  timestamp: string
  services: {
    database: boolean
    redis: boolean
    worker: boolean
  }
}

export async function getReadinessStatus(): Promise<HealthCheckResult> {
  const [dbHealthy, redisStatus] = await Promise.all([
    checkDatabaseHealth(),
    (async () => {
      const redis = getRedisClient()
      if (!redis) return { connected: false, workerAlive: false }
      try {
        const [ping, heartbeat] = await Promise.all([
          redis.ping(),
          redis.get('worker:heartbeat:transcode'),
        ])
        return {
          connected: ping === 'PONG',
          workerAlive: Boolean(heartbeat),
        }
      } catch {
        return { connected: false, workerAlive: false }
      }
    })(),
  ])

  const redisHealthy = redisStatus.connected
  const workerHealthy = redisStatus.workerAlive
  const allHealthy = dbHealthy && redisHealthy
  const status = allHealthy ? 'ok' : dbHealthy ? 'degraded' : 'down'

  return {
    status,
    timestamp: new Date().toISOString(),
    services: {
      database: dbHealthy,
      redis: redisHealthy,
      worker: workerHealthy,
    },
  }
}

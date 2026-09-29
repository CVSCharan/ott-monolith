import { checkDatabaseHealth } from './dal'
import { getRedisClient } from '@/lib/redis'

export interface HealthCheckResult {
  status: 'ok' | 'degraded' | 'down'
  timestamp: string
  services: {
    database: boolean
    redis: boolean
  }
}

export async function getReadinessStatus(): Promise<HealthCheckResult> {
  const [dbHealthy, redisHealthy] = await Promise.all([
    checkDatabaseHealth(),
    (async () => {
      const redis = getRedisClient()
      if (!redis) return false
      try {
        const ping = await redis.ping()
        return ping === 'PONG'
      } catch {
        return false
      }
    })(),
  ])

  const allHealthy = dbHealthy && redisHealthy
  const status = allHealthy ? 'ok' : dbHealthy ? 'degraded' : 'down'

  return {
    status,
    timestamp: new Date().toISOString(),
    services: {
      database: dbHealthy,
      redis: redisHealthy,
    },
  }
}

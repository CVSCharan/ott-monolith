import Redis from 'ioredis'
import { env } from '@/lib/env'

let redisClient: Redis | null = null

export function getRedisClient(): Redis | null {
  if (typeof window !== 'undefined') return null

  if (!redisClient) {
    try {
      redisClient = new Redis(env.REDIS_URL, {
        maxRetriesPerRequest: 1,
        connectTimeout: 2000,
        lazyConnect: false,
        retryStrategy(times) {
          if (times > 3) return null // Stop retrying after 3 failures
          return Math.min(times * 100, 1000)
        },
      })

      redisClient.on('error', (err) => {
        // Log warning without crashing the process
        console.warn('[Redis] Connection warning:', err.message)
      })
    } catch {
      console.warn('[Redis] Failed to initialize client')
    }
  }

  return redisClient
}

export const redis = {
  async get(key: string): Promise<string | null> {
    const client = getRedisClient()
    return client ? client.get(key) : null
  },
  async setex(key: string, seconds: number, value: string): Promise<string | null> {
    const client = getRedisClient()
    return client ? client.setex(key, seconds, value) : null
  },
  async del(key: string): Promise<number> {
    const client = getRedisClient()
    return client ? client.del(key) : 0
  },
}

export interface RateLimitOptions {
  key: string
  limit: number
  windowSeconds: number
  failClosed?: boolean // If true and Redis is unreachable, reject the request (for auth endpoints)
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetSeconds: number
}

/**
 * Token-bucket / sliding-window rate limiter via Redis atomic INCR + EXPIRE.
 */
export async function checkRateLimit({
  key,
  limit,
  windowSeconds,
  failClosed = false,
}: RateLimitOptions): Promise<RateLimitResult> {
  const redis = getRedisClient()

  if (!redis) {
    return {
      allowed: !failClosed,
      remaining: failClosed ? 0 : limit,
      resetSeconds: windowSeconds,
    }
  }

  try {
    const redisKey = `ratelimit:${key}`
    const current = await redis.incr(redisKey)

    if (current === 1) {
      await redis.expire(redisKey, windowSeconds)
    }

    const ttl = await redis.ttl(redisKey)
    const resetSeconds = ttl > 0 ? ttl : windowSeconds
    const allowed = current <= limit
    const remaining = Math.max(0, limit - current)

    return { allowed, remaining, resetSeconds }
  } catch (err) {
    console.warn('[Redis] Rate limit execution failed:', (err as Error).message)
    return {
      allowed: !failClosed,
      remaining: failClosed ? 0 : limit,
      resetSeconds: windowSeconds,
    }
  }
}

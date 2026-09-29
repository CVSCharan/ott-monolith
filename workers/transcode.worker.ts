import 'dotenv/config'
import { getRedisClient } from '../src/lib/redis'
import { logger } from '../src/lib/logger'

const HEARTBEAT_KEY = 'worker:heartbeat:transcode'
const HEARTBEAT_INTERVAL_MS = 30000
const HEARTBEAT_TTL_SECONDS = 90

let isRunning = true

async function emitHeartbeat(): Promise<void> {
  const redis = getRedisClient()
  if (!redis) {
    logger.warn('Worker could not connect to Redis for heartbeat')
    return
  }

  try {
    const payload = JSON.stringify({
      workerId: process.env.WORKER_ID || `worker-${process.pid}`,
      timestamp: new Date().toISOString(),
      status: 'idle',
      uptimeSeconds: Math.round(process.uptime()),
    })

    await redis.setex(HEARTBEAT_KEY, HEARTBEAT_TTL_SECONDS, payload)
    logger.debug({ workerId: process.pid }, 'Worker heartbeat emitted')
  } catch (err) {
    logger.warn({ err }, 'Worker heartbeat update failed')
  }
}

async function startWorker(): Promise<void> {
  logger.info({ pid: process.pid }, 'Starting StreamForge Transcode Worker daemon...')

  // Emit immediate heartbeat
  await emitHeartbeat()

  // Heartbeat timer
  const heartbeatTimer = setInterval(() => {
    if (isRunning) {
      void emitHeartbeat()
    }
  }, HEARTBEAT_INTERVAL_MS)

  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Worker received shutdown signal, draining...')
    isRunning = false
    clearInterval(heartbeatTimer)

    const redis = getRedisClient()
    if (redis) {
      try {
        await redis.del(HEARTBEAT_KEY)
      } catch {
        // Ignore during shutdown
      }
      redis.disconnect()
    }

    logger.info('Worker exited cleanly')
    process.exit(0)
  }

  process.on('SIGTERM', () => void shutdown('SIGTERM'))
  process.on('SIGINT', () => void shutdown('SIGINT'))
}

void startWorker()

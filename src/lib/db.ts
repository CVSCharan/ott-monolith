import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

/**
 * Global Prisma Client singleton configured with Prisma 7 driver adapter.
 *
 * RESTRICTION (Enforced by ESLint and AGENTS.md):
 * Only `*.dal.ts` files within `src/modules/*` are permitted to import from this file.
 * All queries must pass through module DALs.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: pg.Pool | undefined
}

const connectionString = process.env.DATABASE_URL || ''
const pool =
  globalForPrisma.pool ??
  new pg.Pool({
    connectionString,
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.pool = pool

const adapter = new PrismaPg(pool)

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

export type { PrismaClient }

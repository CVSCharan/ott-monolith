import { PrismaClient } from '@prisma/client'

/**
 * Global Prisma Client singleton.
 *
 * RESTRICTION (Enforced by ESLint and AGENTS.md):
 * Only `*.dal.ts` files within `src/modules/*` are permitted to import from this file.
 * All queries must pass through module DALs.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['warn', 'error']
        : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

export type { PrismaClient }

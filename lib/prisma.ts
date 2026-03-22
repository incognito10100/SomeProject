import { PrismaClient } from '@prisma/client'

// This pattern prevents creating too many database connections
// during development when the server hot-reloads frequently
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
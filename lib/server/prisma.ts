import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function parseMysqlUrl(url: string) {
  // mysql://user:password@host:port/database
  const u = new URL(url)
  return {
    host: u.hostname,
    port: u.port ? parseInt(u.port) : 3306,
    user: u.username,
    password: u.password,
    database: u.pathname.replace(/^\//, ''),
    connectionLimit: 5,
  }
}

function createPrismaClient() {
  const adapter = new PrismaMariaDb(parseMysqlUrl(process.env.DATABASE_URL!))
  return new PrismaClient({
    adapter,
    log: ['query', 'error', 'warn'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

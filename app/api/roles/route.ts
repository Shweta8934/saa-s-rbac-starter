import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/server/prisma'
import { logAudit } from '@/lib/server/audit'

const createSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(1),
  organizationId: z.string().nullable(),
  isSystem: z.boolean().default(false),
  permissions: z.array(z.string()).default([]),
  color: z.string().optional(),
  actorUserId: z.string().optional(),
})

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const organizationId = searchParams.get('organizationId')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')

  const search = searchParams.get('search') || ''

  const skip = (page - 1) * limit
  let where: any = organizationId
    ? { OR: [{ organizationId }, { isSystem: true }, { organizationId: null }] }
    : {}

  if (search) {
    const searchCondition = {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }
    if (where.OR) {
      where = { AND: [where, searchCondition] }
    } else {
      where = searchCondition
    }
  }

  const [roles, totalCount] = await Promise.all([
    prisma.role.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { users: true }
        }
      }
    }),
    prisma.role.count({ where })
  ])

  return NextResponse.json({ roles, totalCount, page, limit })
}

export async function POST(req: Request) {
  const json = await req.json()
  const payload = createSchema.parse(json)

  const created = await prisma.role.create({
    data: {
      name: payload.name,
      slug: payload.slug,
      description: payload.description,
      organizationId: payload.organizationId,
      isSystem: payload.isSystem,
      permissions: payload.permissions,
      color: payload.color,
    },
  })

  await logAudit({
    actorUserId: payload.actorUserId,
    entityType: 'role',
    entityId: created.id,
    action: 'create',
    after: created,
  })

  return NextResponse.json({ role: created }, { status: 201 })
}

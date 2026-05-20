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

  const roles = await prisma.role.findMany({
    where: organizationId
      ? { OR: [{ organizationId }, { isSystem: true }, { organizationId: null }] }
      : undefined,
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ roles })
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

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/server/prisma'
import { logAudit } from '@/lib/server/audit'

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6).default('password123'),
  status: z.enum(['active', 'suspended', 'pending']).default('active'),
  organizationId: z.string().nullable().optional(),
  roleId: z.string().nullable().optional(),
  avatar: z.string().optional(),
  actorUserId: z.string().optional(),
})

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const organizationId = searchParams.get('organizationId')
  const requesterUserId = searchParams.get('requesterUserId')

  if (organizationId && requesterUserId) {
    const requester = await prisma.user.findUnique({
      where: { id: requesterUserId },
      include: { role: true },
    })
    const isHr = requester?.role?.slug === 'hr'
    if (isHr) {
      if (requester.organizationId !== organizationId) {
        return NextResponse.json({ users: [] })
      }
      const users = await prisma.user.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
        include: {
          projectMemberships: {
            include: {
              project: {
                select: { id: true, name: true },
              },
            },
          },
        },
      })
      return NextResponse.json({ users })
    }
  }

  const users = await prisma.user.findMany({
    where: organizationId ? { organizationId } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      projectMemberships: {
        include: {
          project: {
            select: { id: true, name: true },
          },
        },
      },
    },
  })
  return NextResponse.json({ users })
}

export async function POST(req: Request) {
  const payload = createSchema.parse(await req.json())
  const { actorUserId, ...data } = payload

  const user = await prisma.user.create({ data })
  await logAudit({ actorUserId, entityType: 'user', entityId: user.id, action: 'create', after: user })

  return NextResponse.json({ user }, { status: 201 })
}

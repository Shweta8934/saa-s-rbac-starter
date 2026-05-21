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
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status')
  const roleId = searchParams.get('roleId')

  const skip = (page - 1) * limit

  let baseWhere: any = {}
  if (organizationId) baseWhere.organizationId = organizationId
  if (status && status !== 'all') baseWhere.status = status
  if (roleId && roleId !== 'all') baseWhere.roleId = roleId

  if (search) {
    baseWhere.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ]
  }

  if (organizationId && requesterUserId) {
    const requester = await prisma.user.findUnique({
      where: { id: requesterUserId },
      include: { role: true },
    })
    const isHr = requester?.role?.slug === 'hr'
    if (isHr) {
      if (requester.organizationId !== organizationId) {
        return NextResponse.json({ users: [], totalCount: 0 })
      }
    }
  }

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where: baseWhere,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        role: true,
        projectMemberships: {
          include: {
            project: {
              select: { id: true, name: true },
            },
          },
        },
      },
    }),
    prisma.user.count({ where: baseWhere })
  ])

  return NextResponse.json({ users, totalCount, page, limit })
}

export async function POST(req: Request) {
  const payload = createSchema.parse(await req.json())
  const { actorUserId, ...data } = payload

  const user = await prisma.user.create({ data })
  await logAudit({ actorUserId, entityType: 'user', entityId: user.id, action: 'create', after: user })

  return NextResponse.json({ user }, { status: 201 })
}

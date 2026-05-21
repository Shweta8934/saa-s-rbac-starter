import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/server/prisma'
import { logAudit } from '@/lib/server/audit'

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  email: z.string().email().optional(),
  industry: z.string().min(2).optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  description: z.string().optional(),
  logo: z.string().optional(),
  actorUserId: z.string().optional(),
})

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const organization = await prisma.organization.findUnique({
    where: { id },
    include: {
      _count: {
        select: { users: true, projects: true }
      },

      projects: {
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          _count: { select: { members: true } },
          members: {
            select: {
              role: true,
              user: {
                select: { id: true, name: true, email: true, avatar: true }
              }
            }
          }
        }
      }
    }
  })
  
  if (!organization) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ organization })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const before = await prisma.organization.findUnique({ where: { id } })
  if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const json = await req.json()
  const payload = updateSchema.parse(json)
  const { actorUserId, ...data } = payload

  const updated = await prisma.organization.update({ where: { id }, data })
  await logAudit({ actorUserId, entityType: 'organization', entityId: id, action: 'update', before, after: updated })

  return NextResponse.json({ organization: updated })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const actorUserId = new URL(req.url).searchParams.get('actorUserId') ?? undefined
  const before = await prisma.organization.findUnique({ where: { id } })
  if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.organization.delete({ where: { id } })
  await logAudit({ actorUserId, entityType: 'organization', entityId: id, action: 'delete', before })
  return NextResponse.json({ ok: true })
}

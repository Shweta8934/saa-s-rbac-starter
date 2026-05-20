import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/server/prisma'
import { logAudit } from '@/lib/server/audit'

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  status: z.enum(['active', 'suspended', 'pending']).optional(),
  roleId: z.string().nullable().optional(),
  organizationId: z.string().nullable().optional(),
  avatar: z.string().optional(),
  actorUserId: z.string().optional(),
})

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ user })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const before = await prisma.user.findUnique({ where: { id } })
  if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const payload = updateSchema.parse(await req.json())
  const { actorUserId, ...data } = payload
  const user = await prisma.user.update({ where: { id }, data })

  await logAudit({ actorUserId, entityType: 'user', entityId: id, action: 'update', before, after: user })
  return NextResponse.json({ user })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const actorUserId = new URL(req.url).searchParams.get('actorUserId') ?? undefined
  const before = await prisma.user.findUnique({ where: { id } })
  if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.user.delete({ where: { id } })
  await logAudit({ actorUserId, entityType: 'user', entityId: id, action: 'delete', before })
  return NextResponse.json({ ok: true })
}

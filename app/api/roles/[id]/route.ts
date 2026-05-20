import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/server/prisma'
import { logAudit } from '@/lib/server/audit'

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  description: z.string().min(1).optional(),
  permissions: z.array(z.string()).optional(),
  color: z.string().optional(),
  actorUserId: z.string().optional(),
})

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const role = await prisma.role.findUnique({ where: { id } })
  if (!role) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ role })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const before = await prisma.role.findUnique({ where: { id } })
  if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const json = await req.json()
  const payload = updateSchema.parse(json)
  const { actorUserId, ...data } = payload

  const updated = await prisma.role.update({ where: { id }, data })
  await logAudit({ actorUserId, entityType: 'role', entityId: id, action: 'update', before, after: updated })

  return NextResponse.json({ role: updated })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const actorUserId = new URL(req.url).searchParams.get('actorUserId') ?? undefined
  const before = await prisma.role.findUnique({ where: { id } })
  if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.role.delete({ where: { id } })
  await logAudit({ actorUserId, entityType: 'role', entityId: id, action: 'delete', before })
  return NextResponse.json({ ok: true })
}

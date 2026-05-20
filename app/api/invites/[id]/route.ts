import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/server/prisma'
import { logAudit } from '@/lib/server/audit'

const updateSchema = z.object({
  status: z.enum(['pending', 'accepted', 'expired', 'cancelled']).optional(),
  acceptedAt: z.string().datetime().optional(),
  actorUserId: z.string().optional(),
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const before = await prisma.invite.findUnique({ where: { id } })
  if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const payload = updateSchema.parse(await req.json())
  const { actorUserId, acceptedAt, ...rest } = payload
  const invite = await prisma.invite.update({
    where: { id },
    data: {
      ...rest,
      acceptedAt: acceptedAt ? new Date(acceptedAt) : undefined,
    },
  })

  await logAudit({ actorUserId, entityType: 'invite', entityId: id, action: 'update', before, after: invite })
  return NextResponse.json({ invite })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const actorUserId = new URL(req.url).searchParams.get('actorUserId') ?? undefined
  const before = await prisma.invite.findUnique({ where: { id } })
  if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.invite.delete({ where: { id } })
  await logAudit({ actorUserId, entityType: 'invite', entityId: id, action: 'delete', before })
  return NextResponse.json({ ok: true })
}

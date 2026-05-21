import { NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/server/prisma'

const schema = z.object({
  token: z.string().min(10),
  name: z.string().min(2),
  password: z.string().min(6),
})

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const parseResult = schema.safeParse(json)
    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.errors[0].message }, { status: 400 })
    }
    
    const payload = parseResult.data
    const normalizedName = payload.name.trim()
    const normalizedPassword = payload.password.trim()
    const hashedPassword = await bcrypt.hash(normalizedPassword, 10)

  const invite = await prisma.invite.findUnique({ where: { token: payload.token } })
  if (!invite) return NextResponse.json({ error: 'Invalid invitation token' }, { status: 404 })
  if (invite.status === 'cancelled' || invite.status === 'expired') {
    return NextResponse.json({ error: `Invitation is ${invite.status}` }, { status: 400 })
  }
  if (invite.expiresAt < new Date()) return NextResponse.json({ error: 'Invitation expired' }, { status: 400 })

  const role = await prisma.role.findUnique({ where: { id: invite.roleId } })
  if (!role) return NextResponse.json({ error: 'Role not found' }, { status: 400 })

  const user = await prisma.$transaction(async (tx) => {
    const existing = await tx.user.findUnique({ where: { email: invite.email } })
    const next = existing
      ? await tx.user.update({
          where: { id: existing.id },
          data: {
            name: normalizedName,
            password: hashedPassword,
            organizationId: invite.organizationId,
            roleId: invite.roleId,
            status: 'active',
          },
        })
      : await tx.user.create({
          data: {
            name: normalizedName,
            email: invite.email,
            password: hashedPassword,
            organizationId: invite.organizationId,
            roleId: invite.roleId,
            status: 'active',
          },
        })

    await tx.invite.update({
      where: { id: invite.id },
      data: { status: 'accepted', acceptedAt: new Date() },
    })
    if (invite.projectId) {
      await tx.projectMember.upsert({
        where: { projectId_userId: { projectId: invite.projectId, userId: next.id } },
        create: { projectId: invite.projectId, userId: next.id, role: 'member' },
        update: {},
      })
    }
    return next
  })

  return NextResponse.json({ ok: true, userId: user.id })
  } catch (error: any) {
    console.error('Accept invite error:', error)
    return NextResponse.json({ error: 'Failed to accept invitation' }, { status: 500 })
  }
}

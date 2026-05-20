import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/server/prisma'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(req: Request) {
  const payload = schema.parse(await req.json())
  const normalizedEmail = payload.email.trim().toLowerCase()
  const inputPassword = payload.password.trim()
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: { role: true },
  })

  if (!user || user.password !== inputPassword) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }
  if (user.status === 'suspended') {
    return NextResponse.json({ error: 'Your account has been suspended' }, { status: 403 })
  }

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      organizationId: user.organizationId,
      roleId: user.roleId ?? '',
      roleSlug: user.role?.slug ?? null,
      rolePermissions: user.role?.permissions ?? [],
      status: user.status,
      avatar: user.avatar,
      joinedAt: user.joinedAt.toISOString(),
    },
  })
}

import { NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
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

  let isPasswordValid = false;
  if (user) {
    // Try to compare using bcrypt first
    isPasswordValid = await bcrypt.compare(inputPassword, user.password).catch(() => false);
    
    // Fallback for plain-text passwords (useful if you have seeded users with unhashed passwords)
    if (!isPasswordValid && user.password === inputPassword) {
      isPasswordValid = true;
    }
  }

  if (!user || !isPasswordValid) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }
  if (user.status !== 'active') {
    return NextResponse.json({ error: 'Your account is not active. Please contact administration.' }, { status: 403 })
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

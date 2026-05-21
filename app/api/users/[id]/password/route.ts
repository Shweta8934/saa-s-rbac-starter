import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/server/prisma'
import { logAudit } from '@/lib/server/audit'

const passwordSchema = z.object({
  newPassword: z.string().min(6),
  actorUserId: z.string().optional(),
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const payload = passwordSchema.parse(await req.json())
  
  // For the sake of this starter, we update it directly.
  // In a production app, use bcrypt or argon2 to hash the password here.
  await prisma.user.update({
    where: { id },
    data: { password: payload.newPassword }
  })

  await logAudit({ 
    actorUserId: payload.actorUserId, 
    entityType: 'user', 
    entityId: id, 
    action: 'update', 
    metadata: { changed: 'password' } 
  })

  return NextResponse.json({ ok: true })
}

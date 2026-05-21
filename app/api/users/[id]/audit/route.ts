import { NextResponse } from 'next/server'
import { prisma } from '@/lib/server/prisma'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get('limit') || '5')

  const logs = await prisma.auditLog.findMany({
    where: { actorUserId: id },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  return NextResponse.json({ logs })
}

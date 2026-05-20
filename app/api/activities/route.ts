import { NextResponse } from 'next/server'
import { prisma } from '@/lib/server/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const organizationId = searchParams.get('organizationId')
  const limit = Number(searchParams.get('limit') || 20)

  const activities = await prisma.activity.findMany({
    where: organizationId ? { organizationId } : undefined,
    orderBy: { createdAt: 'desc' },
    take: Number.isNaN(limit) ? 20 : Math.min(limit, 100),
    include: {
      organization: true,
    },
  })

  return NextResponse.json({ activities })
}

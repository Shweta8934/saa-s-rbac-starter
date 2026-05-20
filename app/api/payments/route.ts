import { NextResponse } from 'next/server'
import { prisma } from '@/lib/server/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const organizationId = searchParams.get('organizationId')

  const payments = await prisma.payment.findMany({
    where: organizationId ? { organizationId } : undefined,
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ payments })
}

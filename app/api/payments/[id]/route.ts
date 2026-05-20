import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/server/prisma'

const updateSchema = z.object({
  amount: z.number().int().positive().optional(),
  currency: z.string().optional(),
  status: z.enum(['pending', 'succeeded', 'failed']).optional(),
  method: z.enum(['card', 'bank_transfer', 'paypal']).optional(),
  description: z.string().min(1).optional(),
  invoiceUrl: z.string().url().nullable().optional(),
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = updateSchema.parse(await req.json())
  const payment = await prisma.payment.update({ where: { id }, data: payload })
  return NextResponse.json({ payment })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.payment.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

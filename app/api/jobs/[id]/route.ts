import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/server/prisma'

const updateSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  status: z.string().optional(),
  location: z.string().optional().nullable(),
  experience: z.string().optional().nullable(),
})

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const job = await prisma.job.findUnique({
    where: { id },
    include: { applications: { orderBy: { createdAt: 'desc' } } },
  })
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ job })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = updateSchema.parse(await req.json())
  const job = await prisma.job.update({
    where: { id },
    data: {
      title: payload.title?.trim(),
      description: payload.description?.trim() || payload.description || null,
      status: payload.status,
      location: payload.location?.trim() || payload.location || null,
      experience: payload.experience?.trim() || payload.experience || null,
    },
  })
  return NextResponse.json({ job })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.job.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

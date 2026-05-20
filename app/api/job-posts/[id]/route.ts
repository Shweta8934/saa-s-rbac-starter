import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/server/prisma'

const updateSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().min(10).optional(),
  location: z.string().nullable().optional(),
  employmentType: z.string().nullable().optional(),
  duration: z.string().nullable().optional(),
  skills: z.array(z.string()).optional(),
  experienceMin: z.number().int().nullable().optional(),
  experienceMax: z.number().int().nullable().optional(),
  salaryMin: z.number().int().nullable().optional(),
  salaryMax: z.number().int().nullable().optional(),
  experience: z.string().nullable().optional(),
  status: z.string().optional(),
})

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const job = await prisma.job.findUnique({ where: { id } })
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ job })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const payload = updateSchema.parse(await req.json())

    const experienceSummary =
      payload.experience?.trim() ||
      [
        payload.experienceMin != null ? `Min ${payload.experienceMin}y` : null,
        payload.experienceMax != null ? `Max ${payload.experienceMax}y` : null,
      ]
        .filter(Boolean)
        .join(' ') ||
      payload.experience ||
      null

    const job = await prisma.job.update({
      where: { id },
      data: {
        title: payload.title?.trim(),
        description: payload.description?.trim(),
        location: payload.location?.trim() || payload.location || null,
        experience: experienceSummary,
        status: payload.status,
      },
    })
    return NextResponse.json({ job })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to update job post'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.job.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

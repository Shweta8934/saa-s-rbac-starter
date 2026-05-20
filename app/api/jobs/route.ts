import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/server/prisma'

const createSchema = z.object({
  organizationId: z.string(),
  title: z.string().min(2),
  description: z.string().optional(),
  status: z.string().optional(),
  location: z.string().optional(),
  experience: z.string().optional(),
  createdBy: z.string().optional(),
})

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const organizationId = searchParams.get('organizationId')
  if (!organizationId) return NextResponse.json({ jobs: [] })

  const jobs = await prisma.job.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { applications: true } } },
  })
  return NextResponse.json({ jobs })
}

export async function POST(req: Request) {
  const payload = createSchema.parse(await req.json())
  const slug = payload.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

  const job = await prisma.job.create({
    data: {
      organizationId: payload.organizationId,
      title: payload.title.trim(),
      slug: slug || `job-${Date.now()}`,
      description: payload.description?.trim() || null,
      status: payload.status || 'open',
      location: payload.location?.trim() || null,
      experience: payload.experience?.trim() || null,
      createdBy: payload.createdBy,
    },
  })

  return NextResponse.json({ job }, { status: 201 })
}

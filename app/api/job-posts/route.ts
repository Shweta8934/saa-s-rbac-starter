import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/server/prisma'

const createSchema = z.object({
  organizationId: z.string(),
  title: z.string().min(2),
  description: z.string().min(10),
  location: z.string().optional(),
  employmentType: z.string().optional(),
  duration: z.string().optional(),
  skills: z.array(z.string()).optional(),
  experienceMin: z.number().int().optional(),
  experienceMax: z.number().int().optional(),
  salaryMin: z.number().int().optional(),
  salaryMax: z.number().int().optional(),
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
  })
  return NextResponse.json({ jobs })
}

export async function POST(req: Request) {
  try {
    const payload = createSchema.parse(await req.json())
    const slug = payload.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

    // Keep create compatible with current DB schema columns.
    const experienceSummary =
      payload.experience?.trim() ||
      [
        payload.experienceMin != null ? `Min ${payload.experienceMin}y` : null,
        payload.experienceMax != null ? `Max ${payload.experienceMax}y` : null,
      ]
        .filter(Boolean)
        .join(' ') ||
      null

    const job = await prisma.job.create({
      data: {
        organizationId: payload.organizationId,
        title: payload.title.trim(),
        slug: slug || `job-${Date.now()}`,
        description: payload.description.trim(),
        location: payload.location?.trim() || null,
        experience: experienceSummary,
        createdBy: payload.createdBy,
        status: 'open',
      },
    })

    return NextResponse.json({ job }, { status: 201 })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to create job post'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

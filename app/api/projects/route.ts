import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/server/prisma'

const createSchema = z.object({
  organizationId: z.string(),
  name: z.string().min(2),
  description: z.string().optional(),
  status: z.string().optional(),
  createdBy: z.string().optional(),
})

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const organizationId = searchParams.get('organizationId')
  const requesterUserId = searchParams.get('requesterUserId')
  if (!organizationId) return NextResponse.json({ projects: [] })

  if (requesterUserId) {
    const requester = await prisma.user.findUnique({
      where: { id: requesterUserId },
      include: { role: true },
    })
    const isHr = requester?.role?.slug === 'hr'
    if (isHr) {
      if (requester.organizationId !== organizationId) {
        return NextResponse.json({ projects: [] })
      }
      const projects = await prisma.project.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
        include: { members: { include: { user: true } } },
      })
      return NextResponse.json({ projects })
    }
  }

  const projects = await prisma.project.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
    include: {
      members: {
        include: { user: true },
      },
    },
  })
  return NextResponse.json({ projects })
}

export async function POST(req: Request) {
  const payload = createSchema.parse(await req.json())
  const slug = payload.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

  const project = await prisma.project.create({
    data: {
      organizationId: payload.organizationId,
      name: payload.name.trim(),
      slug: slug || `project-${Date.now()}`,
      description: payload.description?.trim() || null,
      status: payload.status || 'active',
      createdBy: payload.createdBy,
    },
  })

  return NextResponse.json({ project }, { status: 201 })
}

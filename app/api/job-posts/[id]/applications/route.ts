import { NextResponse } from 'next/server'
import { prisma } from '@/lib/server/prisma'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const applications = await prisma.jobApplication.findMany({
    where: { jobId: id },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ applications })
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const job = await prisma.job.findUnique({ where: { id } })
  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

  const form = await req.formData()
  const fullName = String(form.get('fullName') || '').trim()
  const email = String(form.get('email') || '').trim().toLowerCase()
  if (!fullName || !email) {
    return NextResponse.json({ error: 'fullName and email are required' }, { status: 400 })
  }

  let resumePath: string | null = null
  const resume = form.get('resume')
  if (resume && resume instanceof File && resume.size > 0) {
    const dir = path.join(process.cwd(), 'public', 'uploads', 'resumes')
    await mkdir(dir, { recursive: true })
    const filename = `${Date.now()}-${resume.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const filePath = path.join(dir, filename)
    await writeFile(filePath, Buffer.from(await resume.arrayBuffer()))
    resumePath = `/uploads/resumes/${filename}`
  }

  const application = await prisma.jobApplication.create({
    data: {
      jobId: id,
      organizationId: job.organizationId,
      fullName,
      email,
      phone: String(form.get('phone') || '').trim() || null,
      location: String(form.get('location') || '').trim() || null,
      yearsExperience: form.get('yearsExperience') ? Number(form.get('yearsExperience')) : null,
      currentCompany: String(form.get('currentCompany') || '').trim() || null,
      expectedCtc: String(form.get('expectedCtc') || '').trim() || null,
      noticePeriod: String(form.get('noticePeriod') || '').trim() || null,
      linkedinUrl: String(form.get('linkedinUrl') || '').trim() || null,
      portfolioUrl: String(form.get('portfolioUrl') || '').trim() || null,
      coverLetter: String(form.get('coverLetter') || '').trim() || null,
      resumePath,
      status: 'applied',
    },
  })

  return NextResponse.json({ application }, { status: 201 })
}

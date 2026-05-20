import { NextResponse } from 'next/server'
import { z } from 'zod'
import { sendGenericEmail } from '@/lib/server/mailer'

const schema = z.object({
  to: z.string().email(),
  candidateName: z.string().min(1),
  jobTitle: z.string().min(1),
  type: z.enum(['interview', 'test']),
  actorName: z.string().optional(),
  organizationName: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const payload = schema.parse(await req.json())

    const org = payload.organizationName || 'our company'
    const actor = payload.actorName || 'Recruiter'

    const subject =
      payload.type === 'interview'
        ? `Interview Invitation - ${payload.jobTitle}`
        : `Test Assignment - ${payload.jobTitle}`

    const html =
      payload.type === 'interview'
        ? `
          <h2>Interview Invitation</h2>
          <p>Hi ${payload.candidateName},</p>
          <p>${actor} from ${org} invited you for an interview for <strong>${payload.jobTitle}</strong>.</p>
          <p>Please reply to this mail to confirm your availability.</p>
        `
        : `
          <h2>Test Assignment</h2>
          <p>Hi ${payload.candidateName},</p>
          <p>${actor} from ${org} shared a test assignment for <strong>${payload.jobTitle}</strong>.</p>
          <p>Please complete and reply with your submission.</p>
        `

    const result = await sendGenericEmail({ to: payload.to, subject, html })
    if (!result.sent) {
      return NextResponse.json({ error: result.reason || 'MAIL_NOT_SENT' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to send candidate mail'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

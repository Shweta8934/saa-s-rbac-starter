import { NextResponse } from 'next/server'
import { z } from 'zod'

const checkoutSchema = z.object({
  organizationId: z.string(),
  planSlug: z.enum(['free', 'starter', 'professional', 'enterprise']),
  actorUserId: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const payload = checkoutSchema.parse(body)

    const isMock = process.env.NEXT_PUBLIC_STRIPE_MOCK !== 'false' // default to mock if not explicitly set to false

    if (isMock) {
      // Simulate generating a Stripe Session ID
      const mockSessionId = `cs_test_${crypto.randomUUID()}`
      const checkoutUrl = `/billing/checkout-mock?session_id=${mockSessionId}&planSlug=${payload.planSlug}&organizationId=${payload.organizationId}&actorUserId=${payload.actorUserId || ''}`
      
      console.log('[STRIPE][MOCK_CHECKOUT] Generated mock checkout session URL:', checkoutUrl)
      
      return NextResponse.json({
        success: true,
        sessionId: mockSessionId,
        url: checkoutUrl,
      })
    }

    // Placeholder for actual Stripe Session creation if someone configures it later:
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    // const session = await stripe.checkout.sessions.create({...})
    // return NextResponse.json({ success: true, url: session.url })
    
    return NextResponse.json({ error: 'Stripe is not configured and Mock mode is disabled.' }, { status: 400 })

  } catch (error) {
    console.error('[STRIPE_CHECKOUT_ERROR]', error)
    return NextResponse.json(
      { error: error instanceof z.ZodError ? error.errors : 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

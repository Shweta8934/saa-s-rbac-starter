import { NextResponse } from 'next/server'
import { prisma } from '@/lib/server/prisma'
import { logAudit } from '@/lib/server/audit'
import { PLAN_NAMES } from '@/lib/constants'

const planPricesInCents: Record<string, number> = {
  free: 0,
  starter: 2900,
  professional: 7900,
  enterprise: 19900,
}

// Ensure subscription plans exist in the DB (seeding helper)
async function ensurePlans() {
  const seeds = [
    { slug: 'free', name: 'Free', price: 0, billingCycle: 'monthly', description: 'Starter free plan' },
    { slug: 'starter', name: 'Starter', price: 29, billingCycle: 'monthly', description: 'Starter plan' },
    { slug: 'professional', name: 'Professional', price: 79, billingCycle: 'monthly', description: 'Professional plan' },
    { slug: 'enterprise', name: 'Enterprise', price: 199, billingCycle: 'monthly', description: 'Enterprise plan' },
  ]

  for (const p of seeds) {
    const existing = await prisma.subscriptionPlan.findUnique({ where: { slug: p.slug } })
    if (!existing) {
      await prisma.subscriptionPlan.create({
        data: {
          slug: p.slug,
          name: p.name,
          price: p.price,
          billingCycle: p.billingCycle,
          description: p.description,
          features: [],
          limitsJson: {},
        },
      })
    }
  }
}

export async function POST(req: Request) {
  try {
    const signature = req.headers.get('stripe-signature')
    const rawBody = await req.text()
    
    let event: any
    const isMock = signature && signature.includes('mock')

    if (isMock) {
      // Bypassed signature for mock simulation: Parse the body directly
      event = JSON.parse(rawBody)
      console.log('[STRIPE_WEBHOOK][MOCK] Processing mock Stripe event:', event.type)
    } else {
      // In production, you would construct the Stripe event using the Stripe SDK:
      // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
      // event = stripe.webhooks.constructEvent(rawBody, signature!, process.env.STRIPE_WEBHOOK_SECRET!)
      
      console.warn('[STRIPE_WEBHOOK] Received webhook event without a valid mock signature. Rejecting.')
      return NextResponse.json({ error: 'Webhook signature verification failed.' }, { status: 400 })
    }

    await ensurePlans()

    const eventType = event.type
    const dataObject = event.data.object

    if (eventType === 'checkout.session.completed' || eventType === 'invoice.payment_succeeded') {
      const metadata = dataObject.metadata || {}
      const organizationId = metadata.organizationId
      const planSlug = metadata.planSlug
      const actorUserId = metadata.actorUserId || null

      if (!organizationId || !planSlug) {
        console.error('[STRIPE_WEBHOOK] Missing metadata in event:', dataObject.id)
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
      }

      console.log(`[STRIPE_WEBHOOK] Processing purchase success for Organization: ${organizationId}, Plan: ${planSlug}`)

      const plan = await prisma.subscriptionPlan.findUnique({ where: { slug: planSlug } })
      if (!plan) {
        console.error('[STRIPE_WEBHOOK] Plan not found:', planSlug)
        return NextResponse.json({ error: 'Plan not found in database' }, { status: 404 })
      }

      // Calculate period end (1 month out)
      const now = new Date()
      const nextPeriod = new Date(now)
      nextPeriod.setMonth(nextPeriod.getMonth() + 1)

      // 0. Ensure the User exists (since auth might be mock data)
      const mockUserId = actorUserId || 'mock_user_id'
      await prisma.user.upsert({
        where: { id: mockUserId },
        update: {},
        create: {
          id: mockUserId,
          name: 'Mock User',
          email: `mockuser-${mockUserId}@example.com`,
          password: 'mockpassword',
        }
      })

      // 1. Ensure the Organization exists (since auth might be mock data)
      await prisma.organization.upsert({
        where: { id: organizationId },
        update: {},
        create: {
          id: organizationId,
          name: `Mock Organization ${organizationId}`,
          slug: `mock-org-${organizationId}`,
          email: `billing-${organizationId}@example.com`,
          industry: 'Technology',
          ownerId: mockUserId,
          subscriptionPlanId: plan.id,
        },
      })

      // 2. Find and update or create OrganizationSubscription
      const currentSubscription = await prisma.organizationSubscription.findFirst({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
      })

      let subscription
      if (currentSubscription) {
        subscription = await prisma.organizationSubscription.update({
          where: { id: currentSubscription.id },
          data: {
            planId: plan.id,
            status: 'active',
            currentPeriodStart: now,
            currentPeriodEnd: nextPeriod,
            cancelAtPeriodEnd: false,
          },
          include: { plan: true },
        })
      } else {
        subscription = await prisma.organizationSubscription.create({
          data: {
            organizationId,
            planId: plan.id,
            status: 'active',
            currentPeriodStart: now,
            currentPeriodEnd: nextPeriod,
          },
          include: { plan: true },
        })
      }

      // 2. Sync the organization's subscriptionPlanId
      await prisma.organization.update({
        where: { id: organizationId },
        data: { subscriptionPlanId: plan.id },
      })

      // 3. Create a payment ledger entry
      const paymentAmount = planPricesInCents[planSlug] ?? (plan.price * 100)
      const payment = await prisma.payment.create({
        data: {
          organizationId,
          amount: paymentAmount,
          currency: 'usd',
          status: 'succeeded',
          method: 'card',
          description: `${plan.name} Plan Subscription - Monthly`,
          invoiceUrl: `https://example.com/invoice/stripe_${crypto.randomUUID()}`,
        },
      })

      // 4. Log audit log
      try {
        let safeActorUserId: string | null = null
        if (actorUserId) {
          const actor = await prisma.user.findUnique({ where: { id: actorUserId } })
          if (actor) safeActorUserId = actor.id
        }

        await logAudit({
          actorUserId: safeActorUserId,
          entityType: 'subscription',
          entityId: subscription.id,
          action: 'update',
          after: subscription,
          metadata: { paymentId: payment.id, stripeSessionId: dataObject.id },
        })
      } catch (auditErr) {
        console.error('[STRIPE_WEBHOOK][AUDIT_ERR]', auditErr)
      }

      console.log(`[STRIPE_WEBHOOK] Subscription updated successfully for ${organizationId}`)
      return NextResponse.json({ success: true, event: eventType, subscriptionId: subscription.id })
    } 
    
    if (eventType === 'invoice.payment_failed') {
      const metadata = dataObject.metadata || {}
      const organizationId = metadata.organizationId
      const planSlug = metadata.planSlug
      const actorUserId = metadata.actorUserId || null

      if (!organizationId) {
        console.error('[STRIPE_WEBHOOK][FAILURE] Missing organizationId in event')
        return NextResponse.json({ error: 'Missing organizationId' }, { status: 400 })
      }

      console.log(`[STRIPE_WEBHOOK] Processing payment failure for Organization: ${organizationId}`)

      // 1. Update OrganizationSubscription to past_due
      const currentSubscription = await prisma.organizationSubscription.findFirst({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
      })

      if (currentSubscription) {
        await prisma.organizationSubscription.update({
          where: { id: currentSubscription.id },
          data: { status: 'past_due' },
        })
      }

      // 2. Create failed payment ledger entry
      const planName = planSlug ? PLAN_NAMES[planSlug as keyof typeof PLAN_NAMES] || 'Subscription' : 'Subscription'
      const paymentAmount = planSlug ? (planPricesInCents[planSlug] ?? 0) : 0
      const payment = await prisma.payment.create({
        data: {
          organizationId,
          amount: paymentAmount,
          currency: 'usd',
          status: 'failed',
          method: 'card',
          description: `${planName} Plan Renewal - Failed Payment`,
          invoiceUrl: null,
        },
      })

      // 3. Log audit log
      try {
        let safeActorUserId: string | null = null
        if (actorUserId) {
          const actor = await prisma.user.findUnique({ where: { id: actorUserId } })
          if (actor) safeActorUserId = actor.id
        }

        await logAudit({
          actorUserId: safeActorUserId,
          entityType: 'subscription',
          entityId: currentSubscription?.id || 'unknown',
          action: 'update',
          after: { status: 'past_due' },
          metadata: { paymentId: payment.id, error: 'Payment authorization declined' },
        })
      } catch (auditErr) {
        console.error('[STRIPE_WEBHOOK][FAILURE][AUDIT_ERR]', auditErr)
      }

      return NextResponse.json({ success: true, event: eventType, status: 'past_due' })
    }

    // Default return for unhandled Stripe event types
    console.log(`[STRIPE_WEBHOOK] Received unhandled Stripe event type: ${eventType}`)
    return NextResponse.json({ received: true, ignored: true })

  } catch (error: any) {
    console.error('[STRIPE_WEBHOOK_ERROR]', error)
    return NextResponse.json({ error: 'Failed to process Stripe webhook event', details: error.message, stack: error.stack }, { status: 500 })
  }
}

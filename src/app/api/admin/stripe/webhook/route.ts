import { NextRequest, NextResponse } from 'next/server'

function success(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

function error(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status })
}

// POST /api/admin/stripe/webhook — Handle Stripe webhooks
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()

    // Verify Stripe webhook signature
    // In production, use the STRIPE_WEBHOOK_SECRET to verify:
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
    // const sig = request.headers.get('stripe-signature')
    // const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)

    // For now, parse as JSON without signature verification
    let event: Record<string, unknown>
    try {
      event = JSON.parse(body)
    } catch {
      return error('Invalid JSON payload', 400)
    }

    const eventType = event.type as string
    const eventData = event.data?.object as Record<string, unknown> | undefined

    console.log(`[Stripe Webhook] Received event: ${eventType}`)

    switch (eventType) {
      case 'customer.subscription.created': {
        // Handle new subscription
        const customerId = eventData?.customer as string
        const subscriptionId = eventData?.id as string
        const status = eventData?.status as string
        console.log(`[Stripe] Subscription created: ${subscriptionId}, customer: ${customerId}, status: ${status}`)
        // TODO: Map Stripe customer to Company and update subscriptionTier
        break
      }

      case 'customer.subscription.updated': {
        // Handle subscription changes (plan upgrade/downgrade)
        const subscriptionId = eventData?.id as string
        const status = eventData?.status as string
        console.log(`[Stripe] Subscription updated: ${subscriptionId}, new status: ${status}`)
        // TODO: Update Company subscriptionTier based on plan
        break
      }

      case 'customer.subscription.deleted': {
        // Handle subscription cancellation
        const subscriptionId = eventData?.id as string
        console.log(`[Stripe] Subscription deleted: ${subscriptionId}`)
        // TODO: Downgrade company to 'free' tier
        break
      }

      case 'invoice.payment_failed': {
        // Handle failed payment
        const invoiceId = eventData?.id as string
        const customerId = eventData?.customer as string
        console.log(`[Stripe] Payment failed: invoice ${invoiceId}, customer: ${customerId}`)
        // TODO: Mark subscription as past_due, notify company
        break
      }

      case 'invoice.paid': {
        // Handle successful payment
        const invoiceId = eventData?.id as string
        const amountPaid = eventData?.amount_paid as number
        console.log(`[Stripe] Payment successful: invoice ${invoiceId}, amount: ${amountPaid}`)
        // TODO: Update company subscription status, send receipt
        break
      }

      default:
        console.log(`[Stripe] Unhandled event type: ${eventType}`)
    }

    // Return 200 to acknowledge receipt
    return success({ received: true, event: eventType })
  } catch (err) {
    console.error('Stripe webhook error:', err)
    // Always return 200 to Stripe to prevent retries on our parsing errors
    // Return 400 only for truly invalid requests
    return success({ received: true })
  }
}

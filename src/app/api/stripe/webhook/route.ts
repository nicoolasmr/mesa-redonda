import { headers } from "next/headers"
import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"
import { logger } from "@/lib/logger"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-01-27.acacia' as any, // Latest API version
})

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
)

export async function POST(req: Request) {
    const body = await req.text() // Raw body for sig verification
    const sig = (await headers()).get("stripe-signature")

    let event: Stripe.Event

    // 1. Verify Signature
    try {
        if (!sig) throw new Error("No signature")
        event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET)
    } catch (err: any) {
        logger.error(`Webhook Signature Error: ${err.message}`, err)
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
    }

    // 2. Idempotency Check
    const { data: existing } = await supabaseAdmin
        .from('stripe_events')
        .select('status')
        .eq('stripe_event_id', event.id)
        .single()

    if (existing) {
        console.log(`Event ${event.id} already processed.`)
        return new NextResponse("Idempotent success", { status: 200 })
    }

    // 3. Log Pending Event
    await supabaseAdmin.from('stripe_events').insert({
        stripe_event_id: event.id,
        type: event.type,
        status: 'pending'
    })

    try {
        // 4. Process Event
        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, supabaseAdmin)
                break
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted':
                await handleSubscriptionUpdate(event.data.object as Stripe.Subscription, supabaseAdmin)
                break
            case 'invoice.payment_failed':
                // Handle dunning / churn logic
                break
        }

        // 5. Mark Processed
        await supabaseAdmin
            .from('stripe_events')
            .update({ status: 'processed', processed_at: new Date().toISOString() })
            .eq('stripe_event_id', event.id)

        return new NextResponse("Processed", { status: 200 })

    } catch (err: any) {
        logger.error(`Webhook Processing Error: ${err.message}`, err, { stripeEventId: event.id })
        await supabaseAdmin
            .from('stripe_events')
            .update({ status: 'failed', error: err.message })
            .eq('stripe_event_id', event.id)

        return new NextResponse("Internal Server Error", { status: 500 })
    }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, supabase: any) {
    if (!session.client_reference_id) return // Must have workspace_id

    // Save Customer mapping
    await supabase.from('stripe_customers').upsert({
        workspace_id: session.client_reference_id,
        stripe_customer_id: session.customer as string
    })

    // If subscription, it will be handled by subscription.created event likely, 
    // but sometimes we want instant access here.
}

async function handleSubscriptionUpdate(sub: Stripe.Subscription, supabase: any) {
    // Find workspace by customer
    const { data: cust } = await supabase
        .from('stripe_customers')
        .select('workspace_id')
        .eq('stripe_customer_id', sub.customer as string)
        .single()

    if (!cust) return

    // Map price ID to Plan Key (Naive mapping)
    // Ideally store price_id in plan_catalog
    const priceId = sub.items.data[0].price.id
    let planKey = 'free'
    if (priceId === process.env.STRIPE_PRICE_STARTER) planKey = 'starter'
    if (priceId === process.env.STRIPE_PRICE_PRO) planKey = 'pro'
    if (priceId === process.env.STRIPE_PRICE_TEAM) planKey = 'team'

    await supabase.from('stripe_subscriptions').upsert({
        workspace_id: cust.workspace_id,
        stripe_subscription_id: sub.id,
        status: sub.status,
        plan_key: planKey,
        current_period_end: new Date((sub as any).current_period_end * 1000).toISOString(),
        cancel_at_period_end: sub.cancel_at_period_end
    })
}

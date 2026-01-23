'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { stripe as stripeLib, getPriceIdFromPlan } from '@/lib/stripe'
import Stripe from 'stripe'
import { z } from "zod";
import { logger } from "@/lib/logger";
import { getOrCreateWorkspace } from "@/app/app/workspace-utils";

const stripe = stripeLib
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

const UpgradeSessionSchema = z.string().min(1);
const CheckoutSessionSchema = z.string().min(1);

/**
 * Action: Handle automatic upgrade from landing page (supports guest checkout)
 */
export async function upgradeCurrentSession(planKey: string) {
    // Validate Input
    const validatedPlan = UpgradeSessionSchema.parse(planKey);

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const priceId = getPriceIdFromPlan(validatedPlan)

    if (!priceId) {
        logger.error('Upgrade Error: Price ID not found', null, { planKey: validatedPlan });
        throw new Error(`Plano "${validatedPlan}" não encontrado.`)
    }

    let workspace = null
    if (user) {
        workspace = await getOrCreateWorkspace(supabase, user.id);
    }

    try {
        const sessionConfig: Stripe.Checkout.SessionCreateParams = {
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${baseUrl}/app?checkout=success`,
            cancel_url: `${baseUrl}/?checkout=canceled`,
            allow_promotion_codes: true,
            metadata: {
                plan_key: validatedPlan,
                ...(user ? { user_id: user.id } : {}),
                ...(workspace ? { workspace_id: workspace.id } : {}),
            },
        }

        if (workspace?.stripe_customer_id) {
            sessionConfig.customer = workspace.stripe_customer_id
        } else if (user?.email) {
            sessionConfig.customer_email = user.email
        }

        const session = await stripe.checkout.sessions.create(sessionConfig)

        return session.url
    } catch (error) {
        logger.error('Upgrade Session Error', error, { planKey: validatedPlan });
        return null
    }
}

/**
 * Action: Create a Stripe Checkout session
 */
export async function createCheckoutSession(priceId: string) {
    // Validate Input
    const validatedPrice = CheckoutSessionSchema.parse(priceId);

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login?next=/upgrade')
    }

    const workspace = await getOrCreateWorkspace(supabase, user.id)

    if (!workspace) {
        throw new Error('Falha ao inicializar o seu espaço de trabalho.')
    }

    try {
        const session = await stripe.checkout.sessions.create({
            customer: workspace.stripe_customer_id || undefined,
            customer_email: workspace.stripe_customer_id ? undefined : user.email,
            line_items: [
                {
                    price: validatedPrice,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${baseUrl}/app?checkout=success`,
            cancel_url: `${baseUrl}/upgrade?checkout=canceled`,
            metadata: {
                workspace_id: workspace.id,
                user_id: user.id,
            },
            subscription_data: {
                metadata: {
                    workspace_id: workspace.id,
                },
            },
        })

        if (!session.url) {
            throw new Error('Stripe failed to return a checkout URL')
        }

        redirect(session.url)
    } catch (error) {
        logger.error('Checkout Session Error', error, { priceId: validatedPrice });
        throw error
    }
}

/**
 * Action: Create a Stripe Billing Portal session
 */
export async function createPortalSession() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login?next=/app/settings')
    }

    const workspace = await getOrCreateWorkspace(supabase, user.id);

    if (!workspace?.stripe_customer_id) {
        // Redirect to upgrade if no billing history exists
        redirect('/upgrade')
    }

    try {
        const session = await stripe.billingPortal.sessions.create({
            customer: workspace.stripe_customer_id,
            return_url: `${baseUrl}/app/settings`,
        })

        if (!session.url) {
            throw new Error('Stripe failed to return a portal URL')
        }

        redirect(session.url)
    } catch (error) {
        logger.error('Portal Session Error', error, { userId: user.id });
        throw error
    }
}

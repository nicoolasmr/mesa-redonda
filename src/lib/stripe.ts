import Stripe from 'stripe';

// Fallback for build time if keys are missing
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_for_build', {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apiVersion: '2024-12-18.acacia' as any,
    typescript: true,
});

export function getPlanFromPriceId(priceId: string) {
    const plans = {
        [process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER!]: 'starter',
        [process.env.NEXT_PUBLIC_STRIPE_PRICE_GROWTH!]: 'growth',
        [process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_FOUNDER!]: 'pro',
    } as Record<string, string>;
    return plans[priceId] || 'free';
}

export function getPriceIdFromPlan(plan: string) {
    switch (plan.toLowerCase()) {
        case 'starter': return process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER
        case 'growth': return process.env.NEXT_PUBLIC_STRIPE_PRICE_GROWTH
        case 'pro': return process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_FOUNDER
        default: return null
    }
}

import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia' as any,
    typescript: true,
});

export function getPlanFromPriceId(priceId: string) {
    const plans = {
        [process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER!]: 'starter',
        [process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO!]: 'pro',
        [process.env.NEXT_PUBLIC_STRIPE_PRICE_MAX!]: 'max',
    };
    return plans[priceId] || 'free';
}

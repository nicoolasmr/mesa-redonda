import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { ensureMember } from "@/lib/auth-utils";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
    const { priceId, workspaceId } = await req.json();
    const supabase = await createClient();

    // Verify membership
    await ensureMember(supabase, workspaceId);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    // Create checkout
    try {
        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [{ price: priceId, quantity: 1 }],
            client_reference_id: workspaceId,
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/workspaces/${workspaceId}?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/settings/billing?canceled=true`,
            customer_email: user.email,
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        logger.error("Failed to create Stripe checkout session", error, { workspaceId, userId: user.id });
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

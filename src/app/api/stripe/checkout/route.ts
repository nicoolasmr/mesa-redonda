import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { priceId, workspaceId } = await req.json();
    const supabase = await createClient();

    // Verify ownership
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    // Create checkout
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
}

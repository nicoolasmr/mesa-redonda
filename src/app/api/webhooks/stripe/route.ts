import { stripe, getPlanFromPriceId } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
    // Use Admin Client for Webhook (Service Role)
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    );

    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature") as string;

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = event.data.object as any;

    if (event.type === "checkout.session.completed") {
        // Retrieve the subscription details
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        const workspaceId = session.client_reference_id;

        if (!workspaceId) {
            return new NextResponse("Missing client_reference_id", { status: 400 });
        }

        // Update Workspace
        await supabaseAdmin
            .from("workspaces")
            .update({
                stripe_customer_id: subscription.customer as string,
                subscription_status: subscription.status,
                subscription_plan: getPlanFromPriceId(subscription.items.data[0].price.id)
            })
            .eq("id", workspaceId);
    }

    if (event.type === "customer.subscription.updated") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subscription = event.data.object as any;

        // Find workspace by customer_id
        await supabaseAdmin
            .from("workspaces")
            .update({
                subscription_status: subscription.status,
                subscription_plan: getPlanFromPriceId(subscription.items.data[0].price.id)
            })
            .eq("stripe_customer_id", subscription.customer);
    }

    if (event.type === "customer.subscription.deleted") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subscription = event.data.object as any;

        await supabaseAdmin
            .from("workspaces")
            .update({
                subscription_status: "canceled",
                subscription_plan: "free"
            })
            .eq("stripe_customer_id", subscription.customer);
    }

    return new NextResponse(null, { status: 200 });
}

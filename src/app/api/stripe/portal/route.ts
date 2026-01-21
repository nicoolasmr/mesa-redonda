import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { workspaceId } = await req.json();
    const supabase = await createClient();

    // 1. Get Workspace Customer ID
    const { data: workspace } = await supabase
        .from("workspaces")
        .select("stripe_customer_id")
        .eq("id", workspaceId)
        .single();

    if (!workspace?.stripe_customer_id) {
        return new NextResponse("No customer ID found", { status: 400 });
    }

    const session = await stripe.billingPortal.sessions.create({
        customer: workspace.stripe_customer_id,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/workspaces/${workspaceId}`,
    });

    return NextResponse.json({ url: session.url });
}

import { stripe, getPlanFromPriceId } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

export async function POST(req: Request) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );

  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const session = event.data.object as any;

  if (event.type === "checkout.session.completed") {
    const subscriptionId = session.subscription as string;
    const customerEmail = session.customer_details?.email;
    let userId = session.metadata?.user_id;
    let workspaceId = session.metadata?.workspace_id;

    if (!userId && customerEmail) {
      const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = usersData?.users.find(u => u.email === customerEmail);

      if (!existingUser) {
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
 email: customerEmail,
          email_confirm: true,
          user_metadata: { source: 'stripe_checkout' }
        });

        if (createError) return new NextResponse("User Creation Error", { status: 500 });
        userId = newUser.user.id;
      } else {
        userId = existingUser.id;
      }
    }

    if (userId && !workspaceId) {
      const { data: workspaces } = await supabaseAdmin
        .from("workspaces")
        .select("id")
        .eq("owner_id", userId)
        .limit(1);

      if (!workspaces || workspaces.length === 0) {
        const { data: newWs, error: wsError } = await supabaseAdmin
          .from("workspaces")
          .insert({
 owner_id: userId,
            name: "Meu Workspace",
            subscription_plan: 'free'
          })
          .select()
          .single();

        if (wsError) return new NextResponse("Workspace Creation Error", { status: 500 });
        workspaceId = newWs.id;
      } else {
        workspaceId = workspaces[0].id;
      }
    }

    if (!workspaceId) return new NextResponse("Missing workspace identification", { status: 400 });

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    const { error } = await supabaseAdmin
      .from("workspaces")
      .update({
 stripe_customer_id: subscription.customer as string,
        subscription_status: subscription.status,
        subscription_plan: getPlanFromPriceId(subscription.items.data[0].price.id)
      })
      .eq("id", workspaceId);

    if (error) return new NextResponse(`Database Error: ${error.message}`, { status: 500 });
  }

  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription;
    await supabaseAdmin
      .from("workspaces")
      .update({
 subscription_status: subscription.status,
        subscription_plan: getPlanFromPriceId(subscription.items.data[0].price.id)
      })
      .eq("stripe_customer_id", subscription.customer);
  }

  if (event.type === "customer.subscription.deleted") {
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


import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getAuthenticatedUserId } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { payments, users } from "@/lib/schema";
import { getStripe } from "@/lib/stripe";
import { getPlan, isPurchasablePlan } from "@/lib/plans";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let planId: unknown;
  try {
    const body = await request.json();
    planId = body?.planId;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const plan = typeof planId === "string" ? getPlan(planId) : undefined;
  if (!plan || !isPurchasablePlan(plan)) {
    return NextResponse.json({ error: "Unknown or non-purchasable plan." }, { status: 400 });
  }

  try {
    const db = getDb();
    const rows = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    const user = rows[0];
    if (!user) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: plan.priceCents,
      currency: "usd",
      // Card only, confirmed in-page — no redirect-based payment methods,
      // so the checkout never navigates the candidate away mid-flow.
      automatic_payment_methods: { enabled: true, allow_redirects: "never" },
      receipt_email: user.email,
      metadata: { userId, planId: plan.id },
    });

    if (!paymentIntent.client_secret) {
      throw new Error("Stripe did not return a client secret.");
    }

    await db.insert(payments).values({
      userId,
      plan: plan.id,
      amountCents: plan.priceCents,
      currency: "usd",
      stripePaymentIntentId: paymentIntent.id,
      status: "processing",
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("POST /api/payments/create-intent failed", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

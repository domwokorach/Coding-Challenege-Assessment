import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getAuthenticatedUserId } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { payments, users } from "@/lib/schema";
import { getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

/**
 * Re-fetches the PaymentIntent from Stripe's own API and only trusts that
 * result — the client-reported outcome of `confirmPayment` is never enough
 * to mark a payment as succeeded.
 */
export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let paymentIntentId: unknown;
  try {
    const body = await request.json();
    paymentIntentId = body?.paymentIntentId;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (typeof paymentIntentId !== "string" || !paymentIntentId) {
    return NextResponse.json({ error: "Missing paymentIntentId." }, { status: 400 });
  }

  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(payments)
      .where(
        and(
          eq(payments.stripePaymentIntentId, paymentIntentId),
          eq(payments.userId, userId)
        )
      )
      .limit(1);
    const paymentRow = rows[0];
    if (!paymentRow) {
      return NextResponse.json({ error: "Payment not found." }, { status: 404 });
    }

    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.metadata?.userId !== userId) {
      return NextResponse.json({ error: "Payment not found." }, { status: 404 });
    }

    if (paymentIntent.status === "succeeded") {
      await db
        .update(payments)
        .set({ status: "succeeded", updatedAt: new Date() })
        .where(eq(payments.id, paymentRow.id));
      await db
        .update(users)
        .set({ plan: paymentRow.plan, planActivatedAt: new Date(), updatedAt: new Date() })
        .where(eq(users.id, userId));

      return NextResponse.json({
        status: "succeeded",
        plan: paymentRow.plan,
        amountCents: paymentRow.amountCents,
        currency: paymentRow.currency,
      });
    }

    const failedStatuses = ["canceled", "requires_payment_method"];
    const status = failedStatuses.includes(paymentIntent.status) ? "failed" : "processing";

    await db
      .update(payments)
      .set({ status, updatedAt: new Date() })
      .where(eq(payments.id, paymentRow.id));

    return NextResponse.json({
      status,
      stripeStatus: paymentIntent.status,
      plan: paymentRow.plan,
      amountCents: paymentRow.amountCents,
      currency: paymentRow.currency,
    });
  } catch (error) {
    console.error("POST /api/payments/confirm failed", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

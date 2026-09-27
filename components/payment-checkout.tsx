"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Elements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckoutForm } from "@/components/checkout-form";
import { getStripeClient } from "@/lib/stripe-client";
import type { Plan } from "@/lib/plans";

type Me = { email: string; firstName: string; lastName: string };
type LoadState =
  | { status: "loading" }
  | { status: "unauthenticated" }
  | { status: "error"; message: string }
  | { status: "ready"; clientSecret: string; paymentIntentId: string; me: Me };

export function PaymentCheckout({
  plan,
  onClose,
}: {
  plan: Plan & { priceCents: number };
  onClose: () => void;
}) {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const meRes = await fetch("/api/auth/me");
      if (cancelled) return;
      if (meRes.status === 401) {
        setState({ status: "unauthenticated" });
        return;
      }
      if (!meRes.ok) {
        setState({ status: "error", message: "We couldn't load your account. Please try again." });
        return;
      }
      const me = (await meRes.json()) as Me;

      const intentRes = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id }),
      });
      if (cancelled) return;
      if (!intentRes.ok) {
        const body = (await intentRes.json().catch(() => null)) as { error?: string } | null;
        setState({ status: "error", message: body?.error ?? "We couldn't start checkout. Please try again." });
        return;
      }
      const { clientSecret, paymentIntentId } = (await intentRes.json()) as {
        clientSecret: string;
        paymentIntentId: string;
      };
      setState({ status: "ready", clientSecret, paymentIntentId, me });
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [plan.id]);

  return (
    <Card className="mx-auto max-w-xl">
      <CardHeader>
        <CardTitle className="text-xl">Complete your purchase</CardTitle>
      </CardHeader>
      <CardContent>
        {state.status === "loading" && (
          <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
            <Spinner aria-hidden />
            Preparing secure checkout…
          </div>
        )}

        {state.status === "unauthenticated" && (
          <Alert>
            <AlertTitle>Log in to continue</AlertTitle>
            <AlertDescription>
              You&apos;ll need an account to purchase the {plan.name} plan.{" "}
              <Link href={`/login?next=/pricing`}>Log in</Link> or{" "}
              <Link href="/register">create an account</Link>, then come back to finish checkout.
            </AlertDescription>
          </Alert>
        )}

        {state.status === "error" && (
          <>
            <Alert variant="destructive">
              <AlertTitle>Couldn&apos;t start checkout</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={onClose}>
                Back to plans
              </Button>
            </div>
          </>
        )}

        {state.status === "ready" && (
          <Elements
            stripe={getStripeClient()}
            options={{ clientSecret: state.clientSecret }}
          >
            <CheckoutForm
              plan={plan}
              paymentIntentId={state.paymentIntentId}
              defaultEmail={state.me.email}
              defaultName={[state.me.firstName, state.me.lastName].filter(Boolean).join(" ")}
            />
          </Elements>
        )}
      </CardContent>
    </Card>
  );
}

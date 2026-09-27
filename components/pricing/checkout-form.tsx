"use client";

import { useId, useState } from "react";
import { useElements, useStripe, PaymentElement } from "@stripe/react-stripe-js";
import { Check, Circle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Plan } from "@/lib/payments/plans";
import { formatCents } from "@/lib/payments/plans";
import { cn } from "@/lib/utils";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Phase = "idle" | "processing" | "success" | "error";

type FieldErrors = {
  email?: string;
  name?: string;
};

export function CheckoutForm({
  plan,
  paymentIntentId,
  defaultEmail,
  defaultName,
}: {
  plan: Plan & { priceCents: number };
  paymentIntentId: string;
  defaultEmail: string;
  defaultName: string;
}) {
  const stripe = useStripe();
  const elements = useElements();

  const emailId = useId();
  const nameId = useId();

  const [email, setEmail] = useState(defaultEmail);
  const [name, setName] = useState(defaultName);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [phase, setPhase] = useState<Phase>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isBusy = phase === "processing" || phase === "success";

  const progressValue = phase === "success" ? 100 : phase === "idle" ? 33 : 66;

  const status =
    phase === "success" ? "Paid" : phase === "processing" ? "Processing" : phase === "error" ? "Failed" : "Not started";

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!email.trim()) {
      next.email = "Email is required.";
    } else if (!EMAIL_REGEX.test(email.trim())) {
      next.email = "Please enter a valid email address.";
    }
    if (!name.trim()) {
      next.name = "Name is required.";
    }
    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Guard against duplicate submissions (double-click, Enter-while-processing).
    if (phase === "processing" || phase === "success") return;

    setErrorMessage(null);

    const nextErrors = validate();
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (!stripe || !elements) {
      setErrorMessage("Payment form is still loading. Please try again in a moment.");
      setPhase("error");
      return;
    }

    setPhase("processing");

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setErrorMessage(submitError.message ?? "Please check your payment details and try again.");
      setPhase("error");
      return;
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        payment_method_data: {
          billing_details: { email: email.trim(), name: name.trim() },
        },
      },
    });

    if (confirmError) {
      setErrorMessage(confirmError.message ?? "Payment could not be processed. Please try again.");
      setPhase("error");
      return;
    }

    try {
      const res = await fetch("/api/payments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentIntentId }),
      });
      const body = (await res.json().catch(() => null)) as { status?: string; error?: string } | null;

      if (!res.ok || body?.status !== "succeeded") {
        setErrorMessage(
          body?.error ?? "We couldn't confirm your payment with our provider. Please try again."
        );
        setPhase("error");
        return;
      }

      setPhase("success");
    } catch {
      setErrorMessage("We couldn't confirm your payment. Please check your connection and try again.");
      setPhase("error");
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} noValidate className="flex flex-col gap-6">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={emailId}>Email</FieldLabel>
          <FieldContent>
            <Input
              id={emailId}
              type="email"
              autoComplete="email"
              placeholder="candidate@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isBusy}
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? `${emailId}-error` : undefined}
            />
            <FieldError
              id={`${emailId}-error`}
              errors={fieldErrors.email ? [{ message: fieldErrors.email }] : undefined}
            />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor={nameId}>Name</FieldLabel>
          <FieldContent>
            <Input
              id={nameId}
              autoComplete="name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isBusy}
              aria-invalid={!!fieldErrors.name}
              aria-describedby={fieldErrors.name ? `${nameId}-error` : undefined}
            />
            <FieldError
              id={`${nameId}-error`}
              errors={fieldErrors.name ? [{ message: fieldErrors.name }] : undefined}
            />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor={`${nameId}-plan`}>Selected plan</FieldLabel>
          <FieldContent>
            <Input id={`${nameId}-plan`} value={plan.name} disabled readOnly />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Payment details</FieldLabel>
          <FieldContent>
            <div className="rounded-2xl border border-input/60 bg-input/20 p-3">
              <PaymentElement options={{ readOnly: isBusy }} />
            </div>
            <FieldDescription>
              Your card details are handled directly by Stripe and never touch our servers.
            </FieldDescription>
          </FieldContent>
        </Field>
      </FieldGroup>

      <div className="flex flex-col gap-3 rounded-2xl border border-border/60 p-4">
        <Progress value={progressValue} aria-label="Payment progress">
          <ProgressLabel>Payment progress</ProgressLabel>
          <ProgressValue />
        </Progress>
        <ol className="flex flex-col gap-1.5 text-sm">
          <StepRow label="Plan selected" state="done" />
          <StepRow
            label="Payment processing"
            state={phase === "success" ? "done" : phase === "processing" ? "active" : phase === "error" ? "failed" : "pending"}
          />
          <StepRow label="Confirmation" state={phase === "success" ? "done" : "pending"} />
        </ol>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Plan</TableCell>
              <TableCell>{plan.name}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Billing</TableCell>
              <TableCell>{plan.billingInterval}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Price</TableCell>
              <TableCell>{formatCents(plan.priceCents)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Status</TableCell>
              <TableCell>{status}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {phase === "success" && (
        <Alert role="status" aria-live="polite">
          <Check />
          <AlertTitle>Payment successful</AlertTitle>
          <AlertDescription>
            Your payment has been confirmed and your plan is now active.
          </AlertDescription>
        </Alert>
      )}

      {phase === "error" && errorMessage && (
        <Alert variant="destructive">
          <XCircle />
          <AlertTitle>Payment failed</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={isBusy}>
          {phase === "processing" ? (
            <>
              <Spinner aria-hidden />
              Processing payment…
            </>
          ) : phase === "success" ? (
            "Payment complete"
          ) : (
            "Process Payment"
          )}
        </Button>
      </div>
    </form>
  );
}

function StepRow({
  label,
  state,
}: {
  label: string;
  state: "done" | "active" | "pending" | "failed";
}) {
  const statusText =
    state === "done" ? "Done" : state === "active" ? "In progress" : state === "failed" ? "Failed" : "Not started";

  return (
    <li className="flex items-center gap-2">
      {state === "done" && <Check className="size-4 shrink-0 text-primary" aria-hidden />}
      {state === "active" && <Circle className="size-4 shrink-0 fill-primary text-primary" aria-hidden />}
      {state === "failed" && <XCircle className="size-4 shrink-0 text-destructive" aria-hidden />}
      {state === "pending" && <Circle className="size-4 shrink-0 text-muted-foreground" aria-hidden />}
      <span className={cn(state === "failed" && "text-destructive")}>{label}</span>
      <span className="text-muted-foreground">— {statusText}</span>
    </li>
  );
}

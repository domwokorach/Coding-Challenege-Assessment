"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/toast";
import { BorderBeam } from "@/registry/magicui/border-beam";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

type FieldErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  terms?: string;
};

export function CreateAccountForm() {
  const router = useRouter();

  const firstNameId = useId();
  const lastNameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const phoneId = useId();
  const termsId = useId();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function validate(): FieldErrors {
    const nextErrors: FieldErrors = {};

    if (!firstName.trim()) {
      nextErrors.firstName = "First name is required.";
    }
    if (!lastName.trim()) {
      nextErrors.lastName = "Last name is required.";
    }
    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!EMAIL_REGEX.test(email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }
    if (!password) {
      nextErrors.password = "Password is required.";
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      nextErrors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`;
    }
    if (!acceptedTerms) {
      nextErrors.terms = "You must accept the Terms of Service and Privacy Policy.";
    }

    return nextErrors;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          password,
          acceptedTerms,
        }),
      });
      const body = (await res.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!res.ok) {
        setFormError(
          res.status === 409
            ? "An account with this email already exists."
            : body?.error ?? "Unable to create your account. Please try again."
        );
        setIsLoading(false);
        return;
      }

      toast.add({
        title: "Account created",
        description: "Welcome! Let's get you started.",
        type: "success",
      });
      router.push("/programme");
      router.refresh();
    } catch {
      setFormError("Unable to create your account. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <Card className="relative w-full max-w-md overflow-hidden">
      <CardHeader>
        <CardTitle>Please register for test</CardTitle>
        <CardDescription>
          Create your account to continue to the Coding vs Challenge
          Assessment.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={firstNameId}>First Name</Label>
              <Input
                id={firstNameId}
                name="firstName"
                type="text"
                autoComplete="given-name"
                placeholder="Enter your first name"
                className="w-full"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                aria-invalid={!!errors.firstName}
                aria-describedby={errors.firstName ? `${firstNameId}-error` : undefined}
              />
              {errors.firstName && (
                <p id={`${firstNameId}-error`} role="alert" className="text-sm text-destructive">
                  {errors.firstName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={lastNameId}>Last Name</Label>
              <Input
                id={lastNameId}
                name="lastName"
                type="text"
                autoComplete="family-name"
                placeholder="Enter your last name"
                className="w-full"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                aria-invalid={!!errors.lastName}
                aria-describedby={errors.lastName ? `${lastNameId}-error` : undefined}
              />
              {errors.lastName && (
                <p id={`${lastNameId}-error`} role="alert" className="text-sm text-destructive">
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={emailId}>Email</Label>
            <Input
              id={emailId}
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              className="w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? `${emailId}-error` : undefined}
            />
            {errors.email && (
              <p id={`${emailId}-error`} role="alert" className="text-sm text-destructive">
                {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={passwordId}>Password</Label>
            <Input
              id={passwordId}
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Create a password"
              className="w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? `${passwordId}-error` : undefined}
            />
            {errors.password && (
              <p id={`${passwordId}-error`} role="alert" className="text-sm text-destructive">
                {errors.password}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={phoneId}>
              Phone number <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Input
              id={phoneId}
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="Enter your phone number"
              className="w-full"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <Checkbox
                id={termsId}
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(checked)}
                aria-invalid={!!errors.terms}
                aria-describedby={errors.terms ? `${termsId}-error` : undefined}
                className="mt-0.5"
              />
              <Label htmlFor={termsId} className="text-sm font-normal leading-relaxed">
                I have read and accepted Coding vs Challenge Assessment&apos;s{" "}
                <Link href="/terms" className="font-medium underline underline-offset-4">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="font-medium underline underline-offset-4">
                  Privacy Policy
                </Link>
                .
              </Label>
            </div>
            {errors.terms && (
              <p id={`${termsId}-error`} role="alert" className="text-sm text-destructive">
                {errors.terms}
              </p>
            )}
          </div>

          {formError && (
            <p
              role="alert"
              className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400"
            >
              {formError}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Registering..." : "Register"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
              Login
            </Link>
          </p>
        </form>
      </CardContent>

      <BorderBeam duration={8} size={100} />
    </Card>
  );
}

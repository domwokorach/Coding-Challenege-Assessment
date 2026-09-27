"use client";

import { useId, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const topics = [
  "Assessment setup",
  "Custom coding challenges",
  "Team access",
  "Technical support",
  "Enterprise requirements",
  "Something else",
];

type FieldErrors = {
  name?: string;
  email?: string;
  company?: string;
  topic?: string;
  message?: string;
};

export function ContactForm() {
  const nameId = useId();
  const emailId = useId();
  const companyId = useId();
  const topicId = useId();
  const messageId = useId();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  function validate(): FieldErrors {
    const nextErrors: FieldErrors = {};

    if (!name.trim()) nextErrors.name = "Name is required.";
    if (!email.trim()) {
      nextErrors.email = "Work email is required.";
    } else if (!EMAIL_REGEX.test(email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }
    if (!company.trim()) nextErrors.company = "Company / organisation is required.";
    if (!topic) nextErrors.topic = "Please select a topic.";
    if (!message.trim()) {
      nextErrors.message = "Message is required.";
    } else if (message.trim().length < 10) {
      nextErrors.message = "Message must be at least 10 characters long.";
    }

    return nextErrors;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          company: company.trim(),
          topic,
          message: message.trim(),
        }),
      });
      const body = (await res.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!res.ok) {
        setFormError(body?.error ?? "Something went wrong. Please try again.");
        setIsLoading(false);
        return;
      }

      setIsSubmitted(true);
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isSubmitted) {
    return (
      <div
        role="status"
        className="flex flex-col items-center gap-3 py-10 text-center"
      >
        <CheckCircle2 className="size-10 text-primary" aria-hidden />
        <h3 className="text-lg font-semibold">Message sent</h3>
        <p className="max-w-xs text-sm leading-6 text-muted-foreground">
          Thanks for reaching out — our team will get back to you at{" "}
          <span className="font-medium text-foreground">{email}</span>{" "}
          shortly.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="flex flex-col gap-5"
      noValidate
    >
      <div className="space-y-1.5">
        <Label htmlFor={nameId}>Name</Label>
        <Input
          id={nameId}
          name="name"
          autoComplete="name"
          placeholder="Your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? `${nameId}-error` : undefined}
        />
        {errors.name && (
          <p id={`${nameId}-error`} role="alert" className="text-sm text-destructive">
            {errors.name}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={emailId}>Work email</Label>
        <Input
          id={emailId}
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
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

      <div className="space-y-1.5">
        <Label htmlFor={companyId}>Company / Organisation</Label>
        <Input
          id={companyId}
          name="company"
          autoComplete="organization"
          placeholder="Acme Inc."
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          aria-invalid={!!errors.company}
          aria-describedby={errors.company ? `${companyId}-error` : undefined}
        />
        {errors.company && (
          <p id={`${companyId}-error`} role="alert" className="text-sm text-destructive">
            {errors.company}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={topicId}>Topic</Label>
        <NativeSelect
          id={topicId}
          name="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          aria-invalid={!!errors.topic}
          aria-describedby={errors.topic ? `${topicId}-error` : undefined}
          className="w-full"
        >
          <NativeSelectOption value="" disabled>
            Select a topic
          </NativeSelectOption>
          {topics.map((t) => (
            <NativeSelectOption key={t} value={t}>
              {t}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        {errors.topic && (
          <p id={`${topicId}-error`} role="alert" className="text-sm text-destructive">
            {errors.topic}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={messageId}>Message</Label>
        <Textarea
          id={messageId}
          name="message"
          placeholder="Tell us about what you need help with..."
          className="min-h-28"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? `${messageId}-error` : undefined}
        />
        {errors.message && (
          <p id={`${messageId}-error`} role="alert" className="text-sm text-destructive">
            {errors.message}
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
        {isLoading ? "Sending..." : "Contact Us"}
      </Button>
    </form>
  );
}

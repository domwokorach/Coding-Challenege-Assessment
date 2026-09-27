/**
 * Single source of truth for plan pricing. The pricing page reads this for
 * display and the payment API reads it for the amount to charge — a client
 * can select a plan id, but never supply its own price.
 */
export type PlanId = "starter" | "professional" | "custom";

export type Plan = {
  id: PlanId;
  name: string;
  description: string;
  /** Price in cents for plans billed directly through Stripe. `null` means "not purchasable here" (free or contact sales). */
  priceCents: number | null;
  priceLabel: string;
  priceSuffix?: string;
  billingInterval: string;
  ctaLabel: string;
  ctaHref: string;
  highlighted: boolean;
  features: string[];
};

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "For individuals getting started with structured coding assessment.",
    priceCents: null,
    priceLabel: "$0",
    priceSuffix: "/month",
    billingInterval: "Free",
    ctaLabel: "Get started",
    ctaHref: "/register",
    highlighted: false,
    features: [
      "Coding assessments",
      "Core task library",
      "Automated scoring",
      "Assessment certificates",
      "Self-serve sign-up",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    description: "For teams running regular technical screening and evaluation.",
    priceCents: 4900,
    priceLabel: "$49",
    priceSuffix: "/month",
    billingInterval: "Monthly",
    ctaLabel: "Get started",
    ctaHref: "/register",
    highlighted: true,
    features: [
      "Everything in Starter",
      "Full task library",
      "CodeCheck performance analysis",
      "Candidate dashboard",
      "Certificate verification",
      "Priority support",
    ],
  },
  {
    id: "custom",
    name: "Custom",
    description: "For organisations that need tailored assessments at scale.",
    priceCents: null,
    priceLabel: "Let's talk",
    billingInterval: "Custom",
    ctaLabel: "Contact Us",
    ctaHref: "/contact",
    highlighted: false,
    features: [
      "Everything in Professional",
      "Custom assessment tasks",
      "Team administration",
      "Role-based access",
      "Dedicated onboarding",
      "Enterprise support",
    ],
  },
];

export function getPlan(id: string): Plan | undefined {
  return PLANS.find((plan) => plan.id === id);
}

/** A plan is purchasable through the in-page checkout only when it has a fixed, non-zero price. */
export function isPurchasablePlan(plan: Plan): plan is Plan & { priceCents: number } {
  return typeof plan.priceCents === "number" && plan.priceCents > 0;
}

export function formatCents(cents: number, currency = "usd"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

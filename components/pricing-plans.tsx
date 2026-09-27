"use client";

import { useState } from "react";
import { PricingCard } from "@/components/pricing-card";
import { PaymentCheckout } from "@/components/payment-checkout";
import { PLANS, isPurchasablePlan } from "@/lib/plans";

export function PricingPlans() {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const selectedPlan = PLANS.find((plan) => plan.id === selectedPlanId);
  const purchasableSelectedPlan =
    selectedPlan && isPurchasablePlan(selectedPlan) ? selectedPlan : undefined;

  return (
    <div className="flex flex-col gap-10">
      <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
        {PLANS.map((plan) => (
          <PricingCard
            key={plan.id}
            name={plan.name}
            description={plan.description}
            price={plan.priceLabel}
            priceSuffix={plan.priceSuffix}
            ctaLabel={plan.ctaLabel}
            ctaHref={isPurchasablePlan(plan) ? undefined : plan.ctaHref}
            onSelect={isPurchasablePlan(plan) ? () => setSelectedPlanId(plan.id) : undefined}
            features={plan.features}
            highlighted={plan.highlighted}
            selected={plan.id === selectedPlanId}
          />
        ))}
      </div>

      {purchasableSelectedPlan && (
        <PaymentCheckout
          key={purchasableSelectedPlan.id}
          plan={purchasableSelectedPlan}
          onClose={() => setSelectedPlanId(null)}
        />
      )}
    </div>
  );
}

import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PricingCard({
  name,
  description,
  price,
  priceSuffix,
  ctaLabel,
  ctaHref,
  onSelect,
  features,
  highlighted = false,
  selected = false,
}: {
  name: string;
  description: string;
  price: string;
  priceSuffix?: string;
  ctaLabel: string;
  ctaHref?: string;
  /** When provided, the CTA triggers this instead of navigating to `ctaHref` — used for plans purchased in-page. */
  onSelect?: () => void;
  features: string[];
  highlighted?: boolean;
  selected?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-4xl border p-8",
        highlighted
          ? "border-primary/30 bg-primary text-primary-foreground shadow-lg shadow-primary/20 dark:shadow-primary/10"
          : "border-border/60 bg-card ring-1 ring-foreground/5 dark:ring-foreground/10",
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
    >
      {highlighted && (
        <span className="absolute -top-3 left-8 rounded-full bg-foreground px-3 py-1 text-xs font-semibold text-background">
          Most popular
        </span>
      )}

      <h3 className="text-lg font-semibold">{name}</h3>
      <p
        className={cn(
          "mt-1.5 text-sm leading-6",
          highlighted ? "text-primary-foreground/80" : "text-muted-foreground"
        )}
      >
        {description}
      </p>

      <div className="mt-6 flex items-baseline gap-1">
        <span className="text-4xl font-bold tracking-tight">{price}</span>
        {priceSuffix && (
          <span
            className={cn(
              "text-sm",
              highlighted ? "text-primary-foreground/70" : "text-muted-foreground"
            )}
          >
            {priceSuffix}
          </span>
        )}
      </div>

      {onSelect ? (
        <Button
          size="lg"
          variant={highlighted ? "secondary" : "outline"}
          className="mt-6 w-full"
          onClick={onSelect}
          aria-pressed={selected}
        >
          {ctaLabel}
        </Button>
      ) : (
        <Button
          size="lg"
          variant={highlighted ? "secondary" : "outline"}
          className="mt-6 w-full"
          nativeButton={false}
          render={<Link href={ctaHref!} />}
        >
          {ctaLabel}
        </Button>
      )}

      <ul className="mt-8 flex flex-col gap-3 text-sm">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5">
            <Check
              className={cn(
                "mt-0.5 size-4 shrink-0",
                highlighted ? "text-primary-foreground" : "text-primary"
              )}
              aria-hidden
            />
            <span
              className={cn(
                highlighted ? "text-primary-foreground/90" : "text-foreground/90"
              )}
            >
              {feature}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

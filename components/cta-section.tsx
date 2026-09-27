import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CtaSection({
  title,
  description,
  ctaLabel,
  ctaHref,
  className,
}: {
  title: string;
  description?: string;
  ctaLabel: string;
  ctaHref: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-4xl border border-border/60 bg-gradient-to-br from-primary/10 via-card to-card p-10 text-center ring-1 ring-foreground/5 sm:p-14 dark:ring-foreground/10",
        className
      )}
    >
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
        {title}
      </h2>
      {description && (
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
          {description}
        </p>
      )}
      <Button
        size="lg"
        className="mt-7 group"
        nativeButton={false}
        render={<Link href={ctaHref} />}
      >
        {ctaLabel}
        <ArrowRight
          className="size-4 transition-transform group-hover:translate-x-0.5"
          aria-hidden
          data-icon="inline-end"
        />
      </Button>
    </div>
  );
}

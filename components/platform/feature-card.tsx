import type { LucideIcon } from "lucide-react";
import { GlareHover } from "@/registry/magicui/glare-hover";
import { cn } from "@/lib/utils";

export function FeatureCard({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <GlareHover
      width="100%"
      height="100%"
      background="transparent"
      color="#ffffff"
      opacity={0.15}
      size={220}
      duration={800}
      className={cn(
        "block cursor-default rounded-3xl border border-border/60 bg-card p-6 text-left ring-1 ring-foreground/5 transition-colors hover:border-border dark:ring-foreground/10",
        className
      )}
    >
      <div className="mb-4 flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="size-5" aria-hidden />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </GlareHover>
  );
}

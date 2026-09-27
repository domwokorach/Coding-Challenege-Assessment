import { cn } from "@/lib/utils";

export function RibbonBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]",
        className
      )}
    >
      <div className="absolute -top-1/2 left-1/2 h-[140%] w-[60%] -translate-x-1/2 rotate-12 bg-gradient-to-b from-primary/15 via-primary/5 to-transparent blur-2xl motion-safe:animate-[ribbon-drift_16s_ease-in-out_infinite]" />
      <div className="absolute -top-1/3 left-1/2 h-[130%] w-[35%] -translate-x-[70%] -rotate-6 bg-gradient-to-b from-chart-2/20 via-transparent to-transparent blur-2xl motion-safe:animate-[ribbon-drift_20s_ease-in-out_infinite_reverse]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,transparent_0%,var(--color-background)_75%)]" />
    </div>
  );
}

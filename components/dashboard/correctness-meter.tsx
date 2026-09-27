"use client";

import {
  Progress as AnimatedProgressRoot,
  ProgressIndicator as AnimatedProgressIndicator,
} from "@/components/animate-ui/primitives/radix/progress";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { clampPercent } from "@/lib/assessment/scoring";
import { cn } from "@/lib/utils";

/**
 * Correctness score as an Animate UI progress bar (npx shadcn add
 * @animate-ui/components-radix-progress). Renders its own numeric percentage
 * next to the bar rather than relying on colour/fill alone, exposes the
 * value to assistive tech via Radix's built-in progressbar semantics plus an
 * explicit aria-label, and skips the fill animation for
 * prefers-reduced-motion.
 */
export function CorrectnessMeter({
  score,
  className,
}: {
  score: number;
  className?: string;
}) {
  const clamped = clampPercent(score);
  const reducedMotion = useReducedMotion();

  return (
    <div className={cn(className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-600 dark:text-zinc-400">Correctness</span>
        <span
          className="font-medium text-zinc-900 dark:text-zinc-100"
          aria-hidden
        >
          {clamped}%
        </span>
      </div>
      <AnimatedProgressRoot
        value={clamped}
        aria-label="Correctness"
        aria-valuetext={`${clamped}%`}
        className="relative mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
      >
        <AnimatedProgressIndicator
          className="h-full w-full flex-1 rounded-full bg-emerald-500 dark:bg-emerald-400"
          transition={reducedMotion ? { duration: 0 } : undefined}
        />
      </AnimatedProgressRoot>
    </div>
  );
}

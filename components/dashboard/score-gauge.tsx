"use client";

import { Cell, Pie, PieChart } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { NumberTicker } from "@/registry/magicui/number-ticker";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { clampPercent } from "@/lib/assessment/scoring";
import { cn } from "@/lib/utils";

const chartConfig = {
  score: { label: "Score" },
  remaining: { label: "Remaining" },
} satisfies ChartConfig;

/**
 * Shared circular score gauge — the Candidate Report's "Total Score" card
 * and each task's "Task Score" in Task Insights are the same visual, just
 * at two sizes, so both render through this one chart instead of
 * duplicating the recharts setup.
 */
export function ScoreGauge({
  score,
  size = "lg",
  label = "Overall",
  emptyText,
  className,
}: {
  score: number;
  size?: "sm" | "lg";
  label?: string;
  /** When set, renders this text in place of a percentage — e.g. while evaluation is in progress. */
  emptyText?: string;
  className?: string;
}) {
  const clamped = clampPercent(score);
  const reducedMotion = useReducedMotion();
  const empty = Boolean(emptyText);

  const chartData = [
    { name: "score", value: empty ? 0 : clamped },
    { name: "remaining", value: empty ? 100 : Math.max(0, 100 - clamped) },
  ];

  return (
    <div
      className={cn(
        "relative mx-auto aspect-square w-full",
        size === "sm" ? "max-w-28" : "max-w-52",
        className
      )}
      aria-live="polite"
    >
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square w-full [&_.recharts-surface]:overflow-visible"
        aria-hidden
      >
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius="72%"
            outerRadius="100%"
            startAngle={90}
            endAngle={-270}
            strokeWidth={0}
            isAnimationActive={!reducedMotion}
          >
            <Cell className="fill-emerald-500 dark:fill-emerald-400" />
            <Cell className="fill-zinc-200 dark:fill-zinc-800" />
          </Pie>
        </PieChart>
      </ChartContainer>

      {/* Real text, not an SVG label — visible at a glance and readable by
          assistive tech without extra aria plumbing. */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-3 text-center">
        {empty ? (
          <span
            className={cn(
              "font-medium text-zinc-600 dark:text-zinc-400",
              size === "sm" ? "text-[11px] leading-tight" : "text-sm"
            )}
          >
            {emptyText}
          </span>
        ) : (
          <>
            <span
              className={cn(
                "flex items-baseline font-bold tabular-nums text-zinc-900 dark:text-zinc-100",
                size === "sm" ? "text-xl" : "text-3xl"
              )}
            >
              {reducedMotion ? (
                clamped
              ) : (
                <NumberTicker value={clamped} className="text-inherit" />
              )}
              %
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-500">
              {label}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

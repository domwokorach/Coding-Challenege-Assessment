"use client";

import { Cell, Pie, PieChart } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { CorrectnessMeter } from "@/components/correctness-meter";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { clampPercent, formatDurationMs } from "@/lib/assessment-results";
import { cn } from "@/lib/utils";

const chartConfig = {
  score: { label: "Score" },
  remaining: { label: "Remaining" },
} satisfies ChartConfig;

/**
 * Overall Score as a donut (adapted from shadcn's ChartPieDonutActive
 * example, stripped of the browser/visitor demo data and hover-driven active
 * sector — a static two-slice score/remaining split doesn't need it). The
 * percentage in the center is real DOM text overlaid on the chart, not an
 * SVG label, so it's readable by assistive tech without any special-casing;
 * the sentence below it spells out the same value for anyone not perceiving
 * the chart visually at all.
 */
export function OverallScoreDonut({
  score,
  correctnessScore,
  totalAssessmentTimeMs,
  className,
}: {
  score: number;
  correctnessScore: number;
  totalAssessmentTimeMs: number | null;
  className?: string;
}) {
  const clamped = clampPercent(score);
  const reducedMotion = useReducedMotion();

  const chartData = [
    { name: "score", value: clamped },
    { name: "remaining", value: Math.max(0, 100 - clamped) },
  ];

  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900",
        className
      )}
    >
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Overall Score
      </h3>

      <div className="relative mx-auto mt-2 aspect-square w-full max-w-52">
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

        {/* Real text, not an SVG label — visible to sighted users at a
            glance and to screen readers without any aria plumbing. */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
            {clamped}%
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-500">
            Overall
          </span>
        </div>
      </div>

      <p className="mt-3 text-center text-sm text-zinc-600 dark:text-zinc-400">
        Overall score: {clamped} out of 100.
      </p>

      <CorrectnessMeter score={correctnessScore} className="mt-4" />

      <div className="mt-4 border-t border-zinc-200 pt-3 text-center dark:border-zinc-800">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Total Assessment Time
        </p>
        <p className="mt-0.5 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {totalAssessmentTimeMs !== null
            ? formatDurationMs(totalAssessmentTimeMs)
            : "Not available yet"}
        </p>
      </div>
    </div>
  );
}

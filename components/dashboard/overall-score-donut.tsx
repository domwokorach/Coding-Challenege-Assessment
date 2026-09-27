"use client";

import { ChartNoAxesColumnIncreasing } from "lucide-react";
import { CorrectnessMeter } from "@/components/dashboard/correctness-meter";
import { ScoreGauge } from "@/components/dashboard/score-gauge";
import { clampPercent, formatDurationMs } from "@/lib/assessment/scoring";
import { cn } from "@/lib/utils";

/**
 * Total Score card — mirrors the reference report's right-hand "Total
 * score" panel: a circular gauge with the percentage centered, or (while
 * evaluation is still running) a placeholder icon and "will be shown once
 * evaluated" caption instead of a misleading 0%.
 */
export function OverallScoreDonut({
  score,
  correctnessScore,
  totalAssessmentTimeMs,
  evaluating = false,
  className,
}: {
  score: number;
  correctnessScore: number;
  totalAssessmentTimeMs: number | null;
  /** True while any task is still being evaluated — hides the percentage rather than showing a misleading 0%. */
  evaluating?: boolean;
  className?: string;
}) {
  const clamped = clampPercent(score);

  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900",
        className
      )}
    >
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Total Score
      </h3>

      {evaluating ? (
        <div className="mt-2 flex flex-col items-center gap-2 py-4">
          <ChartNoAxesColumnIncreasing
            className="size-10 text-zinc-300 dark:text-zinc-700"
            aria-hidden
          />
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-500">
            The score will be shown once evaluated
          </p>
        </div>
      ) : (
        <div className="mt-2">
          <ScoreGauge score={clamped} label="Overall" />
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {evaluating
          ? "Your score will appear when evaluation is complete."
          : `Overall score: ${clamped} out of 100.`}
      </p>

      {!evaluating && <CorrectnessMeter score={correctnessScore} className="mt-4" />}

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

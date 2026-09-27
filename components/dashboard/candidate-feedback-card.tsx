import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OverallResult, TaskResult } from "@/lib/assessment/scoring";

/**
 * Feedback generated purely from existing scoring facts (per-task pass/fail
 * counts and overall completion) — no sentiment ("excellent"/"poor") is
 * derived from a percentage, only factual statements of what passed, what
 * didn't, and what's worth revisiting.
 */
function buildFeedback(tasks: TaskResult[], overall: OverallResult) {
  const attempted = tasks.filter((t) => t.totalCount > 0);
  const strong: string[] = [];
  const review: string[] = [];

  for (const task of attempted) {
    if (task.scorePercent === 100) {
      strong.push(
        `Passed ${task.passedCount}/${task.totalCount} correctness tests on ${task.title}.`
      );
    } else {
      review.push(
        `${task.title} passed ${task.passedCount}/${task.totalCount} correctness tests — review the failing case before your next attempt.`
      );
    }
  }

  if (overall.tasksTotal > 0 && overall.tasksCompleted === overall.tasksTotal) {
    strong.push("Completed all required tasks.");
  }

  return { attempted, strong, review };
}

export function CandidateFeedbackCard({
  tasks,
  overall,
  className,
}: {
  tasks: TaskResult[];
  overall: OverallResult;
  className?: string;
}) {
  const { attempted, strong, review } = buildFeedback(tasks, overall);

  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900",
        className
      )}
    >
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Candidate Feedback
      </h3>

      {attempted.length === 0 ? (
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Run a task&apos;s tests to see feedback here.
        </p>
      ) : (
        <div className="mt-3 flex flex-col gap-4">
          {strong.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Strong areas
              </h4>
              <ul className="mt-2 flex flex-col gap-1.5">
                {strong.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2
                      className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                      aria-hidden
                    />
                    <span className="text-zinc-700 dark:text-zinc-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {review.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Review
              </h4>
              <ul className="mt-2 flex flex-col gap-1.5">
                {review.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <AlertTriangle
                      className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400"
                      aria-hidden
                    />
                    <span className="text-zinc-700 dark:text-zinc-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

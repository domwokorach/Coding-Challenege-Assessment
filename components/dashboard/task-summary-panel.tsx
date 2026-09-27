"use client";

import { useId } from "react";
import { CheckCircle2, ChevronDown, Code2, TriangleAlert, XCircle } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { formatDurationMs, type TaskResult } from "@/lib/assessment/scoring";
import { formatDateTime } from "@/lib/assessment/progress";

/**
 * `status` reflects only the most recent test run and resets to "ready" if
 * a candidate edits their code again after passing/failing — it does not by
 * itself mean the task was never submitted. `completed`/`completedAt` is
 * the durable submission record, so a "ready" status with a completion
 * record still needs to read as submitted, just without live pass/fail
 * detail to show.
 */
function CodeCheckBadge({ task }: { task: TaskResult }) {
  if (task.status === "passed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
        <CheckCircle2 className="size-3.5" aria-hidden />
        Passed
      </span>
    );
  }
  if (task.status === "failed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-500/15 dark:text-red-400">
        <XCircle className="size-3.5" aria-hidden />
        Failed
      </span>
    );
  }
  if (task.completed || task.completedAt) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
        Submitted
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
      Not run
    </span>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-start whitespace-nowrap sm:items-end">
      <dt className="text-[10px] font-medium uppercase tracking-normal text-zinc-500 dark:text-zinc-500">
        {label}
      </dt>
      <dd className="text-sm font-medium tabular-nums text-zinc-900 dark:text-zinc-100">
        {value}
      </dd>
    </div>
  );
}

function TaskRow({ task }: { task: TaskResult }) {
  const panelId = useId();
  const attempted = task.totalCount > 0;
  const taskScoreLabel = attempted ? `${task.scorePercent}%` : "—";
  const timeSpentLabel =
    task.timeSpentMs !== null ? formatDurationMs(task.timeSpentMs) : "—";

  return (
    <Collapsible className="rounded-xl border border-zinc-200 dark:border-zinc-800">
      <CollapsibleTrigger
        aria-controls={panelId}
        className="flex w-full flex-col gap-3 rounded-xl px-4 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 sm:flex-row sm:items-center sm:justify-between dark:focus-visible:ring-zinc-100 dark:focus-visible:ring-offset-zinc-950 [&[data-panel-open]_svg[data-chevron]]:rotate-180"
      >
        <div className="flex min-w-0 items-center gap-2">
          <ChevronDown
            data-chevron
            className="size-4 shrink-0 text-zinc-400 transition-transform duration-200 motion-reduce:transition-none dark:text-zinc-600"
            aria-hidden
          />
          <Code2
            className="size-4 shrink-0 text-zinc-400 dark:text-zinc-600"
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {task.title}
              {task.runtimeError && (
                <TriangleAlert
                  className="size-3.5 shrink-0 text-amber-500 dark:text-amber-400"
                  aria-label="This task has a compiler/runtime error"
                />
              )}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-500">
              {task.language}
            </p>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 pl-6 sm:flex sm:shrink-0 sm:items-center sm:gap-6 sm:pl-0">
          <Metric label="Effective time spent" value={timeSpentLabel} />
          <Metric label="Score" value={taskScoreLabel} />
        </dl>
      </CollapsibleTrigger>

      <CollapsibleContent
        id={panelId}
        className="h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-200 ease-out motion-reduce:transition-none data-ending-style:h-0 data-starting-style:h-0"
      >
        <div className="flex flex-col gap-3 border-t border-zinc-200 px-4 py-3 text-sm dark:border-zinc-800">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-zinc-600 dark:text-zinc-400">Language</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {task.language}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-zinc-600 dark:text-zinc-400">
              Correctness test cases
            </span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {attempted
                ? `Passed ${task.passedCount} out of ${task.totalCount}`
                : "Not run yet"}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-zinc-600 dark:text-zinc-400">Submission</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {task.completedAt ? formatDateTime(task.completedAt) : "Not submitted"}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-zinc-600 dark:text-zinc-400">CodeCheck</span>
            <CodeCheckBadge task={task} />
          </div>
          {task.runtimeError && (
            <p className="rounded-md bg-red-500/10 px-2 py-1.5 font-mono text-xs text-red-600 dark:text-red-400">
              {task.runtimeError}
            </p>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function TaskSummaryPanel({
  tasks,
  className,
}: {
  tasks: TaskResult[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900",
        className
      )}
    >
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Tasks Summary
      </h3>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Select a task to see its correctness tests, submission time, and
        CodeCheck result.
      </p>
      <div className="mt-4 flex flex-col gap-2">
        {tasks.map((task) => (
          <TaskRow key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}

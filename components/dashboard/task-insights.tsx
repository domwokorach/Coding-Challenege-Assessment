"use client";

import Link from "next/link";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { CorrectnessMeter } from "@/components/dashboard/correctness-meter";
import { formatDurationMs, type TaskResult } from "@/lib/assessment/scoring";
import { cn } from "@/lib/utils";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-100 py-2 text-sm last:border-0 dark:border-zinc-800/60">
      <span className="text-zinc-500 dark:text-zinc-500">{label}</span>
      <span className="font-medium text-zinc-900 dark:text-zinc-100">
        {value}
      </span>
    </div>
  );
}

function TaskDetail({ task }: { task: TaskResult }) {
  const attempted = task.totalCount > 0;
  const timeSpentLabel =
    task.timeSpentMs !== null ? formatDurationMs(task.timeSpentMs) : "Not available";

  return (
    <div className="flex flex-col gap-4">
      <div>
        <DetailRow label="Task" value={task.title} />
        <DetailRow label="Difficulty" value={task.difficulty} />
        <DetailRow label="Language" value={task.language} />
        <DetailRow label="Time Spent" value={timeSpentLabel} />
      </div>

      {attempted ? (
        <CorrectnessMeter score={task.scorePercent} />
      ) : (
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-600 dark:text-zinc-400">Correctness</span>
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            Not available
          </span>
        </div>
      )}

      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-600 dark:text-zinc-400">Performance</span>
        <span className="font-medium text-zinc-900 dark:text-zinc-100">
          Not available
        </span>
      </div>

      <div className="flex flex-col items-center gap-0.5 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Task Score
        </p>
        <p className="text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
          {attempted ? `${task.scorePercent}%` : "—"}
        </p>
      </div>

      <Link
        href={`/dashboard/report/solution/${task.slug}`}
        className="self-start rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
      >
        View submitted solution
      </Link>
    </div>
  );
}

export function TaskInsights({
  tasks,
  className,
}: {
  tasks: TaskResult[];
  className?: string;
}) {
  if (tasks.length === 0) return null;

  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900",
        className
      )}
    >
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Task Insights
      </h3>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Select a task to see its difficulty, time spent, correctness, and
        score.
      </p>

      <Tabs defaultValue={tasks[0].slug} className="mt-4">
        <TabsList className="flex-wrap">
          {tasks.map((task) => (
            <TabsTrigger key={task.slug} value={task.slug}>
              {task.title}
            </TabsTrigger>
          ))}
        </TabsList>
        {tasks.map((task) => (
          <TabsContent key={task.slug} value={task.slug} className="mt-4">
            <TaskDetail task={task} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

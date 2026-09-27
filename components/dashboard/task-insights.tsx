"use client";

import Link from "next/link";
import { Code2 } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ScoreGauge } from "@/components/dashboard/score-gauge";
import { formatDurationMs, type TaskResult } from "@/lib/assessment/scoring";
import { cn } from "@/lib/utils";

const DIFFICULTY_CLASSES: Record<TaskResult["difficulty"], string> = {
  Beginner:
    "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  Intermediate:
    "bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  Advanced:
    "bg-red-500/10 text-red-700 dark:bg-red-500/15 dark:text-red-400",
};

function Pill({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        className
      )}
    >
      {children}
    </span>
  );
}

function MetaField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
        {label}
      </p>
      {children}
    </div>
  );
}

function TaskDetail({ task, index }: { task: TaskResult; index: number }) {
  const attempted = task.totalCount > 0;
  const timeSpentLabel =
    task.timeSpentMs !== null ? formatDurationMs(task.timeSpentMs) : "Not available";

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_auto]">
      <div className="flex flex-col gap-4">
        <div>
          <h4 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {index}. {task.title}
          </h4>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {task.description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <MetaField label="Difficulty">
            <Pill className={DIFFICULTY_CLASSES[task.difficulty]}>
              {task.difficulty}
            </Pill>
          </MetaField>
          <MetaField label="Task Type">
            <Pill className="bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              Training
            </Pill>
          </MetaField>
          <MetaField label="Language &amp; Technologies">
            <Pill className="bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              <Code2 className="size-3.5" aria-hidden />
              {task.language}
            </Pill>
          </MetaField>
        </div>

        <MetaField label="Recommended Time">
          <Pill className="bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {task.recommendedMinutes} Minutes
          </Pill>
        </MetaField>

        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          Time spent:{" "}
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            {timeSpentLabel}
          </span>
        </div>

        <Link
          href={`/dashboard/report/solution/${task.slug}`}
          className="self-start rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          View submitted solution
        </Link>
      </div>

      <div className="flex flex-col items-center gap-2 lg:w-40">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Task Score
        </p>
        <ScoreGauge
          score={task.scorePercent}
          size="sm"
          label="Task Score"
          emptyText={attempted ? undefined : "Not run yet"}
        />
      </div>
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
    <div className={cn("flex flex-col gap-4", className)}>
      <div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Task Insights
        </h3>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Select a task to see its difficulty, time spent, and score.
        </p>
      </div>

      <Tabs defaultValue={tasks[0].slug}>
        <TabsList variant="line" className="h-auto flex-wrap gap-1 border-b border-zinc-200 bg-transparent p-0 dark:border-zinc-800">
          {tasks.map((task) => (
            <TabsTrigger
              key={task.slug}
              value={task.slug}
              className="gap-1.5 rounded-full border border-transparent bg-transparent px-3 py-1.5 text-sm text-zinc-600 data-active:border-transparent data-active:bg-blue-500/10 data-active:text-blue-700 dark:text-zinc-400 dark:data-active:bg-blue-500/15 dark:data-active:text-blue-400"
            >
              <Code2 className="size-3.5" aria-hidden />
              {task.title}
            </TabsTrigger>
          ))}
        </TabsList>
        {tasks.map((task, i) => (
          <TabsContent key={task.slug} value={task.slug} className="mt-4">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <TaskDetail task={task} index={i + 1} />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

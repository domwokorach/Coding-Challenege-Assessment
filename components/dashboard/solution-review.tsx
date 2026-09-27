"use client";

import { CodeEditor } from "@/components/assessment/code-editor";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import type { Challenge } from "@/lib/assessment/challenges";
import { formatDateTime } from "@/lib/assessment/progress";
import type { TaskResult } from "@/lib/assessment/scoring";

/**
 * `completedAt`/`completed` (not the current `status`) is the authoritative
 * "was this ever submitted" signal — a candidate can edit their code again
 * after passing, which resets `status` to "ready" without clearing the
 * earlier completion record. Trusting `status` alone would misreport an
 * already-submitted task as "Not submitted".
 */
function submissionTypeLabel(task: TaskResult): string {
  if (task.status === "running") return "Evaluation in progress";
  if (task.completed || task.completedAt) return "Solution submitted";
  return "Not submitted";
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-1.5 text-sm">
      <span className="text-zinc-500 dark:text-zinc-500">{label}:</span>
      <span className="font-medium text-zinc-900 dark:text-zinc-100">
        {value}
      </span>
    </div>
  );
}

function DescriptionPanel({ challenge }: { challenge: Challenge }) {
  return (
    <div className="h-full min-h-0 overflow-y-auto p-5">
      <span className="inline-block rounded-md border border-zinc-300 px-2 py-0.5 text-xs uppercase tracking-wide text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
        {challenge.category}
      </span>
      <h3 className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        {challenge.title}
      </h3>

      <h4 className="mt-5 text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
        Description
      </h4>
      <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        {challenge.description}
      </p>

      <h4 className="mt-5 text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
        Examples
      </h4>
      <div className="mt-2 space-y-2 font-mono text-xs">
        <div className="rounded-md bg-zinc-100 px-3 py-2 dark:bg-zinc-800">
          <p className="text-zinc-500 dark:text-zinc-500">Input</p>
          <p className="text-zinc-900 dark:text-zinc-100">
            {challenge.browserInput}
          </p>
        </div>
        <div className="rounded-md bg-zinc-100 px-3 py-2 dark:bg-zinc-800">
          <p className="text-zinc-500 dark:text-zinc-500">Expected output</p>
          <p className="text-zinc-900 dark:text-zinc-100">
            {challenge.browserExpected}
          </p>
        </div>
      </div>

      <h4 className="mt-5 text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
        Constraints &amp; Requirements
      </h4>
      <ul className="mt-2 space-y-1.5">
        {challenge.requirements.map((req) => (
          <li
            key={req}
            className="flex gap-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400"
          >
            <span aria-hidden className="text-zinc-400 dark:text-zinc-600">
              •
            </span>
            <span>{req}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SolutionPanel({ code }: { code: string }) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b border-zinc-200 bg-zinc-50 px-4 py-2 dark:border-zinc-800 dark:bg-zinc-900/40">
        <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
          Read-only
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-500">
          This is the candidate&apos;s submitted code and cannot be edited.
        </span>
      </div>
      <div className="min-h-0 flex-1">
        <CodeEditor value={code} readOnly />
      </div>
    </div>
  );
}

/**
 * Read-only "Submitted Solution Review" — the original task description next
 * to the candidate's actual submitted code (never editable). Side-by-side on
 * desktop, a Task/Solution tab switch on narrow screens per the responsive
 * spec (never squeezing the full code editor into half a mobile viewport).
 */
export function SolutionReview({
  challenge,
  task,
  code,
}: {
  challenge: Challenge;
  task: TaskResult;
  code: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Solution Review
        </h2>
      </div>

      {/* Desktop / tablet: side-by-side panels */}
      <div className="hidden overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 md:grid md:h-[560px] md:grid-cols-2">
        <div className="border-r border-zinc-200 dark:border-zinc-800">
          <DescriptionPanel challenge={challenge} />
        </div>
        <SolutionPanel code={code} />
      </div>

      {/* Mobile: Task / Solution tabs */}
      <div className="md:hidden">
        <Tabs defaultValue="task">
          <TabsList>
            <TabsTrigger value="task">Task</TabsTrigger>
            <TabsTrigger value="solution">Solution</TabsTrigger>
          </TabsList>
          <TabsContent
            value="task"
            className="mt-3 h-[420px] overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800"
          >
            <DescriptionPanel challenge={challenge} />
          </TabsContent>
          <TabsContent
            value="solution"
            className="mt-3 h-[420px] overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800"
          >
            <SolutionPanel code={code} />
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/40">
        <MetaItem label="Task" value={challenge.title} />
        <MetaItem label="Language" value={task.language} />
        {task.completedAt && (
          <MetaItem label="Submitted" value={formatDateTime(task.completedAt)} />
        )}
        <MetaItem label="Type" value={submissionTypeLabel(task)} />
      </div>
    </div>
  );
}

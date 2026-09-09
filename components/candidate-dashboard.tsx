import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  formatDurationMs,
  type AssessmentResults,
  type TaskResult,
} from "@/lib/assessment-results";
import { formatDateTime } from "@/lib/progress";

function StatusBadge({ task }: { task: TaskResult }) {
  if (task.completed) {
    return (
      <Badge className="bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
        Completed
      </Badge>
    );
  }
  if (task.status === "failed") {
    return (
      <Badge className="bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400">
        Failed
      </Badge>
    );
  }
  return (
    <Badge className="bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
      Incomplete
    </Badge>
  );
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        {title}
      </h2>
      {description && (
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {description}
        </p>
      )}
      <div className="mt-5 flex flex-col gap-4">{children}</div>
    </section>
  );
}

export function CandidateDashboard({
  learnerName,
  results,
}: {
  learnerName: string;
  results: AssessmentResults;
}) {
  const { tasks, overall, correctness, performance } = results;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl dark:text-zinc-100">
          Candidate Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Assessment performance for{" "}
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            {learnerName || "this candidate"}
          </span>
          .
        </p>
      </div>

      {/* Tasks */}
      <SectionCard
        title="Tasks"
        description="Every task in this assessment and its current state."
      >
        <ul className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {task.category} — {task.title}
                </p>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-500">
                  {task.completedAt
                    ? `Submitted ${formatDateTime(task.completedAt)}`
                    : "Not yet submitted"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {task.totalCount > 0
                    ? `${task.scorePercent}%`
                    : "No attempts"}
                </span>
                <StatusBadge task={task} />
              </div>
            </li>
          ))}
        </ul>
      </SectionCard>

      {/* CodeCheck */}
      <SectionCard
        title="CodeCheck"
        description="Automated test results for each task's submitted code. Individual test cases and expected outputs are kept private."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {task.title}
              </p>
              <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div>
                  <dt className="text-xs text-zinc-500">Passed</dt>
                  <dd className="text-base font-semibold text-emerald-600 dark:text-emerald-400">
                    {task.passedCount}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-500">Failed</dt>
                  <dd className="text-base font-semibold text-red-600 dark:text-red-400">
                    {task.failedCount}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-500">Total</dt>
                  <dd className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    {task.totalCount}
                  </dd>
                </div>
              </dl>
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                Validation:{" "}
                <span
                  className={
                    task.status === "passed"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : task.status === "failed"
                        ? "text-red-600 dark:text-red-400"
                        : "text-zinc-500"
                  }
                >
                  {task.status === "passed"
                    ? "Valid"
                    : task.status === "failed"
                      ? "Invalid"
                      : "Not run"}
                </span>
              </p>
              {task.runtimeError && (
                <p className="mt-2 rounded-md bg-red-500/10 px-2 py-1.5 font-mono text-xs text-red-600 dark:text-red-400">
                  {task.runtimeError}
                </p>
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Task Details */}
      <SectionCard
        title="Task Details"
        description="Task metadata and submission details for each completed task."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tasks
            .filter((t) => t.completed)
            .map((task) => (
              <div
                key={task.id}
                className="rounded-xl border border-zinc-200 p-4 text-sm dark:border-zinc-800"
              >
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {task.title}
                </p>
                <dl className="mt-3 flex flex-col gap-1.5 text-zinc-600 dark:text-zinc-400">
                  <div className="flex justify-between gap-2">
                    <dt>Category</dt>
                    <dd className="text-zinc-900 dark:text-zinc-100">
                      {task.category}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>Difficulty</dt>
                    <dd className="text-zinc-900 dark:text-zinc-100">
                      {task.difficulty}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>Language</dt>
                    <dd className="text-zinc-900 dark:text-zinc-100">
                      {task.language}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>Status</dt>
                    <dd className="text-emerald-600 dark:text-emerald-400">
                      Completed
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>Attempts</dt>
                    <dd className="text-zinc-900 dark:text-zinc-100">
                      {task.attempts}
                    </dd>
                  </div>
                </dl>
              </div>
            ))}
          {tasks.every((t) => !t.completed) && (
            <p className="text-sm text-zinc-500 dark:text-zinc-500">
              No tasks completed yet.
            </p>
          )}
        </div>
      </SectionCard>

      {/* Task Score */}
      <SectionCard title="Task Score" description="Score per task and overall.">
        <ul className="flex flex-col gap-3">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-center justify-between gap-3">
              <span className="text-sm text-zinc-700 dark:text-zinc-300">
                {task.title}
              </span>
              <span className="text-sm font-medium tabular-nums text-zinc-900 dark:text-zinc-100">
                {task.passedCount} / {task.totalCount || "—"}
                {task.totalCount > 0 && ` — ${task.scorePercent}%`}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Overall Assessment Score
          </p>
          <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {overall.scoreEarned} / {overall.scoreMax} — {overall.scorePercent}%
          </p>
        </div>
      </SectionCard>

      {/* Correctness */}
      <SectionCard
        title="Correctness"
        description="How accurately the submitted solutions matched expected behaviour, based on automated test results."
      >
        <div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">Passed tests</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {correctness.passedPercent}%
            </span>
          </div>
          <Progress
            value={correctness.passedPercent}
            aria-label="Passed test percentage"
            className="mt-2 [&_[data-slot=progress-track]]:h-2 [&_[data-slot=progress-track]]:bg-zinc-200 [&_[data-slot=progress-indicator]]:bg-emerald-500 dark:[&_[data-slot=progress-track]]:bg-zinc-800 dark:[&_[data-slot=progress-indicator]]:bg-emerald-400"
          />
        </div>
        <div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">Failed tests</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {correctness.failedPercent}%
            </span>
          </div>
          <Progress
            value={correctness.failedPercent}
            aria-label="Failed test percentage"
            className="mt-2 [&_[data-slot=progress-track]]:h-2 [&_[data-slot=progress-track]]:bg-zinc-200 [&_[data-slot=progress-indicator]]:bg-red-500 dark:[&_[data-slot=progress-track]]:bg-zinc-800 dark:[&_[data-slot=progress-indicator]]:bg-red-400"
          />
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Correctness score:{" "}
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            {correctness.correctnessScore}%
          </span>
        </p>
      </SectionCard>

      {/* Performance */}
      <SectionCard
        title="Performance"
        description="Metrics actually collected by this assessment system."
      >
        {performance.totalAssessmentTimeMs !== null ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Total Assessment Time
            </p>
            <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {formatDurationMs(performance.totalAssessmentTimeMs)}
            </p>
          </div>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-500">
            Total time will be available once the assessment is completed.
          </p>
        )}
        <p className="text-xs text-zinc-500 dark:text-zinc-500">
          Execution time, memory usage, and code-efficiency scoring are not
          currently measured by this assessment system.
        </p>
      </SectionCard>
    </div>
  );
}

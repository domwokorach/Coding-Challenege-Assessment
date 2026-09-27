import { TaskSummaryPanel } from "@/components/task-summary-panel";
import { OverallScoreDonut } from "@/components/overall-score-donut";
import { CandidateFeedbackCard } from "@/components/candidate-feedback-card";
import type { AssessmentResults } from "@/lib/assessment-results";

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
        <p className="mt-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Your assessment summary
        </p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Review your task scores, correctness, performance, and feedback for{" "}
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            {learnerName || "this candidate"}
          </span>
          .
        </p>
      </div>

      <section aria-labelledby="candidate-feedback-heading">
        <h2
          id="candidate-feedback-heading"
          className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
        >
          Candidate Feedback
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <TaskSummaryPanel tasks={tasks} />

          <div className="flex flex-col gap-6">
            <OverallScoreDonut
              score={overall.scorePercent}
              correctnessScore={correctness.correctnessScore}
              totalAssessmentTimeMs={performance.totalAssessmentTimeMs}
            />
            <CandidateFeedbackCard tasks={tasks} overall={overall} />
          </div>
        </div>
      </section>
    </div>
  );
}

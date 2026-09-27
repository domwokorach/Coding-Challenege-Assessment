import type { Challenge } from "@/lib/assessment/challenges";
import type { ProgressState } from "@/lib/assessment/progress";

export type TimelineEvent = {
  id: string;
  label: string;
  /** ISO timestamp — always a real persisted value, never derived from the current clock. */
  at: string;
};

/**
 * Assembles a chronological timeline from the only timestamps this app
 * actually persists (see `ProgressState`): assessment start, per-task open
 * (solution-unlock timer start) and first-pass submission, candidate name
 * confirmation, course completion, and certificate issue. There's no
 * generic event log, so nothing finer-grained (individual test runs,
 * keystrokes, anti-cheat flags) can appear here without fabricating data.
 */
export function buildAssessmentTimeline(
  challenges: Challenge[],
  progress: ProgressState
): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  if (progress.assessmentStartedAt) {
    events.push({
      id: "assessment-started",
      label: "Started",
      at: progress.assessmentStartedAt,
    });
  }

  for (const challenge of challenges) {
    const openedAt = progress.solutionTimers[challenge.id]?.startedAt;
    if (openedAt) {
      events.push({
        id: `task-opened-${challenge.id}`,
        label: `${challenge.title} opened`,
        at: openedAt,
      });
    }
    const submittedAt = progress.completedAt[challenge.id];
    if (submittedAt) {
      events.push({
        id: `task-submitted-${challenge.id}`,
        label: `Task ${challenge.title} submitted`,
        at: submittedAt,
      });
    }
  }

  if (progress.nameConfirmedAt) {
    events.push({
      id: "name-confirmed",
      label: "Candidate name confirmed",
      at: progress.nameConfirmedAt,
    });
  }

  if (progress.completionDate) {
    events.push({
      id: "assessment-completed",
      label: "Finished",
      at: progress.completionDate,
    });
  }

  if (progress.issueDate) {
    events.push({
      id: "certificate-generated",
      label: "Certificate generated",
      at: progress.issueDate,
    });
  }

  return events.sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()
  );
}

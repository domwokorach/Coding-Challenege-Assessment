import { CHALLENGE_LANGUAGE, type Challenge } from "@/lib/assessment/challenges";
import { getLanguageOption } from "@/lib/assessment/languages";
import type { ChallengeStatus, ProgressState } from "@/lib/assessment/progress";

/**
 * Per-test pass/fail only — never the test's expected/received values or
 * label-to-answer mapping, so the dashboard can't be used to read off the
 * hidden test cases.
 */
export type TaskTestSummary = {
  passed: boolean;
};

export type TaskResult = {
  id: number;
  slug: string;
  title: string;
  category: string;
  difficulty: Challenge["difficulty"];
  language: string;
  status: ChallengeStatus;
  completed: boolean;
  completedAt: string | null;
  /** ISO timestamp the task was first opened (solution-unlock timer start), or null if never opened. */
  openedAt: string | null;
  attempts: number;
  runtimeError: string | null;
  tests: TaskTestSummary[];
  passedCount: number;
  failedCount: number;
  totalCount: number;
  /** Percentage of this task's tests that passed, 0-100. */
  scorePercent: number;
  /**
   * Wall-clock time from first opening this task to its first passing
   * submission, in ms — null until both `openedAt` and `completedAt` exist.
   * There's no finer-grained (per-keystroke/per-attempt) time tracking
   * persisted, so this is the only real "time spent" signal available.
   */
  timeSpentMs: number | null;
};

export type OverallResult = {
  tasksCompleted: number;
  tasksTotal: number;
  passedTests: number;
  failedTests: number;
  totalTests: number;
  /** Score earned, out of `scoreMax`. */
  scoreEarned: number;
  scoreMax: number;
  scorePercent: number;
};

export type CorrectnessResult = {
  passedPercent: number;
  failedPercent: number;
  correctnessScore: number;
};

export type PerformanceResult = {
  /** Wall-clock time from starting the assessment to completing it, in ms. Null until both timestamps exist. */
  totalAssessmentTimeMs: number | null;
};

export type AssessmentResults = {
  tasks: TaskResult[];
  overall: OverallResult;
  correctness: CorrectnessResult;
  performance: PerformanceResult;
};

function round(value: number): number {
  return Math.round(value);
}

/** Clamps a percentage to the 0-100 range a progress/chart value must stay within. */
export function clampPercent(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

export function buildAssessmentResults(
  challenges: Challenge[],
  progress: ProgressState
): AssessmentResults {
  const tasks: TaskResult[] = challenges.map((challenge) => {
    const result = progress.results[challenge.id];
    const outcomes = result?.outcomes ?? null;
    const tests: TaskTestSummary[] =
      outcomes?.map((o) => ({ passed: o.pass })) ?? [];
    const passedCount = tests.filter((t) => t.passed).length;
    const totalCount = tests.length;
    const failedCount = totalCount - passedCount;
    const openedAt = progress.solutionTimers[challenge.id]?.startedAt ?? null;
    const completedAt = progress.completedAt[challenge.id] ?? null;
    const timeSpentMs =
      openedAt && completedAt
        ? new Date(completedAt).getTime() - new Date(openedAt).getTime()
        : null;

    return {
      id: challenge.id,
      slug: challenge.slug,
      title: challenge.title,
      category: challenge.category,
      difficulty: challenge.difficulty,
      language:
        getLanguageOption(progress.language[challenge.id] ?? "")?.label ??
        CHALLENGE_LANGUAGE,
      status: result?.status ?? "ready",
      completed: Boolean(progress.completed[challenge.id]),
      completedAt,
      openedAt,
      attempts: progress.attempts[challenge.id] ?? 0,
      runtimeError: result?.runtimeError ?? null,
      tests,
      passedCount,
      failedCount,
      totalCount,
      scorePercent: totalCount > 0 ? round((passedCount / totalCount) * 100) : 0,
      timeSpentMs,
    };
  });

  const tasksCompleted = tasks.filter((t) => t.completed).length;
  const passedTests = tasks.reduce((sum, t) => sum + t.passedCount, 0);
  const totalTests = tasks.reduce((sum, t) => sum + t.totalCount, 0);
  const failedTests = totalTests - passedTests;
  const scorePercent = totalTests > 0 ? round((passedTests / totalTests) * 100) : 0;

  const overall: OverallResult = {
    tasksCompleted,
    tasksTotal: challenges.length,
    passedTests,
    failedTests,
    totalTests,
    scoreEarned: scorePercent,
    scoreMax: 100,
    scorePercent,
  };

  const passedPercent = totalTests > 0 ? round((passedTests / totalTests) * 100) : 0;
  const correctness: CorrectnessResult = {
    passedPercent,
    failedPercent: totalTests > 0 ? 100 - passedPercent : 0,
    correctnessScore: passedPercent,
  };

  const startedAt = progress.assessmentStartedAt;
  const completionDate = progress.completionDate;
  const totalAssessmentTimeMs =
    startedAt && completionDate
      ? new Date(completionDate).getTime() - new Date(startedAt).getTime()
      : null;

  const performance: PerformanceResult = { totalAssessmentTimeMs };

  return { tasks, overall, correctness, performance };
}

export type EvaluationState = "not-submitted" | "evaluating" | "completed";

/**
 * Any task still `"running"` (CodeCheck actively evaluating its tests) means
 * the report as a whole is mid-evaluation and must not show a score yet.
 * With no task run at all, nothing has been submitted. Otherwise every
 * attempted task has settled to passed/failed, so results are final.
 */
export function getEvaluationState(tasks: TaskResult[]): EvaluationState {
  if (tasks.some((t) => t.status === "running")) return "evaluating";
  if (tasks.every((t) => t.totalCount === 0)) return "not-submitted";
  return "completed";
}

/** "1h 04m", "12m", or "45s" — whichever units are non-zero, largest first. */
export function formatDurationMs(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  if (m > 0) return `${m}m ${String(s).padStart(2, "0")}s`;
  return `${s}s`;
}

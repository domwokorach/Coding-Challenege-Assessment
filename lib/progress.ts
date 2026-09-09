import { addYears, format, isAfter } from "date-fns";
import type { TestOutcome } from "@/lib/challenges";

export type ChallengeStatus = "ready" | "running" | "passed" | "failed";

export type ChallengeResult = {
  status: ChallengeStatus;
  outcomes: TestOutcome[] | null;
  runtimeError: string | null;
};

export const CERTIFICATE_VALIDITY_YEARS = 4;

/** Minutes a learner must spend on a challenge before its solution unlocks. */
export const SOLUTION_UNLOCK_MINUTES = 5;
export const SOLUTION_UNLOCK_MS = SOLUTION_UNLOCK_MINUTES * 60 * 1000;
export const SOLUTION_UNLOCK_SECONDS = SOLUTION_UNLOCK_MINUTES * 60;

export type SolutionTimer = {
  startedAt: string;
  unlockAt: string;
};

export type ProgressState = {
  code: Record<number, string>;
  results: Record<number, ChallengeResult>;
  completed: Record<number, boolean>;
  /** ISO timestamp of the run that first passed a task's tests, keyed by challenge id. */
  completedAt: Record<number, string | null>;
  /** Number of times "Run Test" has been used, keyed by challenge id. */
  attempts: Record<number, number>;
  solutionTimers: Record<number, SolutionTimer>;
  assessmentStarted: boolean;
  assessmentStartedAt: string | null;
  learnerName: string;
  nameConfirmed: boolean;
  nameConfirmedAt: string | null;
  courseCompleted: boolean;
  completionDate: string | null;
  certificateId: string | null;
  certificateUrl: string | null;
  issueDate: string | null;
  expiryDate: string | null;
};

const COURSE_NAME = "Software Engineer Programme";

export function createDefaultProgress(
  starterCodeById: Record<number, string>
): ProgressState {
  return {
    code: { ...starterCodeById },
    results: {},
    completed: {},
    completedAt: {},
    attempts: {},
    solutionTimers: {},
    assessmentStarted: false,
    assessmentStartedAt: null,
    learnerName: "",
    nameConfirmed: false,
    nameConfirmedAt: null,
    courseCompleted: false,
    completionDate: null,
    certificateId: null,
    certificateUrl: null,
    issueDate: null,
    expiryDate: null,
  };
}

/**
 * Backfills any fields missing from stored progress (rows saved before a
 * field like `solutionTimers` existed) so reads never hit `undefined`
 * mid-object — the shape has grown several times across this app's life.
 */
export function normalizeProgress(
  data: Partial<ProgressState> | null | undefined,
  defaults: ProgressState
): ProgressState {
  if (!data) return defaults;
  return {
    ...defaults,
    ...data,
    code: { ...defaults.code, ...data.code },
    results: { ...defaults.results, ...data.results },
    completed: { ...defaults.completed, ...data.completed },
    completedAt: { ...defaults.completedAt, ...data.completedAt },
    attempts: { ...defaults.attempts, ...data.attempts },
    solutionTimers: { ...defaults.solutionTimers, ...data.solutionTimers },
  };
}

export function generateCertificateId(): string {
  const bytes = new Uint8Array(6);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "";
  for (const byte of bytes) {
    id += chars[byte % chars.length];
  }
  return `SEP-${id}`;
}

export function buildCertificateUrl(certificateId: string): string {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/certificate/${certificateId}`;
}

/** Submission timestamps show date and time, e.g. "12 March 2026, 14:05". */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatCompletionDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Certificates show DD/MM/YYYY per the issue/expiry date spec. */
export function formatCertificateDate(iso: string): string {
  return format(new Date(iso), "dd/MM/yyyy");
}

export function computeExpiryDate(issueDateIso: string): string {
  return addYears(new Date(issueDateIso), CERTIFICATE_VALIDITY_YEARS).toISOString();
}

export function isCertificateExpired(expiryDateIso: string | null): boolean {
  if (!expiryDateIso) return false;
  return isAfter(new Date(), new Date(expiryDateIso));
}

export function createSolutionTimer(now: number = Date.now()): SolutionTimer {
  return {
    startedAt: new Date(now).toISOString(),
    unlockAt: new Date(now + SOLUTION_UNLOCK_MS).toISOString(),
  };
}

/** Seconds remaining until `timer` unlocks, clamped to 0. */
export function solutionSecondsRemaining(
  timer: SolutionTimer | undefined,
  now: number = Date.now()
): number {
  if (!timer) return SOLUTION_UNLOCK_SECONDS;
  const remainingMs = new Date(timer.unlockAt).getTime() - now;
  return Math.max(0, Math.ceil(remainingMs / 1000));
}

/** "MM:SS" for the button label, e.g. "04:59". */
export function formatCountdown(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** "3 minutes 24 seconds" for the locked toast description. */
export function formatDurationWords(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  const parts: string[] = [];
  if (m > 0) parts.push(`${m} minute${m === 1 ? "" : "s"}`);
  if (s > 0 || m === 0) parts.push(`${s} second${s === 1 ? "" : "s"}`);
  return parts.join(" ");
}

export { COURSE_NAME };

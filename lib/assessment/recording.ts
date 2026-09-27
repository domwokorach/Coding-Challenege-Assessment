/**
 * Shared types for the Assessment Timeline recording feature — an
 * event-based (not video) capture of a candidate's coding activity, so a
 * session can be reconstructed as a code-level replay rather than storing
 * screen video.
 */

export type AssessmentEventType =
  | "assessment_started"
  | "code_change"
  | "file_change"
  | "language_change"
  | "run_code"
  | "test_run"
  | "submission"
  | "assessment_submitted";

export type AssessmentTimelineEventData = {
  fileName?: string;
  language?: string;
  code?: string;
  result?: unknown;
};

/**
 * A single captured activity event. `id` is generated client-side (UUID) so
 * repeated batch-flush attempts after a dropped connection are idempotent
 * on the server (insert-if-not-exists by id) instead of duplicating events.
 */
export type AssessmentTimelineEvent = {
  id: string;
  assessmentId: string;
  candidateId: string;
  /** Epoch ms when the event was captured on the candidate's device. */
  timestamp: number;
  type: AssessmentEventType;
  data: AssessmentTimelineEventData;
};

export type RecordingStatus = "recording" | "completed" | "failed";

export type RecordingEventCounts = {
  runCodeCount: number;
  testRunCount: number;
  submissionCount: number;
};

export type AssessmentRecording = {
  id: string;
  assessmentId: string;
  candidateId: string;
  status: RecordingStatus;
  startedAt: string | null;
  submittedAt: string | null;
  /** Total recorded duration in ms — startedAt to submittedAt once finalized. */
  duration: number | null;
  language: string | null;
  counts: RecordingEventCounts;
  createdAt: string;
  updatedAt: string;
};

const EVENT_TYPE_LABELS: Record<AssessmentEventType, string> = {
  assessment_started: "Assessment started",
  code_change: "Code updated",
  file_change: "File changed",
  language_change: "Language changed",
  run_code: "Run Code",
  test_run: "Tests executed",
  submission: "Task submitted",
  assessment_submitted: "Assessment submitted",
};

export function eventTypeLabel(type: AssessmentEventType): string {
  return EVENT_TYPE_LABELS[type] ?? type;
}

/** "32:41" for durations under an hour, "1:02:41" once an hour is crossed. */
export function formatClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

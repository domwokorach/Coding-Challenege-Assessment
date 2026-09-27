"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useProgress, type SaveStatus } from "@/hooks/use-progress";
import {
  useTimelineRecorder,
  type RecorderStatus,
} from "@/hooks/use-timeline-recorder";
import { challenges } from "@/lib/assessment/challenges";
import { DEFAULT_LANGUAGE_ID } from "@/lib/assessment/languages";
import { createDefaultProgress, type ProgressState } from "@/lib/assessment/progress";
import type { AssessmentEventType, AssessmentTimelineEventData } from "@/lib/assessment/recording";

function randomId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** The whole session's time budget, across every challenge — not per task. */
export const TOTAL_SESSION_SECONDS = 30 * 60;

type ChallengeProgressContextValue = {
  progress: ProgressState | null;
  setProgress: Dispatch<SetStateAction<ProgressState | null>>;
  loaded: boolean;
  flushSave: () => Promise<void>;
  saveStatus: SaveStatus;
  retrySave: () => Promise<void>;
  secondsLeft: number;
  timeUpDismissed: boolean;
  dismissTimeUp: () => void;
  recordingStatus: RecorderStatus;
  recordEvent: (type: AssessmentEventType, data?: AssessmentTimelineEventData) => void;
  recordCodeChange: (data: AssessmentTimelineEventData) => void;
  recordCodeChangeNow: (data: AssessmentTimelineEventData) => void;
  finalizeRecording: () => Promise<void>;
};

const ChallengeProgressContext =
  createContext<ChallengeProgressContextValue | null>(null);

const starterCodeById = Object.fromEntries(
  challenges.map((c) => [c.id, c.starterCode])
);

/**
 * Owns the single `useProgress()` fetch for the whole `/challenges/[slug]`
 * tree. Layouts persist across navigations between sibling dynamic-segment
 * pages, while the page itself remounts on every slug change — without this,
 * each "Next Challenge" click re-triggered the /api/progress fetch and
 * dropped back to the page's full-screen loading state, which read to users
 * as the page reloading.
 */
export function ChallengeProgressProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { progress, setProgress, loaded, flushSave, saveStatus, retrySave } = useProgress(() =>
    createDefaultProgress(starterCodeById)
  );

  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SESSION_SECONDS);
  const [timeUpDismissed, setTimeUpDismissed] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Assigns a stable id for this assessment attempt the moment it starts —
  // this is what correlates the candidate's Assessment Timeline recording
  // (lib/recording.ts) back to this progress record.
  useEffect(() => {
    if (!progress || !progress.assessmentStarted || progress.assessmentId) return;
    setProgress((prev) =>
      prev && !prev.assessmentId ? { ...prev, assessmentId: randomId() } : prev
    );
  }, [progress, setProgress]);

  const [candidateId, setCandidateId] = useState("");
  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { id?: string } | null) => {
        if (!cancelled && data?.id) setCandidateId(data.id);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const {
    status: recordingStatus,
    recordEvent,
    recordCodeChange,
    recordCodeChangeNow,
    finalize: finalizeRecording,
  } = useTimelineRecorder({
    assessmentId: progress?.assessmentId ?? null,
    candidateId,
    language: DEFAULT_LANGUAGE_ID,
  });

  const value = useMemo(
    () => ({
      progress,
      setProgress,
      loaded,
      flushSave,
      saveStatus,
      retrySave,
      secondsLeft,
      timeUpDismissed,
      dismissTimeUp: () => setTimeUpDismissed(true),
      recordingStatus,
      recordEvent,
      recordCodeChange,
      recordCodeChangeNow,
      finalizeRecording,
    }),
    [
      progress,
      setProgress,
      loaded,
      flushSave,
      saveStatus,
      retrySave,
      secondsLeft,
      timeUpDismissed,
      recordingStatus,
      recordEvent,
      recordCodeChange,
      recordCodeChangeNow,
      finalizeRecording,
    ]
  );

  if (!loaded || !progress) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50 text-sm text-zinc-500 dark:bg-zinc-950 dark:text-zinc-500">
        Loading…
      </div>
    );
  }

  return (
    <ChallengeProgressContext.Provider value={value}>
      {children}
    </ChallengeProgressContext.Provider>
  );
}

export function useChallengeProgress() {
  const ctx = useContext(ChallengeProgressContext);
  if (!ctx) {
    throw new Error(
      "useChallengeProgress must be used within ChallengeProgressProvider"
    );
  }
  // Narrowed here since the provider only renders children once loaded.
  return ctx as {
    progress: ProgressState;
    setProgress: Dispatch<SetStateAction<ProgressState | null>>;
    loaded: true;
    flushSave: () => Promise<void>;
    saveStatus: SaveStatus;
    retrySave: () => Promise<void>;
    secondsLeft: number;
    timeUpDismissed: boolean;
    dismissTimeUp: () => void;
    recordingStatus: RecorderStatus;
    recordEvent: (type: AssessmentEventType, data?: AssessmentTimelineEventData) => void;
    recordCodeChange: (data: AssessmentTimelineEventData) => void;
    recordCodeChangeNow: (data: AssessmentTimelineEventData) => void;
    finalizeRecording: () => Promise<void>;
  };
}

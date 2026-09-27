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
import { useProgress } from "@/hooks/use-progress";
import { challenges } from "@/lib/challenges";
import { createDefaultProgress, type ProgressState } from "@/lib/progress";

/** The whole session's time budget, across every challenge — not per task. */
export const TOTAL_SESSION_SECONDS = 30 * 60;

type ChallengeProgressContextValue = {
  progress: ProgressState | null;
  setProgress: Dispatch<SetStateAction<ProgressState | null>>;
  loaded: boolean;
  flushSave: () => Promise<void>;
  secondsLeft: number;
  timeUpDismissed: boolean;
  dismissTimeUp: () => void;
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
  const { progress, setProgress, loaded, flushSave } = useProgress(() =>
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

  const value = useMemo(
    () => ({
      progress,
      setProgress,
      loaded,
      flushSave,
      secondsLeft,
      timeUpDismissed,
      dismissTimeUp: () => setTimeUpDismissed(true),
    }),
    [progress, setProgress, loaded, flushSave, secondsLeft, timeUpDismissed]
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
    secondsLeft: number;
    timeUpDismissed: boolean;
    dismissTimeUp: () => void;
  };
}

"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { normalizeProgress, type ProgressState } from "@/lib/progress";

const SAVE_DEBOUNCE_MS = 600;

async function putProgress(progress: ProgressState): Promise<void> {
  const res = await fetch("/api/progress", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(progress),
  });
  if (!res.ok) throw new Error("Failed to save progress");
}

/**
 * Progress lives server-side (keyed by the single implicit guest identity),
 * not in localStorage — this app has no authentication, so all visitors
 * share the same progress record.
 */
export function useProgress(createDefault: () => ProgressState) {
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [loaded, setLoaded] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // useLayoutEffect (not useEffect) so this is guaranteed to run before any
  // click handler that calls flushSave can fire, even for an edit made in
  // the same tick just before the click.
  const progressRef = useRef<ProgressState | null>(null);
  useLayoutEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/progress")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Partial<ProgressState> | null) => {
        if (cancelled) return;
        setProgress(normalizeProgress(data, createDefault()));
        setLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        setProgress(createDefault());
        setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
    // Only ever load once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loaded || !progress) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      putProgress(progress).catch(() => {
        // Best-effort — a failed save just means the next change retries.
      });
    }, SAVE_DEBOUNCE_MS);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [progress, loaded]);

  /**
   * Immediately persists the latest progress, bypassing and cancelling any
   * pending debounced save. Used right before navigating to the next/
   * previous task so an edit made just before clicking "Next" is never lost
   * to a debounce window getting cut short by the navigation. Throws on
   * failure so callers can keep the user on the current task and retry
   * instead of navigating away from unsaved work.
   */
  const flushSave = useCallback(async () => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    if (!progressRef.current) return;
    await putProgress(progressRef.current);
  }, []);

  return { progress, setProgress, loaded, flushSave };
}

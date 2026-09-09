"use client";

import { useEffect, useRef, useState } from "react";
import { normalizeProgress, type ProgressState } from "@/lib/progress";

const SAVE_DEBOUNCE_MS = 600;

/**
 * Progress lives server-side (keyed by the single implicit guest identity),
 * not in localStorage — this app has no authentication, so all visitors
 * share the same progress record.
 */
export function useProgress(createDefault: () => ProgressState) {
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [loaded, setLoaded] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      fetch("/api/progress", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(progress),
      }).catch(() => {
        // Best-effort — a failed save just means the next change retries.
      });
    }, SAVE_DEBOUNCE_MS);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [progress, loaded]);

  return { progress, setProgress, loaded };
}

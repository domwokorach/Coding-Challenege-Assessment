"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  AssessmentEventType,
  AssessmentTimelineEvent,
  AssessmentTimelineEventData,
} from "@/lib/assessment/recording";

const FLUSH_INTERVAL_MS = 4000;
const FLUSH_BATCH_SIZE = 20;
const CODE_CHANGE_DEBOUNCE_MS = 900;
const EVENTS_URL = "/api/recording/events";

function randomId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function storageKey(assessmentId: string): string {
  return `timeline-recorder:${assessmentId}`;
}

function loadQueue(assessmentId: string): AssessmentTimelineEvent[] {
  try {
    const raw = localStorage.getItem(storageKey(assessmentId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveQueue(assessmentId: string, queue: AssessmentTimelineEvent[]) {
  try {
    localStorage.setItem(storageKey(assessmentId), JSON.stringify(queue));
  } catch {
    // Best-effort — a full/blocked storage just means recovery-after-refresh
    // is weaker; it must never break recording or typing.
  }
}

export type RecorderStatus = "idle" | "recording" | "flushing" | "error";

/**
 * Buffers Assessment Timeline events client-side and periodically persists
 * batches to the backend, instead of sending a request per keystroke. Events
 * also survive refresh/connection loss: every queued event is mirrored to
 * localStorage and only cleared once the server confirms it was stored, so
 * a retried flush is always safe (the server dedupes by event id).
 */
export function useTimelineRecorder({
  assessmentId,
  candidateId,
  language,
}: {
  assessmentId: string | null;
  candidateId: string;
  language: string | null;
}) {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [recordingId, setRecordingId] = useState<string | null>(null);

  const queueRef = useRef<AssessmentTimelineEvent[]>([]);
  const codeChangeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flushingRef = useRef(false);
  const assessmentIdRef = useRef(assessmentId);
  const languageRef = useRef(language);
  assessmentIdRef.current = assessmentId;
  languageRef.current = language;

  const enqueue = useCallback(
    (type: AssessmentEventType, data: AssessmentTimelineEventData) => {
      const id = assessmentIdRef.current;
      if (!id) return;
      const event: AssessmentTimelineEvent = {
        id: randomId(),
        assessmentId: id,
        candidateId,
        timestamp: Date.now(),
        type,
        data,
      };
      queueRef.current = [...queueRef.current, event];
      saveQueue(id, queueRef.current);
      if (queueRef.current.length >= FLUSH_BATCH_SIZE) {
        void flush();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps -- flush is stable via ref below
    },
    [candidateId]
  );

  const flush = useCallback(async (useBeacon = false): Promise<void> => {
    const id = assessmentIdRef.current;
    if (!id || queueRef.current.length === 0) return;
    if (flushingRef.current && !useBeacon) return;

    const batch = queueRef.current;
    const payload = JSON.stringify({
      assessmentId: id,
      language: languageRef.current,
      events: batch,
    });

    if (useBeacon && typeof navigator !== "undefined" && navigator.sendBeacon) {
      // Best-effort, fire-and-forget on tab close — the local queue is left
      // intact (not cleared) since a beacon send has no delivery
      // confirmation; the next normal flush will safely resend/dedupe.
      navigator.sendBeacon(
        EVENTS_URL,
        new Blob([payload], { type: "application/json" })
      );
      return;
    }

    flushingRef.current = true;
    setStatus("flushing");
    try {
      const res = await fetch(EVENTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
      });
      if (!res.ok) throw new Error("Failed to persist recording events");
      const json = (await res.json()) as { recordingId: string };
      setRecordingId(json.recordingId);
      const flushedIds = new Set(batch.map((e) => e.id));
      queueRef.current = queueRef.current.filter((e) => !flushedIds.has(e.id));
      saveQueue(id, queueRef.current);
      setStatus("recording");
    } catch {
      // Left in the queue (and in localStorage) for the next tick/reconnect.
      setStatus("error");
    } finally {
      flushingRef.current = false;
    }
  }, []);

  const recordEvent = useCallback(
    (type: AssessmentEventType, data: AssessmentTimelineEventData = {}) => {
      enqueue(type, data);
    },
    [enqueue]
  );

  const recordCodeChange = useCallback(
    (data: AssessmentTimelineEventData) => {
      if (codeChangeTimer.current) clearTimeout(codeChangeTimer.current);
      codeChangeTimer.current = setTimeout(() => {
        enqueue("code_change", data);
      }, CODE_CHANGE_DEBOUNCE_MS);
    },
    [enqueue]
  );

  /** Bypasses the debounce — used right before a run/test/submit so replay always has the code as it was at that moment. */
  const recordCodeChangeNow = useCallback(
    (data: AssessmentTimelineEventData) => {
      if (codeChangeTimer.current) {
        clearTimeout(codeChangeTimer.current);
        codeChangeTimer.current = null;
      }
      enqueue("code_change", data);
    },
    [enqueue]
  );

  // Start (or resume) the recording session once an assessmentId exists,
  // and recover any events a previous tab/session left queued locally.
  useEffect(() => {
    if (!assessmentId) return;
    queueRef.current = loadQueue(assessmentId);

    let cancelled = false;
    fetch("/api/recording/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assessmentId, language }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json: { id: string } | null) => {
        if (cancelled) return;
        if (json) {
          setRecordingId(json.id);
          setStatus("recording");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
    // Only (re)start once per assessmentId — language is read fresh from
    // languageRef when events are actually sent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentId]);

  // Periodic batch flush.
  useEffect(() => {
    if (!assessmentId) return;
    const interval = setInterval(() => {
      void flush();
    }, FLUSH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [assessmentId, flush]);

  // Flush on tab hide/close so a candidate closing the tab mid-assessment
  // doesn't lose the last few seconds of activity.
  useEffect(() => {
    if (!assessmentId) return;
    function handleVisibility() {
      if (document.visibilityState === "hidden") void flush(true);
    }
    function handleBeforeUnload() {
      void flush(true);
    }
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [assessmentId, flush]);

  /** Flushes remaining events, then marks the recording completed. Call on assessment submission. */
  const finalize = useCallback(async (): Promise<void> => {
    if (codeChangeTimer.current) {
      clearTimeout(codeChangeTimer.current);
      codeChangeTimer.current = null;
    }
    recordEvent("assessment_submitted", {});
    await flush();
    if (!recordingId) return;
    try {
      await fetch("/api/recording/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordingId }),
      });
    } catch {
      // The recording stays in "recording" status — harmless; the
      // candidate's answers are already safely submitted separately.
    }
  }, [flush, recordEvent, recordingId]);

  return {
    status,
    recordingId,
    recordEvent,
    recordCodeChange,
    recordCodeChangeNow,
    finalize,
  };
}

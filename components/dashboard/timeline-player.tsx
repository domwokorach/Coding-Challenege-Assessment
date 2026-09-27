"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  SkipForward,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodePlaybackView } from "@/components/dashboard/code-playback-view";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import {
  eventTypeLabel,
  formatClock,
  type AssessmentEventType,
  type AssessmentRecording,
  type AssessmentTimelineEvent,
} from "@/lib/assessment/recording";
import { cn } from "@/lib/utils";

const SPEEDS = [0.5, 1, 2, 4] as const;
const SEEK_STEP_MS = 10_000;
/** How far apart two shown `code_change` markers must be to both appear in the event list — keeps the list readable instead of one row per debounced snapshot. */
const CODE_CHANGE_MARKER_GAP_MS = 30_000;
const JUMPABLE_TYPES: AssessmentEventType[] = ["run_code", "test_run", "submission"];

function eventDetail(event: AssessmentTimelineEvent): string | null {
  if (event.type === "test_run" && event.data.result && typeof event.data.result === "object") {
    const r = event.data.result as {
      passed?: number;
      total?: number;
      status?: string;
      runtimeError?: string | null;
    };
    if (r.runtimeError) return "Runtime error";
    if (typeof r.passed === "number" && typeof r.total === "number") {
      return `${r.passed}/${r.total} tests passed`;
    }
  }
  if (event.type === "run_code" || event.type === "code_change") {
    return event.data.fileName ? `Editing ${event.data.fileName}` : null;
  }
  if (event.type === "language_change") {
    return event.data.language ? `Switched to ${event.data.language}` : null;
  }
  if (event.type === "submission" && event.data.result && typeof event.data.result === "object") {
    const r = event.data.result as { taskTitle?: string };
    return r.taskTitle ?? null;
  }
  return null;
}

/** Filters the raw event log down to a readable list: every non-code event, plus code_change markers spaced at least CODE_CHANGE_MARKER_GAP_MS apart. */
function buildEventMarkers(events: AssessmentTimelineEvent[]): AssessmentTimelineEvent[] {
  const markers: AssessmentTimelineEvent[] = [];
  let lastCodeMarkerAt = -Infinity;
  for (const event of events) {
    if (event.type === "code_change") {
      if (event.timestamp - lastCodeMarkerAt < CODE_CHANGE_MARKER_GAP_MS) continue;
      lastCodeMarkerAt = event.timestamp;
    }
    markers.push(event);
  }
  return markers;
}

export function TimelinePlayer({
  recording,
  events,
}: {
  recording: AssessmentRecording;
  events: AssessmentTimelineEvent[];
}) {
  const reducedMotion = useReducedMotion();
  const startTimestamp = events[0]?.timestamp ?? Date.parse(recording.startedAt ?? "") ?? Date.now();
  const durationMs = useMemo(() => {
    if (recording.duration) return recording.duration;
    const last = events[events.length - 1]?.timestamp;
    return last ? last - startTimestamp : 0;
  }, [recording.duration, events, startTimestamp]);

  const [offsetMs, setOffsetMs] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) return;
    lastFrameRef.current = null;
    function tick(now: number) {
      if (lastFrameRef.current === null) lastFrameRef.current = now;
      const deltaMs = now - lastFrameRef.current;
      lastFrameRef.current = now;
      setOffsetMs((prev) => {
        const next = prev + deltaMs * speed;
        if (next >= durationMs) {
          setPlaying(false);
          return durationMs;
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, speed, durationMs]);

  const absoluteNow = startTimestamp + offsetMs;

  const { code, fileName, language } = useMemo(() => {
    let code = "";
    let fileName = "solution.js";
    let language = recording.language ?? "JavaScript";
    for (const event of events) {
      if (event.timestamp > absoluteNow) break;
      if (event.type === "code_change") {
        if (typeof event.data.code === "string") code = event.data.code;
        if (event.data.fileName) fileName = event.data.fileName;
      } else if (event.type === "file_change" && event.data.fileName) {
        fileName = event.data.fileName;
      }
      if (event.data.language) language = event.data.language;
    }
    return { code, fileName, language };
  }, [events, absoluteNow, recording.language]);

  const markers = useMemo(() => buildEventMarkers(events), [events]);

  const currentEvent = useMemo(() => {
    let current: AssessmentTimelineEvent | null = null;
    for (const event of markers) {
      if (event.timestamp > absoluteNow) break;
      current = event;
    }
    return current;
  }, [markers, absoluteNow]);

  function seekTo(nextOffsetMs: number) {
    setOffsetMs(Math.min(durationMs, Math.max(0, nextOffsetMs)));
  }

  function seekToEvent(event: AssessmentTimelineEvent) {
    setPlaying(false);
    seekTo(event.timestamp - startTimestamp);
  }

  function jumpToNext(type: AssessmentEventType) {
    const matches = events.filter((e) => e.type === type);
    if (matches.length === 0) return;
    const next = matches.find((e) => e.timestamp - startTimestamp > offsetMs + 500);
    seekToEvent(next ?? matches[0]);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Assessment Timeline
          </h3>
          <span className="font-mono text-xs tabular-nums text-zinc-500 dark:text-zinc-500">
            {formatClock(durationMs)}
          </span>
        </div>

        <div className="h-[380px]">
          <CodePlaybackView code={code} fileName={fileName} />
        </div>

        {/* Visually hidden; announces position for screen reader users who aren't watching the code pane update. */}
        <p className="sr-only" aria-live="polite">
          {formatClock(offsetMs)} — {currentEvent ? eventTypeLabel(currentEvent.type) : "Assessment started"}
        </p>

        <div className="flex flex-col gap-3 border-t border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              aria-label="Seek backward 10 seconds"
              onClick={() => seekTo(offsetMs - SEEK_STEP_MS)}
            >
              <RotateCcw />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? "Pause replay" : "Play replay"}
            >
              {playing ? <Pause /> : <Play />}
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              aria-label="Seek forward 10 seconds"
              onClick={() => seekTo(offsetMs + SEEK_STEP_MS)}
            >
              <RotateCw />
            </Button>

            <span className="w-14 shrink-0 font-mono text-xs tabular-nums text-zinc-600 dark:text-zinc-400">
              {formatClock(offsetMs)}
            </span>
            <input
              type="range"
              min={0}
              max={Math.max(durationMs, 1)}
              value={offsetMs}
              onChange={(e) => {
                setPlaying(false);
                seekTo(Number(e.target.value));
              }}
              aria-label="Seek timeline"
              aria-valuetext={`${formatClock(offsetMs)} of ${formatClock(durationMs)}`}
              className="h-1.5 w-full flex-1 cursor-pointer appearance-none rounded-full bg-zinc-200 accent-zinc-900 dark:bg-zinc-800 dark:accent-zinc-100"
            />
            <span className="w-14 shrink-0 text-right font-mono text-xs tabular-nums text-zinc-600 dark:text-zinc-400">
              {formatClock(durationMs)}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1" role="group" aria-label="Playback speed">
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={speed === s}
                  onClick={() => setSpeed(s)}
                  className={cn(
                    "rounded-md border px-2 py-1 text-xs font-medium tabular-nums transition-colors",
                    speed === s
                      ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950"
                      : "border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  )}
                >
                  {s}x
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {JUMPABLE_TYPES.map((type) => (
                <Button
                  key={type}
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => jumpToNext(type)}
                  disabled={!events.some((e) => e.type === type)}
                >
                  <SkipForward data-icon="inline-start" />
                  {eventTypeLabel(type)}
                </Button>
              ))}
            </div>
          </div>

          <p className="text-xs text-zinc-500 dark:text-zinc-500">
            Language: <span className="font-medium text-zinc-700 dark:text-zinc-300">{language}</span>
            {reducedMotion && " · Reduced motion: playback advances without animated transitions."}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Timeline Events
        </h3>
        {markers.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            No events were recorded for this session.
          </p>
        ) : (
          <ol className="mt-4 flex flex-col gap-1">
            {markers.map((event) => {
              const eventOffsetMs = event.timestamp - startTimestamp;
              const isCurrent = currentEvent?.id === event.id;
              const detail = eventDetail(event);
              return (
                <li key={event.id}>
                  <button
                    type="button"
                    onClick={() => seekToEvent(event)}
                    aria-current={isCurrent ? "true" : undefined}
                    className={cn(
                      "flex w-full items-baseline gap-3 rounded-md px-2 py-1.5 text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100",
                      isCurrent
                        ? "bg-zinc-100 dark:bg-zinc-800"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                    )}
                  >
                    <span className="shrink-0 font-mono text-xs tabular-nums text-zinc-500 dark:text-zinc-500">
                      {formatClock(eventOffsetMs)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {eventTypeLabel(event.type)}
                      </span>
                      {detail && (
                        <span className="text-zinc-500 dark:text-zinc-500"> — {detail}</span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}

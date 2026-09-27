"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { TaskSummaryPanel } from "@/components/dashboard/task-summary-panel";
import { OverallScoreDonut } from "@/components/dashboard/overall-score-donut";
import { CandidateFeedbackCard } from "@/components/dashboard/candidate-feedback-card";
import { TaskInsights } from "@/components/dashboard/task-insights";
import { AssessmentTimeline } from "@/components/dashboard/assessment-timeline";
import { RecordingSummaryCard } from "@/components/dashboard/recording-summary-card";
import { TimelinePlayer } from "@/components/dashboard/timeline-player";
import { useProgress } from "@/hooks/use-progress";
import { challenges } from "@/lib/assessment/challenges";
import { COURSE_NAME, createDefaultProgress } from "@/lib/assessment/progress";
import { buildAssessmentResults, getEvaluationState } from "@/lib/assessment/scoring";
import { buildAssessmentTimeline } from "@/lib/assessment/timeline";
import type { AssessmentRecording, AssessmentTimelineEvent } from "@/lib/assessment/recording";

function useRecording(assessmentId: string | null): AssessmentRecording | null {
  const [recording, setRecording] = useState<AssessmentRecording | null>(null);

  useEffect(() => {
    if (!assessmentId) return;
    let cancelled = false;
    fetch(`/api/recording?assessmentId=${encodeURIComponent(assessmentId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: AssessmentRecording | null) => {
        if (!cancelled) setRecording(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [assessmentId]);

  return recording;
}

function useRecordingEvents(recordingId: string | null): AssessmentTimelineEvent[] {
  const [events, setEvents] = useState<AssessmentTimelineEvent[]>([]);

  useEffect(() => {
    if (!recordingId) return;
    let cancelled = false;
    fetch(`/api/recording/${recordingId}/events`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { events?: AssessmentTimelineEvent[] } | null) => {
        if (!cancelled) setEvents(data?.events ?? []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [recordingId]);

  return events;
}

type Profile = { firstName: string | null; lastName: string | null } | null;

function useCandidateName(learnerName: string): string {
  const [profile, setProfile] = useState<Profile>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Profile) => {
        if (!cancelled) setProfile(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (learnerName) return learnerName;
  const accountName = [profile?.firstName, profile?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  return accountName || "Candidate";
}

export default function CandidateReportPage() {
  const starterCodeById = Object.fromEntries(
    challenges.map((c) => [c.id, c.starterCode])
  );
  const { progress, loaded } = useProgress(() =>
    createDefaultProgress(starterCodeById)
  );

  const candidateName = useCandidateName(progress?.learnerName ?? "");
  const recording = useRecording(progress?.assessmentId ?? null);
  const recordingEvents = useRecordingEvents(recording?.id ?? null);
  const [seekToMs, setSeekToMs] = useState<number | null>(null);
  const replayRef = useRef<HTMLDivElement>(null);

  function handleSelectTimelineEvent(atIso: string) {
    if (!recording) return;
    const startTimestamp =
      recordingEvents[0]?.timestamp ??
      (recording.startedAt ? Date.parse(recording.startedAt) : Date.now());
    setSeekToMs(Date.parse(atIso) - startTimestamp);
    replayRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (!loaded || !progress) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-sm text-zinc-500 dark:text-zinc-500">Loading…</p>
      </div>
    );
  }

  if (!progress.assessmentStarted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-zinc-50 px-4 text-center dark:bg-zinc-950">
        <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          No assessment data yet
        </p>
        <p className="max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
          Start the coding assessment to generate your candidate report.
        </p>
        <Link
          href="/coding-assessment"
          className="mt-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
        >
          Go to Coding Assessment
        </Link>
      </div>
    );
  }

  const results = buildAssessmentResults(challenges, progress);
  const { tasks, overall, correctness, performance } = results;
  const evaluationState = getEvaluationState(tasks);
  const evaluating = evaluationState === "evaluating";
  const timeline = buildAssessmentTimeline(challenges, progress);

  const statusLabel = progress.courseCompleted
    ? "Completed"
    : evaluating
      ? "Evaluating"
      : "In Progress";

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="border-b border-zinc-200 bg-white px-4 py-6 sm:px-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-500">
            Software Engineer Programme
          </p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
            Candidate Report
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Candidate:{" "}
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {candidateName}
            </span>
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            <span>
              Assessment: <span className="font-medium">{COURSE_NAME}</span>
            </span>
            <span aria-live="polite">
              Status: <span className="font-medium">{statusLabel}</span>
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Tabs defaultValue="summary">
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="mt-6 flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <TaskSummaryPanel tasks={tasks} />
              <OverallScoreDonut
                score={overall.scorePercent}
                correctnessScore={correctness.correctnessScore}
                totalAssessmentTimeMs={performance.totalAssessmentTimeMs}
                evaluating={evaluating}
              />
            </div>

            <TaskInsights tasks={tasks} />

            <CandidateFeedbackCard tasks={tasks} overall={overall} />
          </TabsContent>

          <TabsContent value="timeline" className="mt-6 flex flex-col gap-6">
            <AssessmentTimeline events={timeline} onSelectEvent={handleSelectTimelineEvent} />
            <RecordingSummaryCard recording={recording} />
            {recording && recordingEvents.length > 0 && (
              <div ref={replayRef}>
                <TimelinePlayer
                  recording={recording}
                  events={recordingEvents}
                  seekToMs={seekToMs}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

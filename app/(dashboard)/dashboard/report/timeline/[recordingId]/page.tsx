"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TimelinePlayer } from "@/components/dashboard/timeline-player";
import type { AssessmentRecording, AssessmentTimelineEvent } from "@/lib/assessment/recording";

export default function TimelinePlayerPage({
  params,
}: {
  params: Promise<{ recordingId: string }>;
}) {
  const { recordingId } = use(params);
  const [recording, setRecording] = useState<AssessmentRecording | null | undefined>(undefined);
  const [events, setEvents] = useState<AssessmentTimelineEvent[]>([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch(`/api/recording/${recordingId}`).then((res) => (res.ok ? res.json() : null)),
      fetch(`/api/recording/${recordingId}/events`).then((res) => (res.ok ? res.json() : null)),
    ]).then(([recordingJson, eventsJson]) => {
      if (cancelled) return;
      setRecording(recordingJson);
      setEvents(eventsJson?.events ?? []);
    });
    return () => {
      cancelled = true;
    };
  }, [recordingId]);

  if (recording === null) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="border-b border-zinc-200 bg-white px-4 py-4 sm:px-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Software Engineer Programme
          </p>
          <Link
            href="/dashboard/report"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Back to Candidate Report
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {recording === undefined ? (
          <p className="py-24 text-center text-sm text-zinc-500 dark:text-zinc-500">
            Loading…
          </p>
        ) : (
          <TimelinePlayer recording={recording} events={events} />
        )}
      </main>
    </div>
  );
}

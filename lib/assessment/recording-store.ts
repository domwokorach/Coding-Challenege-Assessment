import { and, asc, eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  assessmentRecordings,
  assessmentTimelineEvents,
} from "@/lib/db/schema";
import type {
  AssessmentEventType,
  AssessmentRecording,
  AssessmentTimelineEvent,
  AssessmentTimelineEventData,
  RecordingEventCounts,
  RecordingStatus,
} from "@/lib/assessment/recording";

type RecordingRow = typeof assessmentRecordings.$inferSelect;

/** Live counts derived from the persisted events themselves — never a client-reported number. */
async function getEventCounts(recordingId: string): Promise<RecordingEventCounts> {
  const db = getDb();
  const rows = await db
    .select({
      type: assessmentTimelineEvents.type,
      count: sql<number>`count(*)::int`,
    })
    .from(assessmentTimelineEvents)
    .where(eq(assessmentTimelineEvents.recordingId, recordingId))
    .groupBy(assessmentTimelineEvents.type);

  const counts: RecordingEventCounts = {
    runCodeCount: 0,
    testRunCount: 0,
    submissionCount: 0,
  };
  for (const row of rows) {
    if (row.type === "run_code") counts.runCodeCount = row.count;
    if (row.type === "test_run") counts.testRunCount = row.count;
    if (row.type === "submission") counts.submissionCount = row.count;
  }
  return counts;
}

async function toAssessmentRecording(row: RecordingRow): Promise<AssessmentRecording> {
  return {
    id: row.id,
    assessmentId: row.assessmentId,
    candidateId: row.userId,
    status: row.status as RecordingStatus,
    startedAt: row.startedAt?.toISOString() ?? null,
    submittedAt: row.submittedAt?.toISOString() ?? null,
    duration: row.durationMs,
    language: row.language,
    counts: await getEventCounts(row.id),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/**
 * Creates the recording row for this assessment attempt if it doesn't
 * already exist, otherwise returns the existing one untouched. Called both
 * from the explicit "start recording" request and defensively from the
 * event-ingest endpoint, so a dropped/never-sent start call can't strand
 * captured events with nowhere to land.
 */
export async function ensureRecording(
  userId: string,
  assessmentId: string,
  language: string | null
): Promise<AssessmentRecording> {
  const db = getDb();
  const startedAt = new Date();
  const rows = await db
    .insert(assessmentRecordings)
    .values({
      assessmentId,
      userId,
      status: "recording",
      startedAt,
      language,
    })
    .onConflictDoNothing({ target: assessmentRecordings.assessmentId })
    .returning();

  if (rows[0]) {
    // Recorded server-side (not as a client-buffered event) so it's
    // guaranteed to exist exactly once per recording, the moment the row is
    // first created — a deterministic id makes the insert itself idempotent
    // against a racing duplicate "start" request.
    await db
      .insert(assessmentTimelineEvents)
      .values({
        id: `${rows[0].id}-started`,
        recordingId: rows[0].id,
        timestampMs: startedAt.getTime(),
        type: "assessment_started",
        data: {},
      })
      .onConflictDoNothing({ target: assessmentTimelineEvents.id });
    return toAssessmentRecording(rows[0]);
  }

  const existing = await db
    .select()
    .from(assessmentRecordings)
    .where(eq(assessmentRecordings.assessmentId, assessmentId))
    .limit(1);
  if (!existing[0] || existing[0].userId !== userId) {
    throw new Error("Recording not found for this candidate.");
  }
  return toAssessmentRecording(existing[0]);
}

export async function getRecordingByAssessmentId(
  userId: string,
  assessmentId: string
): Promise<AssessmentRecording | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(assessmentRecordings)
    .where(
      and(
        eq(assessmentRecordings.assessmentId, assessmentId),
        eq(assessmentRecordings.userId, userId)
      )
    )
    .limit(1);
  return rows[0] ? toAssessmentRecording(rows[0]) : null;
}

export async function getRecordingById(
  recordingId: string,
  userId: string
): Promise<AssessmentRecording | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(assessmentRecordings)
    .where(
      and(
        eq(assessmentRecordings.id, recordingId),
        eq(assessmentRecordings.userId, userId)
      )
    )
    .limit(1);
  return rows[0] ? toAssessmentRecording(rows[0]) : null;
}

/**
 * Inserts a batch of already-captured events, skipping any whose id was
 * already persisted (a retried flush after a dropped connection resends
 * events the server may have already stored). Returns how many were newly
 * inserted, purely for client-side/debug visibility.
 */
export async function insertEvents(
  recordingId: string,
  events: {
    id: string;
    timestamp: number;
    type: AssessmentEventType;
    data: AssessmentTimelineEventData;
  }[]
): Promise<number> {
  if (events.length === 0) return 0;
  const db = getDb();
  const rows = await db
    .insert(assessmentTimelineEvents)
    .values(
      events.map((e) => ({
        id: e.id,
        recordingId,
        timestampMs: e.timestamp,
        type: e.type,
        data: e.data,
      }))
    )
    .onConflictDoNothing({ target: assessmentTimelineEvents.id })
    .returning({ id: assessmentTimelineEvents.id });

  await db
    .update(assessmentRecordings)
    .set({ updatedAt: new Date() })
    .where(eq(assessmentRecordings.id, recordingId));

  return rows.length;
}

export async function getEventsForRecording(
  recordingId: string
): Promise<AssessmentTimelineEvent[]> {
  const db = getDb();
  const recording = await db
    .select({ assessmentId: assessmentRecordings.assessmentId, userId: assessmentRecordings.userId })
    .from(assessmentRecordings)
    .where(eq(assessmentRecordings.id, recordingId))
    .limit(1);
  const meta = recording[0];
  if (!meta) return [];

  const rows = await db
    .select()
    .from(assessmentTimelineEvents)
    .where(eq(assessmentTimelineEvents.recordingId, recordingId))
    .orderBy(asc(assessmentTimelineEvents.timestampMs), asc(assessmentTimelineEvents.seq));

  return rows.map((row) => ({
    id: row.id,
    assessmentId: meta.assessmentId,
    candidateId: meta.userId,
    timestamp: row.timestampMs,
    type: row.type as AssessmentEventType,
    data: row.data as AssessmentTimelineEventData,
  }));
}

export async function finalizeRecording(
  recordingId: string,
  { submittedAt, durationMs }: { submittedAt: Date; durationMs: number }
): Promise<AssessmentRecording | null> {
  const db = getDb();
  const rows = await db
    .update(assessmentRecordings)
    .set({
      status: "completed",
      submittedAt,
      durationMs,
      updatedAt: new Date(),
    })
    .where(eq(assessmentRecordings.id, recordingId))
    .returning();
  return rows[0] ? toAssessmentRecording(rows[0]) : null;
}

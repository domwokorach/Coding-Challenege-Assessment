import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import { ensureRecording, insertEvents } from "@/lib/assessment/recording-store";
import type { AssessmentEventType, AssessmentTimelineEventData } from "@/lib/assessment/recording";

export const dynamic = "force-dynamic";

const VALID_TYPES: AssessmentEventType[] = [
  "assessment_started",
  "code_change",
  "file_change",
  "language_change",
  "run_code",
  "test_run",
  "submission",
  "assessment_submitted",
];

type RawEvent = {
  id?: unknown;
  timestamp?: unknown;
  type?: unknown;
  data?: unknown;
};

function sanitizeEvent(raw: RawEvent) {
  if (typeof raw.id !== "string" || !raw.id) return null;
  if (typeof raw.timestamp !== "number" || !Number.isFinite(raw.timestamp)) return null;
  if (typeof raw.type !== "string" || !VALID_TYPES.includes(raw.type as AssessmentEventType)) {
    return null;
  }
  const data = (raw.data && typeof raw.data === "object" ? raw.data : {}) as AssessmentTimelineEventData;
  return {
    id: raw.id,
    timestamp: raw.timestamp,
    type: raw.type as AssessmentEventType,
    data,
  };
}

/**
 * Ingests a batch of client-buffered events. Accepts `sendBeacon` posts
 * (fired on tab close/navigation) as well as ordinary fetch — both arrive as
 * a same-origin POST with a JSON body and the session cookie attached.
 */
export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let body: { assessmentId?: unknown; language?: unknown; events?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const assessmentId = typeof body.assessmentId === "string" ? body.assessmentId : "";
  if (!assessmentId) {
    return NextResponse.json({ error: "assessmentId is required." }, { status: 400 });
  }
  const language = typeof body.language === "string" ? body.language : null;
  const rawEvents = Array.isArray(body.events) ? body.events : [];
  const events = rawEvents
    .map((e) => sanitizeEvent(e as RawEvent))
    .filter((e): e is NonNullable<typeof e> => e !== null);

  try {
    // Auto-creates the recording if a "start" call never landed (e.g. it
    // was in flight when the tab closed) — events must never be dropped
    // just because the explicit start request didn't complete.
    const recording = await ensureRecording(userId, assessmentId, language);
    const inserted = await insertEvents(recording.id, events);
    return NextResponse.json({ ok: true, recordingId: recording.id, inserted });
  } catch (error) {
    console.error("POST /api/recording/events failed", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

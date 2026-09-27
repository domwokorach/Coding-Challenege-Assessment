import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import { getRecordingById, finalizeRecording } from "@/lib/assessment/recording-store";

export const dynamic = "force-dynamic";

// Marks a recording completed once the candidate submits the assessment.
// Duration is computed server-side from the recording's own startedAt, not
// trusted from the client, so it can't be misreported.
export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let body: { recordingId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const recordingId = typeof body.recordingId === "string" ? body.recordingId : "";
  if (!recordingId) {
    return NextResponse.json({ error: "recordingId is required." }, { status: 400 });
  }

  try {
    const existing = await getRecordingById(recordingId, userId);
    if (!existing) {
      return NextResponse.json({ error: "Recording not found." }, { status: 404 });
    }

    const submittedAt = new Date();
    const durationMs = existing.startedAt
      ? submittedAt.getTime() - new Date(existing.startedAt).getTime()
      : 0;

    const recording = await finalizeRecording(recordingId, {
      submittedAt,
      durationMs: Math.max(0, durationMs),
    });
    return NextResponse.json(recording);
  } catch (error) {
    console.error("POST /api/recording/finalize failed", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

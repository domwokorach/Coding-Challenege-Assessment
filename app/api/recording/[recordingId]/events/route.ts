import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import { getRecordingById, getEventsForRecording } from "@/lib/assessment/recording-store";

export const dynamic = "force-dynamic";

// Full ordered event list for the replay player — ownership-checked so one
// candidate can never fetch another's recorded activity.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ recordingId: string }> }
) {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { recordingId } = await params;

  try {
    const recording = await getRecordingById(recordingId, userId);
    if (!recording) {
      return NextResponse.json({ error: "Recording not found." }, { status: 404 });
    }
    const events = await getEventsForRecording(recordingId);
    return NextResponse.json({ events });
  } catch (error) {
    console.error("GET /api/recording/[recordingId]/events failed", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

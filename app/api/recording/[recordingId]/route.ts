import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import { getRecordingById } from "@/lib/assessment/recording-store";

export const dynamic = "force-dynamic";

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
    return NextResponse.json(recording);
  } catch (error) {
    console.error("GET /api/recording/[recordingId] failed", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

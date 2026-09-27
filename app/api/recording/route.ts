import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import { getRecordingByAssessmentId } from "@/lib/assessment/recording-store";

export const dynamic = "force-dynamic";

// Looked up by assessmentId (from the candidate's own progress record) so
// the Candidate Report can find "the recording for my current assessment"
// without needing to know its internal recording id up front.
export async function GET(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const assessmentId = new URL(request.url).searchParams.get("assessmentId");
  if (!assessmentId) {
    return NextResponse.json({ error: "assessmentId is required." }, { status: 400 });
  }

  try {
    const recording = await getRecordingByAssessmentId(userId, assessmentId);
    return NextResponse.json(recording);
  } catch (error) {
    console.error("GET /api/recording failed", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

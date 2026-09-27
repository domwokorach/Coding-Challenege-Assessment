import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import { ensureRecording } from "@/lib/assessment/recording-store";

export const dynamic = "force-dynamic";

// Starts (or resumes, if one already exists for this assessmentId) the
// candidate's Assessment Timeline recording session.
export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let body: { assessmentId?: unknown; language?: unknown };
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

  try {
    const recording = await ensureRecording(userId, assessmentId, language);
    return NextResponse.json(recording);
  } catch (error) {
    console.error("POST /api/recording/start failed", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

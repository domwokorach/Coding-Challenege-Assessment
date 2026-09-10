import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import { readProgress, writeProgress } from "@/lib/progress-store";
import type { ProgressState } from "@/lib/progress";

// Progress is tied to the authenticated user — read the session cookie,
// verify the JWT, and use the user id extracted from the verified token
// (never a client-supplied id) to load/save the correct candidate data.
export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const data = await readProgress(userId);
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/progress failed", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let data: ProgressState;
  try {
    data = (await request.json()) as ProgressState;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    await writeProgress(userId, data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PUT /api/progress failed", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { readProgress, writeProgress } from "@/lib/progress-store";
import type { ProgressState } from "@/lib/progress";

// The app has no authentication — every visitor shares the single implicit
// guest record. No database is configured, so this is backed by an
// in-memory store rather than persistent storage.
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(readProgress());
}

export async function PUT(request: Request) {
  const data = (await request.json()) as ProgressState;
  writeProgress(data);
  return NextResponse.json({ ok: true });
}

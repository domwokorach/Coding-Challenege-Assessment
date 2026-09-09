import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { progress as progressTable, GUEST_USER_ID } from "@/lib/schema";
import type { ProgressState } from "@/lib/progress";

// The app has no authentication — every visitor shares the single implicit
// guest identity, so progress is always read/written under GUEST_USER_ID.
//
// Hits the database on every request and must not be statically optimized
// at build time (no DATABASE_URL is available then).
export const dynamic = "force-dynamic";

export async function GET() {
  const db = getDb();
  const [row] = await db
    .select()
    .from(progressTable)
    .where(eq(progressTable.userId, GUEST_USER_ID))
    .limit(1);

  return NextResponse.json(row?.data ?? null);
}

export async function PUT(request: Request) {
  const data = (await request.json()) as ProgressState;
  const db = getDb();

  await db
    .insert(progressTable)
    .values({
      userId: GUEST_USER_ID,
      data,
      certificateId: data.certificateId,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: progressTable.userId,
      set: {
        data,
        certificateId: data.certificateId,
        updatedAt: new Date(),
      },
    });

  return NextResponse.json({ ok: true });
}

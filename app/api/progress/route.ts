import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { progress as progressTable } from "@/lib/schema";
import type { ProgressState } from "@/lib/progress";

// Authentication is verified server-side via Clerk's session (auth()), not
// a client-supplied id — the learner's identity never comes from the request.

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const [row] = await db
    .select()
    .from(progressTable)
    .where(eq(progressTable.userId, userId))
    .limit(1);

  return NextResponse.json(row?.data ?? null);
}

export async function PUT(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = (await request.json()) as ProgressState;
  const db = getDb();

  await db
    .insert(progressTable)
    .values({
      userId,
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

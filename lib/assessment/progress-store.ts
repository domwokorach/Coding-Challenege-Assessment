import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { progress as progressTable } from "@/lib/db/schema";
import type { ProgressState } from "@/lib/assessment/progress";

/**
 * Progress is now tied to a real authenticated user row rather than one
 * shared in-memory "guest" record. `readProgress`/`writeProgress` take the
 * authenticated user's id (extracted server-side from the verified JWT —
 * never from a request body/query param) and operate on that user's own
 * `progress` row.
 */
export async function readProgress(
  userId: string
): Promise<ProgressState | null> {
  const db = getDb();
  const rows = await db
    .select({ data: progressTable.data })
    .from(progressTable)
    .where(eq(progressTable.userId, userId))
    .limit(1);
  return (rows[0]?.data as ProgressState | undefined) ?? null;
}

export async function writeProgress(
  userId: string,
  data: ProgressState
): Promise<void> {
  const db = getDb();
  const certificateId = data.certificateId ?? null;
  await db
    .insert(progressTable)
    .values({ userId, data, certificateId, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: progressTable.userId,
      set: { data, certificateId, updatedAt: new Date() },
    });
}

/**
 * Certificates are public by design — anyone with the link can verify one,
 * without being signed in or owning the record. Looked up by the
 * denormalized certificateId, not the owning user, so this stays
 * unauthenticated by design.
 */
export async function readProgressByCertificateId(
  certificateId: string
): Promise<ProgressState | null> {
  const db = getDb();
  const rows = await db
    .select({ data: progressTable.data })
    .from(progressTable)
    .where(eq(progressTable.certificateId, certificateId))
    .limit(1);
  return (rows[0]?.data as ProgressState | undefined) ?? null;
}

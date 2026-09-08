import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { progress as progressTable } from "@/lib/schema";
import type { ProgressState } from "@/lib/progress";

/**
 * Certificates are public by design — anyone with the link can verify one,
 * without being signed in or owning the record. Looked up by the
 * denormalized certificateId column, not the owning user.
 */
export async function getProgressByCertificateId(
  certificateId: string
): Promise<ProgressState | null> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(progressTable)
    .where(eq(progressTable.certificateId, certificateId))
    .limit(1);
  return (row?.data as ProgressState | undefined) ?? null;
}

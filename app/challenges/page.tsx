import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { progress as progressTable, GUEST_USER_ID } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { challenges, getNextIncompleteSlug } from "@/lib/challenges";
import type { ProgressState } from "@/lib/progress";

// Reads live progress from the database on every request — must not be
// statically prerendered at build time (no DATABASE_URL is available then).
export const dynamic = "force-dynamic";

export default async function ChallengesIndexPage() {
  const db = getDb();
  const [row] = await db
    .select()
    .from(progressTable)
    .where(eq(progressTable.userId, GUEST_USER_ID))
    .limit(1);

  const completed = (row?.data as ProgressState | undefined)?.completed ?? {};
  const slug = getNextIncompleteSlug(completed);
  redirect(`/challenges/${slug ?? challenges[0].slug}`);
}

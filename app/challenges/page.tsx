import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { progress as progressTable } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { challenges, getNextIncompleteSlug } from "@/lib/challenges";
import type { ProgressState } from "@/lib/progress";

export default async function ChallengesIndexPage() {
  const { userId } = await auth();
  if (!userId) redirect("/auth-required?next=/challenges");

  const db = getDb();
  const [row] = await db
    .select()
    .from(progressTable)
    .where(eq(progressTable.userId, userId))
    .limit(1);

  const completed = (row?.data as ProgressState | undefined)?.completed ?? {};
  const slug = getNextIncompleteSlug(completed);
  redirect(`/challenges/${slug ?? challenges[0].slug}`);
}

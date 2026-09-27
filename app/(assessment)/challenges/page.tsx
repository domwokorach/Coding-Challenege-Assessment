import { redirect } from "next/navigation";
import { readProgress } from "@/lib/assessment/progress-store";
import { getAuthenticatedUserId } from "@/lib/auth";
import { challenges, getNextIncompleteSlug } from "@/lib/assessment/challenges";

// Reads live progress on every request — must not be statically
// prerendered at build time.
export const dynamic = "force-dynamic";

export default async function ChallengesIndexPage() {
  // proxy.ts already gates this route, but the page re-verifies rather
  // than trusting that alone — belt and suspenders.
  const userId = await getAuthenticatedUserId();
  if (!userId) redirect("/login?next=/challenges");

  const data = await readProgress(userId);
  const slug = getNextIncompleteSlug(data?.completed ?? {});
  redirect(`/challenges/${slug ?? challenges[0].slug}`);
}

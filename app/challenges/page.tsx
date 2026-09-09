import { redirect } from "next/navigation";
import { readProgress } from "@/lib/progress-store";
import { challenges, getNextIncompleteSlug } from "@/lib/challenges";

// Reads live progress on every request — no database is configured, so
// this comes from the in-memory store and must not be statically
// prerendered at build time.
export const dynamic = "force-dynamic";

export default function ChallengesIndexPage() {
  const completed = readProgress()?.completed ?? {};
  const slug = getNextIncompleteSlug(completed);
  redirect(`/challenges/${slug ?? challenges[0].slug}`);
}

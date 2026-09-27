import Link from "next/link";
import { redirect } from "next/navigation";
import { challenges } from "@/lib/assessment/challenges";
import { createDefaultProgress, normalizeProgress } from "@/lib/assessment/progress";
import { readProgress } from "@/lib/assessment/progress-store";
import { getAuthenticatedUserId } from "@/lib/auth";
import { SiteFooter } from "@/components/layout/site-footer";

// Reads live progress on every request — must not be statically
// prerendered at build time.
export const dynamic = "force-dynamic";

export default async function ProgrammePage() {
  // proxy.ts already gates this route, but the page re-verifies rather
  // than trusting that alone — belt and suspenders.
  const userId = await getAuthenticatedUserId();
  if (!userId) redirect("/login?next=/programme");

  const starterCodeById = Object.fromEntries(
    challenges.map((c) => [c.id, c.starterCode])
  );
  const data = normalizeProgress(
    await readProgress(userId),
    createDefaultProgress(starterCodeById)
  );
  const completedCount = challenges.filter((c) => data.completed[c.id]).length;
  const courseCompleted = data.courseCompleted;
  const assessmentStarted = data.assessmentStarted;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-zinc-200 bg-white px-4 py-3 sm:px-6 dark:border-zinc-800 dark:bg-zinc-950">
        <Link
          href="/"
          aria-label="Software Engineer Programme home"
          className="min-w-0 truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100"
        >
          Software Engineer Programme
        </Link>
        <Link
          href="/account"
          className="shrink-0 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Account
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-bold">Software Engineer Programme</h1>
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          Beginner Friendly → Intermediate
        </p>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {challenges.length} Chapters · {challenges.length} Coding
          Challenges
        </p>
        <p className="max-w-sm text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Learn JavaScript fundamentals through practical coding exercises
          and automated tests.
        </p>

        <div className="w-full rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Course Progress
          </p>
          <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {completedCount} / {challenges.length} Chapters Completed
          </p>
        </div>

        {courseCompleted ? (
          <div className="flex flex-col items-center gap-4">
            <p className="font-semibold text-emerald-600 dark:text-emerald-400">
              ✓ Course Completed
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href={`/challenges/${challenges[0].slug}`}
                className="rounded-md border border-zinc-300 bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              >
                Review Challenges
              </Link>
              <Link
                href="/coding-assessment"
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
              >
                View Certificate
              </Link>
            </div>
          </div>
        ) : (
          <Link
            href="/coding-assessment"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
          >
            {assessmentStarted
              ? "Continue Coding Assessment"
              : "Start Coding Assessment"}
          </Link>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

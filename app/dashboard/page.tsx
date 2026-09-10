"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import { CandidateDashboard } from "@/components/candidate-dashboard";
import { useProgress } from "@/hooks/use-progress";
import { challenges } from "@/lib/challenges";
import { createDefaultProgress } from "@/lib/progress";
import { buildAssessmentResults } from "@/lib/assessment-results";

export default function DashboardPage() {
  const starterCodeById = Object.fromEntries(
    challenges.map((c) => [c.id, c.starterCode])
  );
  const { progress, loaded } = useProgress(() =>
    createDefaultProgress(starterCodeById)
  );

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="flex shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6 py-3 dark:border-zinc-800 dark:bg-zinc-950">
        <Link
          href="/programme"
          aria-label="Software Engineer Programme home"
          className="flex items-center gap-3"
        >
          <Logo size={36} />
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Software Engineer Programme
          </p>
        </Link>
        <Link
          href="/programme"
          className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Return to Software Engineer Programme
        </Link>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10 sm:py-12">
        {!loaded || !progress ? (
          <p className="py-24 text-center text-sm text-zinc-500 dark:text-zinc-500">
            Loading…
          </p>
        ) : progress.assessmentStarted ? (
          <CandidateDashboard
            learnerName={progress.learnerName}
            results={buildAssessmentResults(challenges, progress)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <p className="text-lg font-semibold">No assessment data yet</p>
            <p className="max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
              Start the coding assessment to begin generating your dashboard
              results.
            </p>
            <Link
              href="/coding-assessment"
              className="mt-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
            >
              Go to Coding Assessment
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

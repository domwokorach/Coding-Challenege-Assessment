"use client";

import Link from "next/link";
import { CandidateDashboard } from "@/components/candidate-dashboard";
import { LogoutButton } from "@/components/logout-button";
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
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-zinc-200 bg-white px-4 py-3 sm:px-6 dark:border-zinc-800 dark:bg-zinc-950">
        <Link
          href="/"
          aria-label="Software Engineer Programme home"
          className="min-w-0 truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100"
        >
          Software Engineer Programme
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/programme"
            className="shrink-0 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <span className="sm:hidden">Programme</span>
            <span className="hidden sm:inline">Return to Software Engineer Programme</span>
          </Link>
          <LogoutButton redirectTo="/" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-12">
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

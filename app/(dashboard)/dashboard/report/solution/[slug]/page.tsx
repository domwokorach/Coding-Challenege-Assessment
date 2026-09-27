"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SolutionReview } from "@/components/dashboard/solution-review";
import { useProgress } from "@/hooks/use-progress";
import { challenges, getChallengeBySlug } from "@/lib/assessment/challenges";
import { createDefaultProgress } from "@/lib/assessment/progress";
import { buildAssessmentResults } from "@/lib/assessment/scoring";

export default function SolutionReviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const challenge = getChallengeBySlug(slug);

  const starterCodeById = Object.fromEntries(
    challenges.map((c) => [c.id, c.starterCode])
  );
  const { progress, loaded } = useProgress(() =>
    createDefaultProgress(starterCodeById)
  );

  if (!challenge) {
    notFound();
  }

  if (!loaded || !progress) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-sm text-zinc-500 dark:text-zinc-500">Loading…</p>
      </div>
    );
  }

  const task = buildAssessmentResults(challenges, progress).tasks.find(
    (t) => t.slug === slug
  );
  const code = progress.code[challenge.id] ?? challenge.starterCode;

  if (!task) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="border-b border-zinc-200 bg-white px-4 py-4 sm:px-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Software Engineer Programme
          </p>
          <Link
            href="/dashboard/report"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Back to Candidate Report
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <SolutionReview challenge={challenge} task={task} code={code} />
      </main>
    </div>
  );
}

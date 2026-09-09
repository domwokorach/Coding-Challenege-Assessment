"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CompletionScreen } from "@/components/completion-screen";
import { SiteFooter } from "@/components/site-footer";
import { useProgress } from "@/hooks/use-progress";
import { challenges, getNextIncompleteSlug } from "@/lib/challenges";
import { buildAssessmentResults } from "@/lib/assessment-results";
import {
  buildCertificateUrl,
  computeExpiryDate,
  createDefaultProgress,
  formatCertificateDate,
  generateCertificateId,
  isCertificateExpired,
} from "@/lib/progress";

export default function CodingAssessmentPage() {
  const router = useRouter();
  const [confirmNameOpen, setConfirmNameOpen] = useState(false);

  const starterCodeById = useMemo(
    () => Object.fromEntries(challenges.map((c) => [c.id, c.starterCode])),
    []
  );
  const { progress, setProgress, loaded } = useProgress(() =>
    createDefaultProgress(starterCodeById)
  );

  if (!loaded || !progress) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-sm text-zinc-500 dark:bg-zinc-950 dark:text-zinc-500">
        Loading…
      </div>
    );
  }

  function handleLearnerNameChange(name: string) {
    setProgress((prev) =>
      prev && !prev.nameConfirmed ? { ...prev, learnerName: name } : prev
    );
  }

  function handleRequestConfirmName() {
    if (!progress || !progress.learnerName.trim()) return;
    setConfirmNameOpen(true);
  }

  function handleAcceptName() {
    if (!progress || progress.nameConfirmed) return;
    const certificateId = generateCertificateId();
    const now = new Date().toISOString();
    const expiryDate = computeExpiryDate(now);
    const confirmedName = progress.learnerName.trim();
    setProgress((prev) =>
      prev
        ? {
            ...prev,
            learnerName: confirmedName,
            nameConfirmed: true,
            nameConfirmedAt: now,
            certificateId,
            certificateUrl: buildCertificateUrl(certificateId),
            issueDate: now,
            expiryDate,
          }
        : prev
    );
    setConfirmNameOpen(false);
    router.push(`/certificate/${certificateId}`);
  }

  function handleDeclineName() {
    setConfirmNameOpen(false);
  }

  if (progress.courseCompleted) {
    const issueDateLabel = progress.issueDate
      ? formatCertificateDate(progress.issueDate)
      : null;
    const expiryDateLabel = progress.expiryDate
      ? formatCertificateDate(progress.expiryDate)
      : null;
    const { overall } = buildAssessmentResults(challenges, progress);

    return (
      <CompletionScreen
        challenges={challenges}
        completed={progress.completed}
        courseCompleted
        learnerName={progress.learnerName}
        onLearnerNameChange={handleLearnerNameChange}
        nameConfirmed={progress.nameConfirmed}
        confirmNameOpen={confirmNameOpen}
        onRequestConfirmName={handleRequestConfirmName}
        onAcceptName={handleAcceptName}
        onDeclineName={handleDeclineName}
        certificateId={progress.certificateId}
        certificateUrl={progress.certificateUrl}
        issueDateLabel={issueDateLabel}
        expiryDateLabel={expiryDateLabel}
        isExpired={isCertificateExpired(progress.expiryDate)}
        overall={overall}
        onReviewChallenges={() => router.push(`/challenges/${challenges[0].slug}`)}
      />
    );
  }

  const completedCount = challenges.filter((c) => progress.completed[c.id]).length;

  function handleStart() {
    setProgress((prev) =>
      prev
        ? {
            ...prev,
            assessmentStarted: true,
            assessmentStartedAt: new Date().toISOString(),
          }
        : prev
    );
    router.push(`/challenges/${challenges[0].slug}`);
  }

  function handleContinue() {
    router.push(`/challenges/${getNextIncompleteSlug(progress!.completed)}`);
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="flex shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6 py-3 dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Software Engineer Programme
        </p>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
        {progress.assessmentStarted ? (
          <>
            <h1 className="text-2xl font-bold">Welcome Back</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Software Engineer Programme
            </p>

            <div className="w-full rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Course Progress
              </p>
              <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {completedCount} / {challenges.length} Chapters Completed
              </p>
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                Your coding assessment is still in progress.
              </p>
            </div>

            <Button
              onClick={handleContinue}
              className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
            >
              Continue Coding Assessment
            </Button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold">Coding Assessment</h1>

            <div className="w-full rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Progress
              </p>
              <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                0 / {challenges.length}
              </p>
            </div>

            <div>
              <p className="text-lg font-semibold">Ready to begin?</p>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                You&apos;ll complete three coding challenges covering Arrays,
                Functions, and Objects.
              </p>
            </div>

            <Button
              onClick={handleStart}
              className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
            >
              Start Coding Assessment
            </Button>
          </>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

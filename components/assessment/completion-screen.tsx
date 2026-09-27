"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Confetti } from "@/registry/magicui/confetti";
import { WarpBackground } from "@/registry/magicui/warp-background";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { GITHUB_DISCUSSIONS_URL } from "@/lib/config";
import { COURSE_NAME, JUST_COMPLETED_ASSESSMENT_KEY } from "@/lib/assessment/progress";
import type { Challenge } from "@/lib/assessment/challenges";
import type { OverallResult } from "@/lib/assessment/scoring";

export function CompletionScreen({
  challenges,
  completed,
  courseCompleted,
  learnerName,
  onLearnerNameChange,
  nameConfirmed,
  confirmNameOpen,
  onRequestConfirmName,
  onAcceptName,
  onDeclineName,
  certificateId,
  certificateUrl,
  issueDateLabel,
  expiryDateLabel,
  isExpired,
  overall,
  onReviewChallenges,
}: {
  challenges: Challenge[];
  completed: Record<number, boolean>;
  courseCompleted: boolean;
  learnerName: string;
  onLearnerNameChange: (name: string) => void;
  nameConfirmed: boolean;
  confirmNameOpen: boolean;
  onRequestConfirmName: () => void;
  onAcceptName: () => void;
  onDeclineName: () => void;
  certificateId: string | null;
  certificateUrl: string | null;
  issueDateLabel: string | null;
  expiryDateLabel: string | null;
  isExpired: boolean;
  overall: OverallResult;
  onReviewChallenges: () => void;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const reducedMotion = useReducedMotion();
  const checkedCelebrateRef = useRef(false);

  // Confetti fires exactly once — right after the candidate lands here from
  // actually submitting (flagged in sessionStorage by the submit action) —
  // never on a later revisit to this already-completed screen, and never
  // again on ordinary re-renders.
  useEffect(() => {
    if (checkedCelebrateRef.current || !courseCompleted) return;
    checkedCelebrateRef.current = true;
    if (sessionStorage.getItem(JUST_COMPLETED_ASSESSMENT_KEY) === "1") {
      sessionStorage.removeItem(JUST_COMPLETED_ASSESSMENT_KEY);
      setCelebrate(true);
    }
  }, [courseCompleted]);

  const completedCount = challenges.filter((c) => completed[c.id]).length;
  const percent = Math.round((completedCount / challenges.length) * 100);
  const hasActiveCertificate = nameConfirmed && !!certificateId && !isExpired;

  function handleViewCertificate() {
    if (hasActiveCertificate && certificateId) {
      router.push(`/certificate/${certificateId}`);
    }
  }

  function handleViewDashboard() {
    router.push("/dashboard");
  }

  async function handleCopyLink() {
    if (!hasActiveCertificate || !certificateUrl) return;
    await navigator.clipboard.writeText(certificateUrl);
    setCopied(true);
    toast.add({
      title: "Certificate link copied",
      type: "success",
    });
    setTimeout(() => setCopied(false), 2000);
  }

  const CongratulationsHeading = (
    <div className="text-center">
      <p className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
        ✓ Course Completed
      </p>
      <h1 className="mt-4 text-2xl font-bold sm:text-3xl">
        Congratulations! 🎉
      </h1>
      <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        You&apos;ve successfully completed and submitted the{" "}
        <span className="text-zinc-900 dark:text-zinc-200">
          {COURSE_NAME}
        </span>{" "}
        coding assessment — and what a journey it&apos;s been! You
        have now completed all 3 chapters and their coding
        challenges.
      </p>
      {overall.totalTests > 0 && (
        <p
          className="mt-4 inline-flex items-baseline gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 dark:border-zinc-800 dark:bg-zinc-900"
          aria-label={`Overall assessment score: ${overall.scoreEarned} out of ${overall.scoreMax}, ${overall.scorePercent} percent`}
        >
          <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {overall.scoreEarned} / {overall.scoreMax}
          </span>
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-500">
            — {overall.scorePercent}%
          </span>
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-12 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {celebrate && (
        <Confetti
          className="pointer-events-none fixed inset-0 z-50 size-full"
          options={{ particleCount: 150, spread: 90, origin: { y: 0.3 } }}
        />
      )}
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        {courseCompleted && (
          <>
            {reducedMotion ? (
              <div className="rounded-2xl border border-zinc-200 p-8 dark:border-zinc-800">
                {CongratulationsHeading}
              </div>
            ) : (
              <WarpBackground
                perspective={140}
                beamsPerSide={2}
                beamSize={4}
                beamDuration={4}
                className="rounded-2xl border-zinc-200 p-8 dark:border-zinc-800"
              >
                {CongratulationsHeading}
              </WarpBackground>
            )}

            {/* Certificate Section */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Your Certificate
              </h2>
              {!nameConfirmed ? (
                <>
                  <p className="mt-3 text-sm font-medium text-amber-600 dark:text-amber-400">
                    Status: Not yet generated
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                    Enter your full name exactly as you want it to appear on
                    your certificate to generate it.
                  </p>

                  <input
                    value={learnerName}
                    onChange={(e) => onLearnerNameChange(e.target.value)}
                    placeholder="John Smith"
                    className="mt-4 w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                  />

                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button
                      onClick={onRequestConfirmName}
                      disabled={!learnerName.trim()}
                      className="bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
                    >
                      Confirm Name
                    </Button>
                  </div>

                  <Dialog
                    open={confirmNameOpen}
                    onOpenChange={(open) => {
                      if (!open) onDeclineName();
                    }}
                  >
                    <DialogContent showCloseButton={false}>
                      <DialogHeader>
                        <DialogTitle>Confirm Certificate Name</DialogTitle>
                        <DialogDescription>
                          Your certificate will be issued to:
                        </DialogDescription>
                      </DialogHeader>

                      <p className="text-center text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                        {learnerName.trim()}
                      </p>

                      <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                        Once confirmed, this name cannot be edited or changed.
                      </p>

                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={onDeclineName}
                          className="border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        >
                          Decline
                        </Button>
                        <Button
                          onClick={onAcceptName}
                          className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
                        >
                          Accept
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              ) : isExpired ? (
                <>
                  <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">
                    Status: Expired
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                    The certificate issued to{" "}
                    <span className="text-zinc-900 dark:text-zinc-100">
                      {learnerName}
                    </span>{" "}
                    expired on {expiryDateLabel} and is no longer available as
                    a valid public certificate. Its link, download, and print
                    are disabled.
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                    Your certificate is ready. You have successfully
                    completed all chapters and coding challenges in the{" "}
                    <span className="text-zinc-900 dark:text-zinc-100">
                      {COURSE_NAME}
                    </span>
                    .
                  </p>

                  <p className="mt-5 text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Name on certificate
                  </p>
                  <p className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    {learnerName} <span aria-hidden>🔒</span>
                  </p>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Button
                      onClick={handleViewCertificate}
                      className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
                    >
                      View Certificate
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => void handleCopyLink()}
                      className="border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                    >
                      {copied ? "✓ Link Copied" : "Copy Link"}
                    </Button>
                  </div>
                  {copied && (
                    <p className="mt-2 text-xs text-zinc-500">
                      Certificate link copied to clipboard.
                    </p>
                  )}
                  <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-500">
                    Status:{" "}
                    <span className="text-emerald-600 dark:text-emerald-400">
                      Valid
                    </span>
                  </p>
                  {issueDateLabel && (
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-600">
                      Issued: {issueDateLabel} · Expires: {expiryDateLabel}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Dashboard Section */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                View your Dashboard
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                See a full breakdown of your tasks, test results, scores, and
                correctness for this assessment.
              </p>
              <Button
                onClick={handleViewDashboard}
                className="mt-4 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
              >
                View Dashboard
              </Button>
            </div>
          </>
        )}

        {/* Progress Summary */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Course Progress
          </p>
          <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {completedCount} / {challenges.length} Chapters Completed
          </p>

          <ul className="mt-4 space-y-2">
            {challenges.map((c) => (
              <li key={c.id} className="flex items-center gap-2 text-sm">
                {completed[c.id] ? (
                  <span className="text-emerald-600 dark:text-emerald-400">
                    ✓
                  </span>
                ) : (
                  <span className="text-zinc-400 dark:text-zinc-600">○</span>
                )}
                <span
                  className={
                    completed[c.id]
                      ? "text-zinc-800 dark:text-zinc-200"
                      : "text-zinc-500"
                  }
                >
                  {c.category} — {c.title}
                </span>
              </li>
            ))}
          </ul>

          <Progress
            value={percent}
            className="mt-5 [&_[data-slot=progress-track]]:h-2 [&_[data-slot=progress-track]]:bg-zinc-200 [&_[data-slot=progress-indicator]]:bg-emerald-500 dark:[&_[data-slot=progress-track]]:bg-zinc-800 dark:[&_[data-slot=progress-indicator]]:bg-emerald-400"
          />
          <p className="mt-2 text-right text-xs font-medium text-zinc-600 dark:text-zinc-400">
            {percent}% Complete
          </p>

          {!courseCompleted && (
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
              Complete all challenges to unlock your certificate.
            </p>
          )}
        </div>

        {courseCompleted && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Share your progress
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Completed the {COURSE_NAME}? Share what you built, ask
              questions, and connect with other learners on GitHub
              Discussions.
            </p>
            <Button
              variant="outline"
              className="mt-4 border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              onClick={() =>
                window.open(
                  GITHUB_DISCUSSIONS_URL,
                  "_blank",
                  "noopener,noreferrer"
                )
              }
            >
              Open GitHub Discussions
            </Button>
          </div>
        )}

        <nav
          aria-label="Completion actions"
          className="flex flex-col gap-4 border-t border-zinc-200 pt-6 dark:border-zinc-800 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
        >
          <Button
            variant="ghost"
            onClick={onReviewChallenges}
            className="text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            ← Review Challenges
          </Button>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => router.push("/programme")}
              className="border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              Return to Software Engineer Programme
            </Button>
            {courseCompleted && (
              <Button
                variant="outline"
                onClick={handleViewDashboard}
                className="border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              >
                View Dashboard
              </Button>
            )}
            <Button
              onClick={handleViewCertificate}
              disabled={!hasActiveCertificate}
              className="bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
            >
              View Certificate
            </Button>
          </div>
        </nav>
      </div>
    </div>
  );
}

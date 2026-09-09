"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Moon, ShieldAlert, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { CodeEditor } from "@/components/code-editor";
import { SolutionDialog } from "@/components/solution-dialog";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useProgress } from "@/hooks/use-progress";
import { useAntiCheat, SUSPEND_AFTER_VIOLATIONS } from "@/hooks/use-anti-cheat";
import { cn } from "@/lib/utils";
import {
  challenges,
  formatValue,
  getChallengeBySlug,
  runChallengeTests,
  type TestOutcome,
} from "@/lib/challenges";
import { solutionsById } from "@/lib/solutions";
import {
  createDefaultProgress,
  createSolutionTimer,
  formatCountdown,
  formatDurationWords,
  solutionSecondsRemaining,
  type ChallengeStatus as Status,
  type ChallengeResult,
} from "@/lib/progress";

type Mode = "candidate" | "review";

const TOTAL_SECONDS = 30 * 60;

const EMPTY_RESULT: ChallengeResult = {
  status: "ready",
  outcomes: null,
  runtimeError: null,
};

function formatTime(totalSeconds: number) {
  const clamped = Math.max(0, totalSeconds);
  const h = Math.floor(clamped / 3600);
  const m = Math.floor((clamped % 3600) / 60);
  const s = clamped % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export default function ChallengePage(
  props: PageProps<"/challenges/[slug]">
) {
  const { slug } = use(props.params);
  const router = useRouter();
  const [rightTab, setRightTab] = useState<"browser" | "console">("browser");
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [mode, setMode] = useState<Mode>("review");
  const [solutionOpen, setSolutionOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") return true;
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return true;
  });

  const starterCodeById = useMemo(
    () => Object.fromEntries(challenges.map((c) => [c.id, c.starterCode])),
    []
  );
  const { progress, setProgress, loaded } = useProgress(() =>
    createDefaultProgress(starterCodeById)
  );
  const {
    violationCount,
    warning,
    suspended,
    acknowledge,
    blockCopyOrCut,
    blockContextMenu,
  } = useAntiCheat();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const challenge = getChallengeBySlug(slug);

  useEffect(() => {
    if (!challenge) router.replace("/challenges");
  }, [challenge, router]);

  useEffect(() => {
    if (!loaded || !progress || progress.assessmentStarted) return;
    setProgress((prev) =>
      prev
        ? {
            ...prev,
            assessmentStarted: true,
            assessmentStartedAt: new Date().toISOString(),
          }
        : prev
    );
  }, [loaded, progress, setProgress]);

  // Solution unlock countdown — starts the moment a challenge is first
  // opened and is stored server-side so a refresh can't reset it.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!loaded || !challenge) return;
    setProgress((prev) => {
      if (!prev || prev.solutionTimers[challenge.id]) return prev;
      return {
        ...prev,
        solutionTimers: {
          ...prev.solutionTimers,
          [challenge.id]: createSolutionTimer(),
        },
      };
    });
  }, [loaded, challenge, setProgress]);

  const index = challenge ? challenges.indexOf(challenge) : 0;
  const solution = challenge ? solutionsById[challenge.id] : undefined;

  const code = challenge
    ? progress?.code[challenge.id] ?? challenge.starterCode
    : "";
  const result = challenge
    ? progress?.results[challenge.id] ?? EMPTY_RESULT
    : EMPTY_RESULT;
  const { status, outcomes, runtimeError } = result;

  const failedCount = useMemo(
    () => outcomes?.filter((o) => !o.pass).length ?? 0,
    [outcomes]
  );
  const firstFailure = useMemo(
    () => outcomes?.find((o) => !o.pass) ?? null,
    [outcomes]
  );

  const allCompleted = challenges.every((c) => progress?.completed[c.id]);
  const isLastChallenge = index === challenges.length - 1;

  // Review mode is an interviewer/admin override that bypasses the
  // countdown entirely; candidates always go through the timed unlock.
  const solutionBypassed = mode === "review";
  const solutionTimer = challenge ? progress?.solutionTimers[challenge.id] : undefined;
  const solutionSecondsLeft = solutionSecondsRemaining(solutionTimer, now);
  const solutionLocked = !solutionBypassed && solutionSecondsLeft > 0;

  const sawLockedRef = useRef<Record<number, boolean>>({});
  useEffect(() => {
    if (!challenge || solutionBypassed) return;
    if (solutionLocked) {
      sawLockedRef.current[challenge.id] = true;
      return;
    }
    if (sawLockedRef.current[challenge.id]) {
      sawLockedRef.current[challenge.id] = false;
      toast.add({
        title: "Solution available",
        description: "You can now view the reference solution.",
        type: "success",
      });
    }
  }, [challenge, solutionBypassed, solutionLocked]);

  function handleSolutionClick() {
    if (solutionLocked) {
      toast.add({
        title: "Solution locked",
        description: `The reference solution will be available in ${formatDurationWords(solutionSecondsLeft)}.`,
        type: "warning",
      });
      return;
    }
    setSolutionOpen(true);
  }

  function setCode(value: string) {
    if (!challenge) return;
    setProgress((prev) =>
      prev ? { ...prev, code: { ...prev.code, [challenge.id]: value } } : prev
    );
  }

  function setResult(challengeId: number, next: ChallengeResult) {
    setProgress((prev) =>
      prev
        ? { ...prev, results: { ...prev.results, [challengeId]: next } }
        : prev
    );
  }

  function goTo(nextIndex: number) {
    const target = challenges[nextIndex];
    if (!target) return;
    setRightTab("browser");
    setSolutionOpen(false);
    router.push(`/challenges/${target.slug}`);
  }

  function handleReset() {
    if (!challenge) return;
    setCode(challenge.starterCode);
    setResult(challenge.id, EMPTY_RESULT);
  }

  async function handleRunTest() {
    if (!challenge) return;
    setResult(challenge.id, { status: "running", outcomes: null, runtimeError: null });
    setRightTab("console");
    await new Promise((resolve) => setTimeout(resolve, 450));
    const testResult = runChallengeTests(challenge, code);
    const fails = testResult.outcomes.filter((o) => !o.pass).length;
    const nextStatus: Status = fails === 0 ? "passed" : "failed";
    setProgress((prev) => {
      if (!prev) return prev;
      const alreadyCompleted = Boolean(prev.completed[challenge.id]);
      return {
        ...prev,
        results: {
          ...prev.results,
          [challenge.id]: {
            status: nextStatus,
            outcomes: testResult.outcomes,
            runtimeError: testResult.error,
          },
        },
        completed:
          nextStatus === "passed"
            ? { ...prev.completed, [challenge.id]: true }
            : prev.completed,
        completedAt:
          nextStatus === "passed" && !alreadyCompleted
            ? { ...prev.completedAt, [challenge.id]: new Date().toISOString() }
            : prev.completedAt,
        attempts: {
          ...prev.attempts,
          [challenge.id]: (prev.attempts[challenge.id] ?? 0) + 1,
        },
      };
    });
  }

  function handleCompleteCourse() {
    if (!allCompleted) return;
    setProgress((prev) => {
      if (!prev) return prev;
      if (prev.courseCompleted) return prev;
      return {
        ...prev,
        courseCompleted: true,
        completionDate: new Date().toISOString(),
      };
    });
    router.push("/coding-assessment");
  }

  if (!loaded || !progress || !challenge) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50 text-sm text-zinc-500 dark:bg-zinc-950 dark:text-zinc-500">
        Loading…
      </div>
    );
  }

  return (
    <>
    <SidebarProvider
      className={cn(
        "h-screen min-h-0 select-none bg-zinc-50 text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-zinc-100",
        (warning || suspended) && "pointer-events-none blur-sm"
      )}
      onCopy={blockCopyOrCut}
      onCut={blockCopyOrCut}
      onContextMenu={blockContextMenu}
    >
      <AppSidebar
        challenges={challenges}
        activeIndex={index}
        completed={progress.completed}
        onSelect={goTo}
        courseCompleted={progress.courseCompleted}
        onViewProgress={() => router.push("/coding-assessment")}
      />
      <SidebarInset className="h-screen min-h-0">
      {/* Top navigation */}
      <header className="flex shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6 py-3 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800" />
          <div>
            <p className="text-sm font-semibold leading-tight text-zinc-900 dark:text-zinc-100">
              Software Engineer Programme
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Coding Assessment
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <Switch
              size="sm"
              checked={mode === "review"}
              onCheckedChange={(checked) => {
                setMode(checked ? "review" : "candidate");
                if (!checked) setSolutionOpen(false);
              }}
            />
            {mode === "review" ? "Review Mode" : "Candidate Mode"}
          </label>
          <button
            type="button"
            onClick={() => router.push("/coding-assessment")}
            className="flex items-center gap-1.5 rounded-md border border-zinc-300 bg-zinc-100 px-2.5 py-1 text-sm text-zinc-700 hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            {progress.courseCompleted && <span aria-hidden>🏆</span>}
            Progress
          </button>
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            Challenge {index + 1} of {challenges.length}
          </span>
          <span className="rounded-md border border-zinc-300 bg-zinc-100 px-2.5 py-1 font-mono text-sm tabular-nums text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
            {formatTime(secondsLeft)}
          </span>
          {violationCount > 0 && (
            <span
              className="flex items-center gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1 text-sm font-medium text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400"
              title="Security warnings recorded during this assessment"
            >
              <ShieldAlert className="size-4" aria-hidden />
              {violationCount}
            </span>
          )}
          <button
            type="button"
            onClick={() => setDarkMode((d) => !d)}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {darkMode ? (
              <Moon className="size-4" />
            ) : (
              <Sun className="size-4" />
            )}
          </button>
        </div>
      </header>

      {/* Main workspace */}
      <ResizablePanelGroup className="min-h-0 flex-1">
        {/* Main content — instructions + code editor */}
        <ResizablePanel minSize={480} className="min-h-0">
      <div className="grid h-full min-h-0 grid-cols-1 lg:grid-cols-[280px_1fr]">
        {/* Left panel — instructions */}
        <section className="min-h-0 overflow-y-auto border-b border-zinc-200 bg-white p-5 lg:border-b-0 lg:border-r dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
            Instructions
          </h2>
          <span className="mt-3 inline-block rounded-md border border-zinc-300 px-2 py-0.5 text-xs uppercase tracking-wide text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
            {challenge.category}
          </span>
          <h3 className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {challenge.title}
          </h3>
          <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            {challenge.description}
          </p>
          <h4 className="mt-6 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Requirements
          </h4>
          <ul className="mt-2 space-y-1.5">
            {challenge.requirements.map((req) => (
              <li
                key={req}
                className="flex gap-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400"
              >
                <span aria-hidden className="text-zinc-400 dark:text-zinc-600">
                  •
                </span>
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Centre panel — code editor */}
        <section className="flex min-h-0 flex-col border-b border-zinc-200 bg-zinc-100 lg:border-b-0 lg:border-r dark:border-zinc-800 dark:bg-zinc-950">
          <Tabs value="index.js" className="min-h-0 flex-1 gap-0">
            <TabsList
              variant="line"
              className="h-auto shrink-0 justify-start rounded-none border-b border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <TabsTrigger
                value="index.js"
                className="rounded-t-md rounded-b-none px-3 py-1 font-mono text-xs font-medium text-zinc-700 data-active:bg-transparent dark:text-zinc-200"
              >
                index.js
              </TabsTrigger>
            </TabsList>
            <TabsContent value="index.js" className="min-h-0 flex-1">
              <CodeEditor value={code} onChange={setCode} />
            </TabsContent>
          </Tabs>
          <div className="flex shrink-0 items-center justify-between border-t border-zinc-200 bg-white px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900">
            <Button
              size="sm"
              onClick={handleReset}
              className="border border-zinc-300 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Reset Code
            </Button>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleSolutionClick}
                aria-disabled={solutionLocked}
                className={
                  solutionLocked
                    ? "border border-zinc-300 bg-zinc-200 text-zinc-400 cursor-not-allowed dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-500"
                    : solutionOpen
                      ? "bg-zinc-300 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100"
                      : "border border-zinc-300 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                }
              >
                {solutionLocked
                  ? `Solution — ${formatCountdown(solutionSecondsLeft)}`
                  : solutionOpen
                    ? "Solution Open"
                    : "Solution"}
              </Button>
              <Button
                size="sm"
                onClick={() => void handleRunTest()}
                disabled={status === "running"}
                className="bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
              >
                Run Test
              </Button>
            </div>
          </div>
        </section>
      </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right sidebar — browser / console (resizable) */}
        <ResizablePanel
          defaultSize={360}
          minSize={280}
          maxSize={560}
          className="min-h-0"
        >
        <section className="flex h-full min-h-0 flex-col bg-white dark:bg-zinc-900">
          <Tabs
            value={rightTab}
            onValueChange={(value) => setRightTab(value as "browser" | "console")}
            className="min-h-0 flex-1 gap-0"
          >
            <TabsList
              variant="line"
              className="h-auto shrink-0 justify-start rounded-none border-b border-zinc-200 bg-white px-2 py-1 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <TabsTrigger
                value="browser"
                className="border-b-2 border-transparent px-3 py-2 text-sm text-zinc-500 data-active:border-zinc-900 data-active:text-zinc-900 dark:data-active:border-zinc-300 dark:data-active:text-zinc-100"
              >
                Browser
              </TabsTrigger>
              <TabsTrigger
                value="console"
                className="border-b-2 border-transparent px-3 py-2 text-sm text-zinc-500 data-active:border-zinc-900 data-active:text-zinc-900 dark:data-active:border-zinc-300 dark:data-active:text-zinc-100"
              >
                Console
              </TabsTrigger>
            </TabsList>

            <TabsContent value="browser" className="min-h-0 flex-1 overflow-y-auto p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
                {challenge.category} Challenge
              </p>
              <p className="mt-4 text-xs font-medium uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
                Input
              </p>
              <pre className="mt-1 whitespace-pre-wrap rounded-md border border-zinc-200 bg-zinc-100 p-3 font-mono text-sm text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
                {challenge.browserInput}
              </pre>
              <p className="mt-4 text-xs font-medium uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
                Expected result
              </p>
              <pre className="mt-1 whitespace-pre-wrap rounded-md border border-zinc-200 bg-zinc-100 p-3 font-mono text-sm text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
                {challenge.browserExpected}
              </pre>
            </TabsContent>

            <TabsContent
              value="console"
              className="min-h-0 flex-1 overflow-y-auto bg-zinc-950 p-5 dark:bg-black"
            >
              <ConsolePanel
                status={status}
                outcomes={outcomes}
                runtimeError={runtimeError}
                failedCount={failedCount}
                firstFailure={firstFailure}
              />
            </TabsContent>
          </Tabs>
        </section>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Bottom navigation */}
      <footer className="flex shrink-0 items-center justify-between border-t border-zinc-200 bg-white px-6 py-3 dark:border-zinc-800 dark:bg-zinc-950">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
          className="text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        >
          ← Previous
        </Button>
        {isLastChallenge && allCompleted ? (
          <Button
            size="sm"
            onClick={handleCompleteCourse}
            className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
          >
            Complete Course →
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => goTo(index + 1)}
            disabled={isLastChallenge}
            className="text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            Next Challenge →
          </Button>
        )}
      </footer>

      {solution && (
        <SolutionDialog
          open={solutionOpen}
          onOpenChange={setSolutionOpen}
          challengeTitle={challenge.title}
          code={solution.code}
          explanation={solution.explanation}
        />
      )}
      </SidebarInset>
    </SidebarProvider>

    {suspended ? (
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="anti-cheat-suspended-title"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      >
        <div className="w-full max-w-sm rounded-xl border border-red-200 bg-white p-6 text-center shadow-xl dark:border-red-900 dark:bg-zinc-900">
          <ShieldAlert
            className="mx-auto size-10 text-red-500 dark:text-red-400"
            aria-hidden
          />
          <h2
            id="anti-cheat-suspended-title"
            className="mt-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100"
          >
            Assessment Suspended
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Thank you — your assessment has been ended and your account has
            been suspended after {SUSPEND_AFTER_VIOLATIONS} recorded security
            warnings.
          </p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
            Please contact your assessment administrator if you believe this
            was a mistake.
          </p>
        </div>
      </div>
    ) : (
      warning && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="anti-cheat-warning-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 text-center shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <ShieldAlert
              className="mx-auto size-10 text-amber-500 dark:text-amber-400"
              aria-hidden
            />
            <h2
              id="anti-cheat-warning-title"
              className="mt-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100"
            >
              Security Warning
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              {warning.message}
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
              Warning {warning.count} of {SUSPEND_AFTER_VIOLATIONS} recorded
              for this assessment.
            </p>
            <Button
              size="sm"
              onClick={acknowledge}
              className="mt-5 w-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
            >
              I Understand — Continue Assessment
            </Button>
          </div>
        </div>
      )
    )}
    </>
  );
}

function ConsolePanel({
  status,
  outcomes,
  runtimeError,
  failedCount,
  firstFailure,
}: {
  status: Status;
  outcomes: TestOutcome[] | null;
  runtimeError: string | null;
  failedCount: number;
  firstFailure: TestOutcome | null;
}) {
  if (status === "ready") {
    return (
      <p className="font-mono text-sm text-zinc-400">
        Ready to test your solution.
      </p>
    );
  }

  if (status === "running") {
    return (
      <p className="font-mono text-sm text-zinc-400">
        &gt; Running tests...
      </p>
    );
  }

  return (
    <div className="font-mono text-sm text-zinc-300">
      <p className="text-zinc-400">&gt; Running tests...</p>

      {runtimeError && (
        <p className="mt-3 text-red-400">{runtimeError}</p>
      )}

      <div className="mt-3 space-y-1">
        {outcomes?.map((outcome, i) => (
          <p
            key={i}
            className={outcome.pass ? "text-emerald-400" : "text-red-400"}
          >
            {outcome.pass ? "✓" : "✕"} {outcome.label}{" "}
            {outcome.pass ? "passed" : "failed"}
          </p>
        ))}
      </div>

      {status === "passed" ? (
        <p className="mt-4 font-semibold text-emerald-400">
          ✓ All tests passed
        </p>
      ) : (
        <div className="mt-4">
          <p className="font-semibold text-red-400">
            ✕ {failedCount} of {outcomes?.length ?? 0} tests failed
          </p>
          {firstFailure && (
            <div className="mt-3 space-y-2">
              <div>
                <p className="text-zinc-500">Expected:</p>
                <pre className="mt-1 whitespace-pre-wrap text-zinc-200">
                  {formatValue(firstFailure.expected)}
                </pre>
              </div>
              <div>
                <p className="text-zinc-500">Received:</p>
                <pre className="mt-1 whitespace-pre-wrap text-zinc-200">
                  {formatValue(firstFailure.received)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

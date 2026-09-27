"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckIcon,
  Clock,
  CopyIcon,
  FileCode,
  FileText,
  Loader2,
  Moon,
  Play,
  RotateCcw,
  ShieldAlert,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CodeEditor } from "@/components/assessment/code-editor";
import { SolutionDialog } from "@/components/assessment/solution-dialog";
import { SubmitAssessmentDialog } from "@/components/assessment/submit-assessment-dialog";
import { AppSidebar } from "@/components/assessment/app-sidebar";
import { LogoutButton } from "@/components/layout/logout-button";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useChallengeProgress } from "@/components/assessment/challenge-progress-provider";
import { useAntiCheat } from "@/hooks/use-anti-cheat";
import { cn } from "@/lib/utils";
import {
  challenges,
  formatValue,
  getChallengeBySlug,
  runChallengeTests,
  type TestOutcome,
} from "@/lib/assessment/challenges";
import { solutionsById } from "@/lib/assessment/solutions";
import {
  createSolutionTimer,
  formatCountdown,
  formatDurationWords,
  solutionSecondsRemaining,
  type ChallengeStatus as Status,
  type ChallengeResult,
} from "@/lib/assessment/progress";
import {
  DEFAULT_LANGUAGE_ID,
  LANGUAGE_OPTIONS,
  getFileNameForLanguage,
  getLanguageOption,
} from "@/lib/assessment/languages";

type Mode = "candidate" | "review";
type ActiveFile = "solution" | "test-input";

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
  const [activeFile, setActiveFile] = useState<ActiveFile>("solution");
  const [mode, setMode] = useState<Mode>("review");
  const [solutionOpen, setSolutionOpen] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [isSubmittingAssessment, setIsSubmittingAssessment] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") return true;
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return true;
  });

  const {
    progress,
    setProgress,
    flushSave,
    saveStatus,
    retrySave,
    secondsLeft,
    timeUpDismissed,
    dismissTimeUp,
    recordingStatus,
    recordEvent,
    recordCodeChange,
    recordCodeChangeNow,
    finalizeRecording,
  } = useChallengeProgress();
  const [isNavigating, setIsNavigating] = useState(false);
  const [navError, setNavError] = useState<string | null>(null);
  const { violationCount, warning, acknowledge, blockCopyOrCut, blockContextMenu } =
    useAntiCheat();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const challenge = getChallengeBySlug(slug);

  useEffect(() => {
    if (!challenge) router.replace("/challenges");
  }, [challenge, router]);

  useEffect(() => {
    if (progress.assessmentStarted) return;
    setProgress((prev) =>
      prev
        ? {
            ...prev,
            assessmentStarted: true,
            assessmentStartedAt: new Date().toISOString(),
          }
        : prev
    );
  }, [progress, setProgress]);

  // Solution unlock countdown — starts the moment a challenge is first
  // opened and is stored server-side so a refresh can't reset it.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!challenge) return;
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
  }, [challenge, setProgress]);

  const index = challenge ? challenges.indexOf(challenge) : 0;
  const solution = challenge ? solutionsById[challenge.id] : undefined;

  // Prefetch the next (and previous) task's route so "Next Challenge" feels
  // close to instant by the time it's clicked — purely an optimization,
  // doesn't affect task order, scoring, or navigation behavior.
  useEffect(() => {
    const nextSlug = challenges[index + 1]?.slug;
    const prevSlug = challenges[index - 1]?.slug;
    if (nextSlug) router.prefetch(`/challenges/${nextSlug}`);
    if (prevSlug) router.prefetch(`/challenges/${prevSlug}`);
  }, [index, router]);

  const code = challenge
    ? progress?.code[challenge.id] ?? challenge.starterCode
    : "";
  const language = challenge
    ? progress?.language[challenge.id] ?? DEFAULT_LANGUAGE_ID
    : DEFAULT_LANGUAGE_ID;
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
  const completedCount = challenges.filter((c) => progress?.completed[c.id]).length;
  const fileName = getFileNameForLanguage(language);
  const languageLabel = getLanguageOption(language)?.label ?? "JavaScript";

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
    recordCodeChange({ fileName, language, code: value });
  }

  function setLanguage(value: string | null) {
    if (!challenge || !value) return;
    setProgress((prev) =>
      prev
        ? { ...prev, language: { ...prev.language, [challenge.id]: value } }
        : prev
    );
    recordEvent("language_change", { fileName: getFileNameForLanguage(value), language: value });
  }

  function changeActiveFile(next: ActiveFile) {
    setActiveFile(next);
    recordEvent("file_change", {
      fileName: next === "solution" ? fileName : "test-input.txt",
      language,
    });
  }

  function setResult(challengeId: number, next: ChallengeResult) {
    setProgress((prev) =>
      prev
        ? { ...prev, results: { ...prev.results, [challengeId]: next } }
        : prev
    );
  }

  async function goTo(nextIndex: number) {
    const target = challenges[nextIndex];
    // The isNavigating guard also protects against duplicate requests from
    // rapid double-clicks or clicking a sidebar item mid-transition.
    if (!target || isNavigating) return;

    setIsNavigating(true);
    setNavError(null);
    try {
      // Persist the current task's code before leaving it — bypasses the
      // debounce so an edit made just before clicking "Next" isn't lost.
      await flushSave();
      setActiveFile("solution");
      setSolutionOpen(false);
      router.push(`/challenges/${target.slug}`);
      // No `setIsNavigating(false)` on success: this component unmounts as
      // the new challenge page takes over, which resets the state for us.
    } catch {
      setIsNavigating(false);
      setNavError("Couldn't save your progress. Please try again.");
      toast.add({
        title: "Couldn't move to the next task",
        description: "Your code wasn't saved yet — nothing was lost. Please try again.",
        type: "error",
      });
    }
  }

  function handleReset() {
    if (!challenge) return;
    setCode(challenge.starterCode);
    setResult(challenge.id, EMPTY_RESULT);
  }

  async function handleRunTest() {
    if (!challenge) return;
    // Snapshot the code exactly as it is at the moment of this run/test,
    // bypassing the debounce, so replay shows the code that was actually
    // executed rather than whatever the debounce hadn't flushed yet.
    recordCodeChangeNow({ fileName, language, code });
    recordEvent("run_code", { fileName, language, code });
    setResult(challenge.id, { status: "running", outcomes: null, runtimeError: null });
    await new Promise((resolve) => setTimeout(resolve, 450));
    const testResult = runChallengeTests(challenge, code);
    const fails = testResult.outcomes.filter((o) => !o.pass).length;
    const nextStatus: Status = fails === 0 ? "passed" : "failed";
    recordEvent("test_run", {
      fileName,
      language,
      result: {
        passed: testResult.outcomes.length - fails,
        total: testResult.outcomes.length,
        status: nextStatus,
        runtimeError: testResult.error,
      },
    });
    if (nextStatus === "passed" && !progress.completed[challenge.id]) {
      recordEvent("submission", {
        fileName,
        language,
        code,
        result: { taskId: challenge.id, taskTitle: challenge.title, status: nextStatus },
      });
    }
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

  async function submitAssessment() {
    if (!allCompleted || isSubmittingAssessment) return;
    setIsSubmittingAssessment(true);
    setSubmitError(null);
    try {
      // Persist final answers/results before marking the assessment done —
      // this is the same durable-save call `goTo` uses before navigating,
      // so a failure here leaves the candidate's work untouched and unsubmitted.
      await flushSave();
      // Best-effort: flush remaining recorded events and mark the
      // recording completed. Never blocks or fails the actual assessment
      // submission — the candidate's answers matter more than the replay.
      await finalizeRecording().catch(() => {});
      setProgress((prev) => {
        if (!prev) return prev;
        if (prev.courseCompleted) return prev;
        return {
          ...prev,
          courseCompleted: true,
          completionDate: new Date().toISOString(),
        };
      });
      setSubmitDialogOpen(false);
      router.push("/coding-assessment");
    } catch {
      setSubmitError(
        "Couldn't submit your assessment. Your answers are safe — please try again."
      );
      toast.add({
        title: "Submission failed",
        description: "Your answers weren't lost. Please try again.",
        type: "error",
      });
    } finally {
      setIsSubmittingAssessment(false);
    }
  }

  if (!challenge) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50 text-sm text-zinc-500 dark:bg-zinc-950 dark:text-zinc-500">
        Loading…
      </div>
    );
  }

  // Shared across the desktop (resizable panes) and mobile/tablet (tabbed)
  // layouts below — rendered twice (once per layout, only one visible at a
  // time via CSS) rather than gated behind a JS media query, so there's no
  // hydration mismatch and no duplicated state to keep in sync.
  //
  // While a "Next"/"Previous" navigation is in flight, each of these swaps
  // to a lightweight loading panel instead of the (soon to be stale) task
  // content — the sidebar, header, timer, and overall page chrome around
  // them are untouched, so nothing else shifts or flickers.
  const instructionsContent = isNavigating ? (
    <TaskLoadingPanel />
  ) : (
    <>
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
        Task {index + 1}
      </p>
      <span className="mt-2 inline-block rounded-md border border-zinc-300 px-2 py-0.5 text-xs uppercase tracking-wide text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
        {challenge.category}
      </span>
      <h3 className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        {challenge.title}
      </h3>

      <h4 className="mt-5 text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
        Description
      </h4>
      <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        {challenge.description}
      </p>

      <h4 className="mt-5 text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
        Examples
      </h4>
      <div className="mt-2 space-y-2">
        <CopyableExample label="Input" value={challenge.browserInput} />
        <CopyableExample label="Expected output" value={challenge.browserExpected} />
      </div>

      <h4 className="mt-5 text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
        Constraints &amp; Requirements
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
    </>
  );

  const filesPanel = isNavigating ? null : (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto bg-zinc-50 dark:bg-zinc-900/40">
      <p className="px-3 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
        Files
      </p>
      <p className="px-3 pt-1 pb-1 font-mono text-xs text-zinc-500 dark:text-zinc-500">
        {challenge.slug}/
      </p>
      <nav aria-label="Task files" className="flex flex-col gap-0.5 px-2 pb-3">
        <button
          type="button"
          onClick={() => changeActiveFile("solution")}
          aria-current={activeFile === "solution" ? "true" : undefined}
          className={cn(
            "flex items-center gap-2 rounded-md px-2 py-1.5 text-left font-mono text-xs",
            activeFile === "solution"
              ? "bg-zinc-200 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
              : "text-zinc-600 hover:bg-zinc-200/60 dark:text-zinc-400 dark:hover:bg-zinc-800/60"
          )}
        >
          <FileCode className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">{fileName}</span>
        </button>
        <button
          type="button"
          onClick={() => changeActiveFile("test-input")}
          aria-current={activeFile === "test-input" ? "true" : undefined}
          className={cn(
            "flex items-center gap-2 rounded-md px-2 py-1.5 text-left font-mono text-xs",
            activeFile === "test-input"
              ? "bg-zinc-200 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
              : "text-zinc-600 hover:bg-zinc-200/60 dark:text-zinc-400 dark:hover:bg-zinc-800/60"
          )}
        >
          <FileText className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">test-input.txt</span>
        </button>
      </nav>
    </div>
  );

  const editorSection = isNavigating ? (
    <TaskLoadingPanel />
  ) : (
    <>
      <Tabs
        value={activeFile}
        onValueChange={(value) => changeActiveFile(value as ActiveFile)}
        className="min-h-0 flex-1 gap-0"
      >
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-zinc-300 bg-white pr-3 dark:border-zinc-700 dark:bg-zinc-900">
          <TabsList
            variant="line"
            className="h-auto shrink-0 justify-start rounded-none border-b-0 bg-transparent px-3 py-2"
          >
            <TabsTrigger
              value="solution"
              className="rounded-t-md rounded-b-none px-3 py-1 font-mono text-xs font-medium text-zinc-700 data-active:bg-transparent dark:text-zinc-200"
            >
              {fileName}
            </TabsTrigger>
            <TabsTrigger
              value="test-input"
              className="rounded-t-md rounded-b-none px-3 py-1 font-mono text-xs font-medium text-zinc-700 data-active:bg-transparent dark:text-zinc-200"
            >
              test-input.txt
            </TabsTrigger>
          </TabsList>
          <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <span className="whitespace-nowrap">Language:</span>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger aria-label="Programming language" size="sm">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.id}
                    value={option.id}
                    disabled={!option.executable}
                    label={option.label}
                  >
                    {option.label}
                    {!option.executable && (
                      <span className="ml-1 text-xs text-zinc-400 dark:text-zinc-600">
                        (not available)
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        </div>
        <TabsContent value="solution" className="min-h-0 flex-1">
          <CodeEditor value={code} onChange={setCode} />
        </TabsContent>
        <TabsContent
          value="test-input"
          className="min-h-0 flex-1 overflow-y-auto bg-white p-5 dark:bg-zinc-900"
        >
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
      </Tabs>
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
        <Button
          size="sm"
          onClick={handleReset}
          className="gap-1.5 border border-zinc-300 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          <RotateCcw className="size-3.5" aria-hidden />
          Reset Code
        </Button>
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
      </div>
    </>
  );

  const testOutputSection = isNavigating ? (
    <TaskLoadingPanel />
  ) : (
    <div className="flex h-full min-h-0 flex-col bg-white dark:bg-zinc-900">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
          Test Output
        </h2>
        <Button
          size="sm"
          onClick={() => void handleRunTest()}
          disabled={status === "running"}
          aria-label={status === "running" ? "Running code" : "Run code"}
          className="gap-1.5 bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
        >
          {status === "running" ? (
            <>
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
              Running…
            </>
          ) : (
            <>
              <Play className="size-3.5" aria-hidden />
              Run Code
            </>
          )}
        </Button>
      </div>
      <div
        role="status"
        aria-live="polite"
        className="min-h-0 flex-1 overflow-y-auto bg-zinc-950 p-4 dark:bg-black"
      >
        <ConsolePanel
          status={status}
          outcomes={outcomes}
          runtimeError={runtimeError}
          failedCount={failedCount}
          firstFailure={firstFailure}
        />
      </div>
    </div>
  );

  return (
    <>
    <SidebarProvider
      className={cn(
        "h-screen min-h-0 select-none bg-zinc-50 text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-zinc-100",
        warning && "pointer-events-none blur-sm"
      )}
      onCopy={blockCopyOrCut}
      onCut={blockCopyOrCut}
      onContextMenu={blockContextMenu}
    >
      <AppSidebar
        challenges={challenges}
        activeIndex={index}
        completed={progress.completed}
        onSelect={(i) => void goTo(i)}
        courseCompleted={progress.courseCompleted}
        onViewProgress={() => router.push("/coding-assessment")}
      />
      <SidebarInset className="h-screen min-h-0">
      {/* Top navigation */}
      <header
        className="flex shrink-0 flex-col gap-2 border-b border-zinc-200 bg-white px-3 py-2.5 sm:px-6 sm:py-3 dark:border-zinc-800 dark:bg-zinc-950"
        style={{
          paddingLeft: "max(0.75rem, env(safe-area-inset-left))",
          paddingRight: "max(0.75rem, env(safe-area-inset-right))",
        }}
      >
        {/* Brand (left) + Logout (far right) share their own row so Logout
            always stays in the top-right corner on every breakpoint,
            regardless of how much the secondary info below wraps — the row
            below can be crowded (timer, mode switch, progress, challenge
            count) without ever pushing Logout down to a second line. */}
        <div className="flex w-full items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <SidebarTrigger className="shrink-0 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800" />
            <div className="min-w-0">
              <Link
                href="/"
                aria-label="Software Engineer Programme home"
                className="block truncate text-sm font-semibold leading-tight text-zinc-900 hover:underline dark:text-zinc-100"
              >
                Software Engineer Programme
              </Link>
              <p className="hidden truncate text-xs text-zinc-600 sm:block dark:text-zinc-400">
                Coding Assessment
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              size="sm"
              onClick={() => setSubmitDialogOpen(true)}
              className="bg-emerald-600 text-white hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400"
            >
              Submit Assessment
            </Button>
            <LogoutButton redirectTo="/" />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <span className="rounded-md border border-zinc-300 bg-zinc-100 px-2 py-1 font-mono text-xs tabular-nums text-zinc-900 sm:px-2.5 sm:text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
              {formatTime(secondsLeft)}
            </span>
            {recordingStatus !== "idle" && (
              <span
                className="flex items-center gap-1.5 rounded-md border border-zinc-300 bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700 sm:px-2.5 sm:text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                title="Your coding activity — code, language, and Run/Test actions — is recorded for assessment review. Not your screen, camera, or microphone."
              >
                <span
                  aria-hidden
                  className="size-2 shrink-0 animate-pulse rounded-full bg-red-500 motion-reduce:animate-none"
                />
                Recording activity for review
              </span>
            )}
            {violationCount > 0 && (
              <span
                className="flex items-center gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 sm:px-2.5 sm:text-sm dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400"
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
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 sm:h-8 sm:w-8 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {darkMode ? (
                <Moon className="size-4" />
              ) : (
                <Sun className="size-4" />
              )}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <Switch
                size="sm"
                checked={mode === "review"}
                onCheckedChange={(checked) => {
                  setMode(checked ? "review" : "candidate");
                  if (!checked) setSolutionOpen(false);
                }}
              />
              <span className="whitespace-nowrap">
                {mode === "review" ? "Review Mode" : "Candidate Mode"}
              </span>
            </label>
            <button
              type="button"
              onClick={() => router.push("/coding-assessment")}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-md border border-zinc-300 bg-zinc-100 px-2.5 py-1.5 text-sm text-zinc-700 hover:bg-zinc-200 sm:py-1 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              {progress.courseCompleted && <span aria-hidden>🏆</span>}
              Progress
            </button>
            <span className="whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
              Challenge {index + 1} of {challenges.length}
            </span>
          </div>
        </div>
      </header>

      {/* Main workspace */}
      {/* Desktop / large desktop (lg+): resizable side-by-side panes.
          The visibility toggle lives on this wrapper div, not on
          ResizablePanelGroup itself — react-resizable-panels sets its own
          inline `display: flex` on that element, which always wins over a
          `hidden` class regardless of Tailwind specificity. */}
      <div className="hidden min-h-0 flex-1 lg:flex">
        <ResizablePanelGroup className="min-h-0 flex-1">
          {/* Task Description panel */}
          <ResizablePanel defaultSize={320} minSize={240} maxSize={520} className="min-h-0">
            <section className="h-full min-h-0 overflow-y-auto border-r border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              {instructionsContent}
            </section>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Solution workspace: Files + Code Editor on top, Test Output below */}
          <ResizablePanel minSize={560} className="min-h-0">
            <ResizablePanelGroup orientation="vertical" className="h-full min-h-0">
              <ResizablePanel minSize={220} className="min-h-0">
                <div className="flex h-full min-h-0 flex-col bg-zinc-100 dark:bg-zinc-950">
                  <div className="flex shrink-0 items-center border-b border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
                      Solution
                    </h2>
                  </div>
                  <div className="grid min-h-0 flex-1 grid-cols-[180px_1fr]">
                    <section
                      aria-label="File explorer"
                      className="min-h-0 border-r border-zinc-200 dark:border-zinc-800"
                    >
                      {filesPanel}
                    </section>
                    <section className="flex min-h-0 flex-col bg-white dark:bg-zinc-900">
                      {editorSection}
                    </section>
                  </div>
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle />

              <ResizablePanel
                defaultSize={220}
                minSize={44}
                maxSize={480}
                collapsible
                collapsedSize={40}
                className="min-h-0"
              >
                {testOutputSection}
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Mobile / tablet (< lg): switchable Task / Code / Tests sections —
          only one panel is visible at a time, and the editor tab gets the
          full remaining height instead of squeezing the desktop workspace
          into a narrow viewport. */}
      <Tabs
        defaultValue="code"
        className="flex min-h-0 flex-1 flex-col gap-0 lg:hidden"
      >
        <TabsList
          variant="line"
          className="h-auto shrink-0 justify-start gap-1 overflow-x-auto rounded-none border-b border-zinc-200 bg-white px-2 py-1 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <TabsTrigger
            value="task"
            className="min-h-9 border-b-2 border-transparent px-3 py-2 text-sm text-zinc-500 data-active:border-zinc-900 data-active:text-zinc-900 dark:data-active:border-zinc-300 dark:data-active:text-zinc-100"
          >
            Task
          </TabsTrigger>
          <TabsTrigger
            value="code"
            className="min-h-9 border-b-2 border-transparent px-3 py-2 text-sm text-zinc-500 data-active:border-zinc-900 data-active:text-zinc-900 dark:data-active:border-zinc-300 dark:data-active:text-zinc-100"
          >
            Code
          </TabsTrigger>
          <TabsTrigger
            value="tests"
            className="min-h-9 border-b-2 border-transparent px-3 py-2 text-sm text-zinc-500 data-active:border-zinc-900 data-active:text-zinc-900 dark:data-active:border-zinc-300 dark:data-active:text-zinc-100"
          >
            Tests
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="task"
          className="min-h-0 flex-1 overflow-y-auto bg-white p-5 dark:bg-zinc-900"
        >
          {instructionsContent}
        </TabsContent>

        <TabsContent
          value="code"
          className="grid min-h-0 flex-1 grid-cols-[140px_1fr] bg-zinc-100 dark:bg-zinc-950"
        >
          <section aria-label="File explorer" className="min-h-0 border-r border-zinc-200 dark:border-zinc-800">
            {filesPanel}
          </section>
          <section className="flex min-h-0 flex-col bg-white dark:bg-zinc-900">
            {editorSection}
          </section>
        </TabsContent>

        <TabsContent
          value="tests"
          className="flex min-h-0 flex-1 flex-col bg-white dark:bg-zinc-900"
        >
          {testOutputSection}
        </TabsContent>
      </Tabs>

      {/* Bottom navigation */}
      <footer
        className="flex shrink-0 flex-col gap-2 border-t border-zinc-200 bg-white px-3 py-3 sm:px-6 dark:border-zinc-800 dark:bg-zinc-950"
        style={{
          paddingLeft: "max(0.75rem, env(safe-area-inset-left))",
          paddingRight: "max(0.75rem, env(safe-area-inset-right))",
          paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
        }}
      >
        {navError && (
          <p role="alert" className="text-center text-xs text-red-600 dark:text-red-400">
            {navError} Your code is safe — just try again.
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void goTo(index - 1)}
            disabled={index === 0 || isNavigating}
            className="text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            ← Previous
          </Button>
          {isLastChallenge && allCompleted ? (
            <Button
              size="sm"
              onClick={() => setSubmitDialogOpen(true)}
              disabled={isNavigating}
              className="bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
            >
              Submit Assessment →
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void goTo(index + 1)}
              disabled={isLastChallenge || isNavigating}
              className="text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              {isNavigating ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="size-3.5 animate-spin" aria-hidden />
                  Loading…
                </span>
              ) : (
                "Next Challenge →"
              )}
            </Button>
          )}
        </div>
      </footer>

      {/* IDE-style status bar */}
      <div
        className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-zinc-200 bg-zinc-100 px-3 py-1 text-xs text-zinc-600 sm:px-6 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400"
        style={{
          paddingLeft: "max(0.75rem, env(safe-area-inset-left))",
          paddingRight: "max(0.75rem, env(safe-area-inset-right))",
        }}
      >
        <div className="flex items-center gap-3" role="status" aria-live="polite">
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="size-1.5 rounded-full bg-emerald-500" />
            Connected
          </span>
          <span aria-hidden className="text-zinc-300 dark:text-zinc-700">
            |
          </span>
          {saveStatus === "saving" && <span>Saving…</span>}
          {saveStatus === "saved" && <span>All changes saved</span>}
          {saveStatus === "error" && (
            <button
              type="button"
              onClick={() => void retrySave()}
              className="font-medium text-red-600 underline underline-offset-2 dark:text-red-400"
            >
              Save failed — Retry
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span>{languageLabel}</span>
          <span aria-hidden className="text-zinc-300 dark:text-zinc-700">
            |
          </span>
          <span>UTF-8</span>
        </div>
      </div>

      {solution && (
        <SolutionDialog
          open={solutionOpen}
          onOpenChange={setSolutionOpen}
          challengeTitle={challenge.title}
          code={solution.code}
          explanation={solution.explanation}
        />
      )}

      <SubmitAssessmentDialog
        open={submitDialogOpen}
        onOpenChange={setSubmitDialogOpen}
        submitting={isSubmittingAssessment}
        error={submitError}
        onConfirm={() => void submitAssessment()}
        canSubmit={allCompleted}
        blockedMessage={`${completedCount} of ${challenges.length} tasks completed. Complete every task before you can submit your final assessment.`}
      />
      </SidebarInset>
    </SidebarProvider>

    {warning && (
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
            Warning {warning.count} recorded for this assessment.
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
    )}

    {secondsLeft <= 0 && !timeUpDismissed && (
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="time-up-title"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      >
        <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 text-center shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
          <Clock
            className="mx-auto size-10 text-zinc-500 dark:text-zinc-400"
            aria-hidden
          />
          <h2
            id="time-up-title"
            className="mt-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100"
          >
            Time&apos;s up
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Your session timer has run out. You can keep practicing here, or
            head over to your progress.
          </p>
          <div className="mt-5 flex flex-col gap-2">
            <Button
              size="sm"
              onClick={() => router.push("/coding-assessment")}
              className="w-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
            >
              View Progress
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={dismissTimeUp}
              className="w-full border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              Keep Practicing
            </Button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

/**
 * Shown in place of the instructions/editor/tests panels while a Next/
 * Previous navigation is saving and in flight — keeps the surrounding
 * sidebar, header, timer, and tab chrome fully in place so nothing else on
 * the page jumps or flickers.
 */
function TaskLoadingPanel() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex h-full min-h-40 flex-1 flex-col items-center justify-center gap-3 p-8 text-center"
    >
      <Loader2 className="size-6 animate-spin text-zinc-400 dark:text-zinc-600" aria-hidden />
      <p className="text-sm text-zinc-500 dark:text-zinc-500">
        Loading next task…
      </p>
    </div>
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
        No tests have been run yet.
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
        <div className="mt-3 rounded-md border border-red-900/60 bg-red-950/40 p-3">
          <p className="text-xs font-semibold text-red-400">
            Compiler output:
          </p>
          <p className="mt-1.5 whitespace-pre-wrap text-red-300">
            {runtimeError}
          </p>
        </div>
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

function CopyableExample({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="rounded-md border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between px-3 pt-2">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
          {label}
        </p>
        <button
          type="button"
          onClick={() => void handleCopy()}
          aria-label={`Copy ${label.toLowerCase()}`}
          className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
        >
          {copied ? (
            <CheckIcon className="size-3.5" aria-hidden />
          ) : (
            <CopyIcon className="size-3.5" aria-hidden />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="whitespace-pre-wrap p-3 font-mono text-sm text-zinc-800 dark:text-zinc-200">
        {value}
      </pre>
    </div>
  );
}

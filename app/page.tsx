"use client";

import { useEffect, useMemo, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { CodeEditor } from "@/components/code-editor";
import { SolutionDialog } from "@/components/solution-dialog";
import {
  challenges,
  formatValue,
  runChallengeTests,
  type TestOutcome,
} from "@/lib/challenges";
import { solutionsById } from "@/lib/solutions";

type Mode = "candidate" | "review";

const TOTAL_SECONDS = 30 * 60;

type Status = "ready" | "running" | "passed" | "failed";

function formatTime(totalSeconds: number) {
  const clamped = Math.max(0, totalSeconds);
  const h = Math.floor(clamped / 3600);
  const m = Math.floor((clamped % 3600) / 60);
  const s = clamped % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export default function Home() {
  const [index, setIndex] = useState(0);
  const [codeById, setCodeById] = useState<Record<number, string>>(() =>
    Object.fromEntries(challenges.map((c) => [c.id, c.starterCode]))
  );
  const [status, setStatus] = useState<Status>("ready");
  const [outcomes, setOutcomes] = useState<TestOutcome[] | null>(null);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
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

  const challenge = challenges[index];
  const code = codeById[challenge.id];
  const solution = solutionsById[challenge.id];

  const failedCount = useMemo(
    () => outcomes?.filter((o) => !o.pass).length ?? 0,
    [outcomes]
  );
  const firstFailure = useMemo(
    () => outcomes?.find((o) => !o.pass) ?? null,
    [outcomes]
  );

  function setCode(value: string) {
    setCodeById((prev) => ({ ...prev, [challenge.id]: value }));
  }

  function goTo(nextIndex: number) {
    setIndex(nextIndex);
    setStatus("ready");
    setOutcomes(null);
    setRuntimeError(null);
    setRightTab("browser");
    setSolutionOpen(false);
  }

  function handleReset() {
    setCode(challenge.starterCode);
    setStatus("ready");
    setOutcomes(null);
    setRuntimeError(null);
  }

  async function handleRunTest() {
    setStatus("running");
    setRightTab("console");
    setOutcomes(null);
    setRuntimeError(null);
    await new Promise((resolve) => setTimeout(resolve, 450));
    const result = runChallengeTests(challenge, code);
    setOutcomes(result.outcomes);
    setRuntimeError(result.error);
    const fails = result.outcomes.filter((o) => !o.pass).length;
    setStatus(fails === 0 ? "passed" : "failed");
  }

  return (
    <div className="flex h-screen min-h-0 flex-col bg-zinc-50 text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-zinc-100">
      {/* Top navigation */}
      <header className="flex shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6 py-3 dark:border-zinc-800 dark:bg-zinc-950">
        <div>
          <p className="text-sm font-semibold leading-tight text-zinc-900 dark:text-zinc-100">
            Software Engineer Programme
          </p>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Coding Assessment
          </p>
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
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            Challenge {index + 1} of {challenges.length}
          </span>
          <span className="rounded-md border border-zinc-300 bg-zinc-100 px-2.5 py-1 font-mono text-sm tabular-nums text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
            {formatTime(secondsLeft)}
          </span>
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
      <main className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[280px_1fr_360px]">
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
              {mode === "review" && (
                <Button
                  size="sm"
                  onClick={() => setSolutionOpen(true)}
                  className="border border-zinc-300 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  Solution
                </Button>
              )}
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

        {/* Right panel */}
        <section className="flex min-h-0 flex-col bg-white dark:bg-zinc-900">
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
      </main>

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
        <Button
          variant="ghost"
          size="sm"
          onClick={() => goTo(index + 1)}
          disabled={index === challenges.length - 1}
          className="text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        >
          Next Challenge →
        </Button>
      </footer>

      {mode === "review" && (
        <SolutionDialog
          open={solutionOpen}
          onOpenChange={setSolutionOpen}
          challengeTitle={challenge.title}
          code={solution.code}
          explanation={solution.explanation}
        />
      )}
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

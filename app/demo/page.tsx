"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/code-editor";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageContainer } from "@/components/page-container";
import { challenges, formatValue, runChallengeTests, type TestOutcome } from "@/lib/challenges";

// The demo runs entirely client-side against the static challenge data and
// the pure `runChallengeTests` function — no `/api/progress` calls, no
// session cookie, no anti-cheat, and nothing written anywhere. Visitors can
// try the coding experience without an account and without touching the
// real authenticated assessment flow.
const demoChallenge = challenges[0];

type RunState = "idle" | "passed" | "failed";

export default function DemoPage() {
  const [code, setCode] = useState(demoChallenge.starterCode);
  const [outcomes, setOutcomes] = useState<TestOutcome[] | null>(null);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [runState, setRunState] = useState<RunState>("idle");

  const passedCount = useMemo(
    () => outcomes?.filter((o) => o.pass).length ?? 0,
    [outcomes]
  );

  function handleRun() {
    const result = runChallengeTests(demoChallenge, code);
    setOutcomes(result.outcomes);
    setRuntimeError(result.error);
    setRunState(result.outcomes.every((o) => o.pass) ? "passed" : "failed");
  }

  function handleReset() {
    setCode(demoChallenge.starterCode);
    setOutcomes(null);
    setRuntimeError(null);
    setRunState("idle");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1 py-10 sm:py-14">
        <PageContainer>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
                Demo mode — nothing you do here is saved
              </span>
              <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                Try the coding assessment
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                This is a real, runnable task from our library. Write a
                solution, run the tests, and see the results instantly — no
                account required.
              </p>
            </div>

            <Button
              className="w-full shrink-0 sm:w-auto"
              nativeButton={false}
              render={<Link href="/register" />}
            >
              Create a free account
            </Button>
          </div>

          <div className="mt-8 overflow-hidden rounded-4xl border border-border/60 bg-card ring-1 ring-foreground/5 dark:ring-foreground/10">
            <div className="flex items-center justify-between gap-3 border-b border-border/60 bg-muted/30 px-5 py-3">
              <span className="flex items-center gap-2">
                <span className="flex gap-1.5">
                  <span className="size-2.5 rounded-full bg-destructive/60" />
                  <span className="size-2.5 rounded-full bg-chart-4/60" />
                  <span className="size-2.5 rounded-full bg-chart-1/60" />
                </span>
                <span className="ml-2 text-xs font-medium text-muted-foreground">
                  demo.workspace — {demoChallenge.title}
                </span>
              </span>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <RotateCcw className="size-3.5" aria-hidden data-icon="inline-start" />
                Reset
              </Button>
            </div>

            <div className="grid min-h-[420px] divide-border/60 lg:grid-cols-[1fr_1.3fr_1fr] lg:divide-x">
              <div className="p-5">
                <p className="text-xs font-semibold text-muted-foreground">
                  Task Description
                </p>
                <h2 className="mt-3 text-sm font-semibold">
                  {demoChallenge.title}
                </h2>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {demoChallenge.description}
                </p>
                <ul className="mt-4 flex flex-col gap-1.5">
                  {demoChallenge.requirements.map((req) => (
                    <li
                      key={req}
                      className="text-xs leading-5 text-muted-foreground"
                    >
                      • {req}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex min-h-[260px] flex-col border-t border-border/60 lg:border-t-0">
                <div className="flex items-center justify-between px-5 py-3">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Code Editor
                  </p>
                  <Button size="sm" onClick={handleRun}>
                    Run tests
                  </Button>
                </div>
                <div className="min-h-[220px] flex-1">
                  <CodeEditor value={code} onChange={setCode} />
                </div>
              </div>

              <div className="border-t border-border/60 p-5 lg:border-t-0">
                <p className="text-xs font-semibold text-muted-foreground">
                  Test Results
                </p>

                {runState === "idle" && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Run the tests to see results here.
                  </p>
                )}

                {runtimeError && (
                  <p className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 px-2.5 py-2 text-xs text-destructive">
                    {runtimeError}
                  </p>
                )}

                {outcomes && !runtimeError && (
                  <>
                    <p className="mt-3 text-xs font-medium">
                      {passedCount}/{outcomes.length} tests passed
                    </p>
                    <ul className="mt-2 space-y-2 text-xs">
                      {outcomes.map((outcome) => (
                        <li
                          key={outcome.label}
                          className="flex items-start gap-2 text-foreground/80"
                        >
                          {outcome.pass ? (
                            <CheckCircle2
                              className="mt-0.5 size-3.5 shrink-0 text-primary"
                              aria-hidden
                            />
                          ) : (
                            <XCircle
                              className="mt-0.5 size-3.5 shrink-0 text-destructive"
                              aria-hidden
                            />
                          )}
                          <span>
                            {outcome.label}
                            {!outcome.pass && (
                              <span className="block text-muted-foreground">
                                expected {formatValue(outcome.expected)}, got{" "}
                                {formatValue(outcome.received)}
                              </span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center gap-3 rounded-3xl border border-border/60 bg-muted/20 p-6 text-center sm:flex-row sm:justify-between sm:text-left">
            <p className="text-sm text-muted-foreground">
              Like what you see? Create a free account to unlock the full
              task library, CodeCheck scoring, and a verifiable certificate.
            </p>
            <Button
              className="w-full shrink-0 sm:w-auto"
              variant="outline"
              nativeButton={false}
              render={<Link href="/register" />}
            >
              Create a free account
            </Button>
          </div>
        </PageContainer>
      </main>

      <SiteFooter />
    </div>
  );
}

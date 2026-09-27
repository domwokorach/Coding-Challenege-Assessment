"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  CircleDot,
  Clock,
  Code2,
  FileText,
  ShieldCheck,
  XCircle,
} from "lucide-react";

export function PlatformShowcase() {
  return (
    <Tabs defaultValue="coding" className="items-center">
      <TabsList className="h-auto flex-wrap gap-1 p-1">
        <TabsTrigger value="coding">Coding Assessment</TabsTrigger>
        <TabsTrigger value="codecheck">CodeCheck</TabsTrigger>
        <TabsTrigger value="results">Task Results</TabsTrigger>
        <TabsTrigger value="certificates">Certificates</TabsTrigger>
      </TabsList>

      <div className="mt-8 w-full">
        <TabsContent value="coding">
          <CodingAssessmentPanel />
        </TabsContent>
        <TabsContent value="codecheck">
          <CodeCheckPanel />
        </TabsContent>
        <TabsContent value="results">
          <TaskResultsPanel />
        </TabsContent>
        <TabsContent value="certificates">
          <CertificatesPanel />
        </TabsContent>
      </div>
    </Tabs>
  );
}

function ShowcaseFrame({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-4xl border border-border/60 bg-card ring-1 ring-foreground/5 dark:ring-foreground/10">
      <div className="flex items-center gap-2 border-b border-border/60 bg-muted/30 px-5 py-3">
        <span className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-destructive/60" />
          <span className="size-2.5 rounded-full bg-chart-4/60" />
          <span className="size-2.5 rounded-full bg-chart-1/60" />
        </span>
        <span className="ml-2 text-xs font-medium text-muted-foreground">
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}

function CodingAssessmentPanel() {
  return (
    <ShowcaseFrame label="assessment.workspace">
      <div className="grid divide-border/60 sm:grid-cols-[1fr_1.3fr_1fr] sm:divide-x">
        <div className="p-5">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <FileText className="size-3.5" aria-hidden />
            Task Description
          </p>
          <h4 className="mt-3 text-sm font-semibold">Merge Sorted Ranges</h4>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Given a list of numeric ranges, merge all overlapping ranges and
            return them sorted by start value.
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3.5" aria-hidden />
            32:14 remaining
          </div>
        </div>

        <div className="border-t border-border/60 bg-muted/10 p-5 font-mono text-xs leading-6 sm:border-t-0">
          <p className="flex items-center gap-1.5 font-sans text-xs font-semibold text-muted-foreground">
            <Code2 className="size-3.5" aria-hidden />
            Code Editor
          </p>
          <pre className="mt-3 overflow-x-auto whitespace-pre text-foreground/80">
{`function mergeRanges(ranges) {
  const sorted = [...ranges].sort(
    (a, b) => a[0] - b[0]
  );

  return sorted.reduce((merged, [s, e]) => {
    const last = merged[merged.length - 1];
    if (last && s <= last[1]) {
      last[1] = Math.max(last[1], e);
    } else {
      merged.push([s, e]);
    }
    return merged;
  }, []);
}`}
          </pre>
        </div>

        <div className="border-t border-border/60 p-5 sm:border-t-0">
          <p className="text-xs font-semibold text-muted-foreground">
            Test Results
          </p>
          <ul className="mt-3 space-y-2 text-xs">
            <li className="flex items-center gap-2 text-foreground/80">
              <CheckCircle2 className="size-3.5 text-primary" aria-hidden />
              handles no overlaps
            </li>
            <li className="flex items-center gap-2 text-foreground/80">
              <CheckCircle2 className="size-3.5 text-primary" aria-hidden />
              merges adjacent ranges
            </li>
            <li className="flex items-center gap-2 text-foreground/80">
              <CheckCircle2 className="size-3.5 text-primary" aria-hidden />
              merges nested ranges
            </li>
            <li className="flex items-center gap-2 text-muted-foreground">
              <CircleDot className="size-3.5" aria-hidden />
              handles empty input
            </li>
          </ul>
        </div>
      </div>
    </ShowcaseFrame>
  );
}

function CodeCheckPanel() {
  const metrics = [
    { label: "Correctness", value: 96 },
    { label: "Performance", value: 88 },
    { label: "Code Quality", value: 91 },
    { label: "Tests Passed", value: 100 },
  ];

  return (
    <ShowcaseFrame label="codecheck.analysis">
      <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8">
        {metrics.map((metric) => (
          <div key={metric.label} className="flex flex-col gap-2.5">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium">{metric.label}</span>
              <span className="text-sm font-semibold tabular-nums">
                {metric.value}%
              </span>
            </div>
            <Progress value={metric.value} />
          </div>
        ))}
      </div>
    </ShowcaseFrame>
  );
}

function TaskResultsPanel() {
  const rows = [
    { name: "Merge Sorted Ranges", status: "Passed", score: "100%" },
    { name: "Rate Limiter", status: "Passed", score: "92%" },
    { name: "LRU Cache", status: "Partial", score: "68%" },
    { name: "Debounce Utility", status: "Failed", score: "24%" },
  ];

  return (
    <ShowcaseFrame label="assessment.summary">
      <div className="p-6 sm:p-8">
        <div className="grid grid-cols-3 gap-4 sm:max-w-sm">
          <div>
            <p className="text-2xl font-bold">4</p>
            <p className="text-xs text-muted-foreground">Tasks attempted</p>
          </div>
          <div>
            <p className="text-2xl font-bold">71%</p>
            <p className="text-xs text-muted-foreground">Overall score</p>
          </div>
          <div>
            <p className="text-2xl font-bold">48m</p>
            <p className="text-xs text-muted-foreground">Time spent</p>
          </div>
        </div>

        <ul className="mt-7 divide-y divide-border/60 border-t border-border/60">
          {rows.map((row) => (
            <li
              key={row.name}
              className="flex items-center justify-between py-3 text-sm"
            >
              <span className="font-medium">{row.name}</span>
              <span className="flex items-center gap-3">
                <span
                  className={
                    row.status === "Passed"
                      ? "text-primary"
                      : row.status === "Partial"
                      ? "text-chart-4"
                      : "text-destructive"
                  }
                >
                  {row.status}
                </span>
                <span className="w-10 text-right text-muted-foreground tabular-nums">
                  {row.score}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </ShowcaseFrame>
  );
}

function CertificatesPanel() {
  return (
    <ShowcaseFrame label="certificate.preview">
      <div className="grid gap-6 p-6 sm:grid-cols-[1.4fr_1fr] sm:p-8">
        <div className="rounded-3xl border border-border/60 bg-gradient-to-br from-primary/10 via-card to-card p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Certificate of Completion
          </p>
          <h4 className="mt-3 text-lg font-bold">
            Software Engineer Programme
          </h4>
          <p className="mt-1 text-sm text-muted-foreground">
            Awarded to Jordan Lee
          </p>
          <p className="mt-6 font-mono text-xs text-muted-foreground">
            ID: SEP-2026-04193
          </p>
        </div>

        <div className="flex flex-col justify-center gap-3 rounded-3xl border border-border/60 bg-muted/20 p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <ShieldCheck className="size-4" aria-hidden />
            Verified
          </div>
          <p className="text-xs leading-5 text-muted-foreground">
            This certificate&apos;s ID can be independently verified against
            the assessment record at any time.
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <CheckCircle2 className="size-3.5 text-primary" aria-hidden />
            Issued Feb 10, 2026
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <XCircle className="size-3.5" aria-hidden />
            Not yet expired
          </div>
        </div>
      </div>
    </ShowcaseFrame>
  );
}

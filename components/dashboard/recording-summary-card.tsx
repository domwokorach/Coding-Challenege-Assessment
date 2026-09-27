import { formatDateTime } from "@/lib/assessment/progress";
import { formatClock, type AssessmentRecording } from "@/lib/assessment/recording";
import { getLanguageOption } from "@/lib/assessment/languages";
import { cn } from "@/lib/utils";

function statusLabel(status: AssessmentRecording["status"]): string {
  if (status === "recording") return "Recording in progress";
  if (status === "failed") return "Recording unavailable";
  return "Completed";
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-medium text-zinc-900 dark:text-zinc-100">
        {value}
      </dd>
    </div>
  );
}

/**
 * Recording status/session summary shown in the Candidate Report. All
 * fields come from the persisted `AssessmentRecording` row and its live
 * event counts — never estimated or defaulted to a fake number.
 */
export function RecordingSummaryCard({
  recording,
  className,
}: {
  recording: AssessmentRecording | null;
  className?: string;
}) {
  if (!recording) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900",
          className
        )}
      >
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Recording Summary
        </h3>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          No recorded session is available for this assessment yet.
        </p>
      </div>
    );
  }

  const languageLabel = recording.language
    ? (getLanguageOption(recording.language)?.label ?? recording.language)
    : "Not available";

  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900",
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Recording Summary
        </h3>
        <span
          className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          aria-live="polite"
        >
          <span
            aria-hidden
            className={cn(
              "size-2 rounded-full",
              recording.status === "recording"
                ? "animate-pulse bg-red-500 motion-reduce:animate-none"
                : recording.status === "completed"
                  ? "bg-emerald-500"
                  : "bg-zinc-400"
            )}
          />
          {statusLabel(recording.status)}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Field
          label="Duration"
          value={recording.duration !== null ? formatClock(recording.duration) : "—"}
        />
        <Field
          label="Started at"
          value={recording.startedAt ? formatDateTime(recording.startedAt) : "—"}
        />
        <Field
          label="Submitted at"
          value={recording.submittedAt ? formatDateTime(recording.submittedAt) : "—"}
        />
        <Field label="Language" value={languageLabel} />
        <Field label="Run Code attempts" value={String(recording.counts.runCodeCount)} />
        <Field label="Test runs" value={String(recording.counts.testRunCount)} />
      </dl>
    </div>
  );
}

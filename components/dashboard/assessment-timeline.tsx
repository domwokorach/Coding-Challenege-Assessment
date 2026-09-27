import { formatDateTime } from "@/lib/assessment/progress";
import type { TimelineEvent } from "@/lib/assessment/timeline";
import { cn } from "@/lib/utils";

export function AssessmentTimeline({
  events,
  className,
}: {
  events: TimelineEvent[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900",
        className
      )}
    >
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Assessment Timeline
      </h3>

      {events.length === 0 ? (
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          No timeline events yet — they appear as you start and submit tasks.
        </p>
      ) : (
        <ol className="mt-4 flex flex-col">
          {events.map((event, i) => (
            <li key={event.id} className="relative flex gap-3 pb-6 last:pb-0">
              {i < events.length - 1 && (
                <span
                  aria-hidden
                  className="absolute top-3 left-[5px] h-full w-px bg-zinc-200 dark:bg-zinc-800"
                />
              )}
              <span
                aria-hidden
                className="relative z-10 mt-1.5 size-2.5 shrink-0 rounded-full bg-emerald-500 dark:bg-emerald-400"
              />
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {event.label}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-500">
                  {formatDateTime(event.at)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

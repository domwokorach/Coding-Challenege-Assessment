import { formatDateTime } from "@/lib/assessment/progress";
import type { TimelineEvent } from "@/lib/assessment/timeline";
import { cn } from "@/lib/utils";

/** Task-related events (opened/submitted) carry a recorded coding session moment worth jumping to in the replay below; the rest are just milestones. */
function isJumpable(event: TimelineEvent): boolean {
  return event.id.startsWith("task-opened-") || event.id.startsWith("task-submitted-");
}

export function AssessmentTimeline({
  events,
  onSelectEvent,
  className,
}: {
  events: TimelineEvent[];
  /** Called with a task event's ISO timestamp when the candidate clicks it, to seek the Solution Replay player below. */
  onSelectEvent?: (atIso: string) => void;
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
        Timeline
      </h3>

      {events.length === 0 ? (
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          No timeline events yet — they appear as you start and submit tasks.
        </p>
      ) : (
        <ol className="mt-4 flex flex-col">
          {events.map((event, i) => {
            const jumpable = Boolean(onSelectEvent) && isJumpable(event);
            const content = (
              <>
                <span
                  aria-hidden
                  className="relative z-10 mt-1.5 size-2.5 shrink-0 rounded-full bg-emerald-500 dark:bg-emerald-400"
                />
                <div>
                  <p
                    className={cn(
                      "text-sm font-medium text-zinc-900 dark:text-zinc-100",
                      jumpable && "underline-offset-2 group-hover:underline"
                    )}
                  >
                    {event.label}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">
                    {formatDateTime(event.at)}
                  </p>
                </div>
              </>
            );
            return (
              <li key={event.id} className="relative flex gap-3 pb-6 last:pb-0">
                {i < events.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute top-3 left-[5px] h-full w-px bg-zinc-200 dark:bg-zinc-800"
                  />
                )}
                {jumpable ? (
                  <button
                    type="button"
                    onClick={() => onSelectEvent?.(event.at)}
                    className="group flex gap-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100"
                  >
                    {content}
                  </button>
                ) : (
                  content
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

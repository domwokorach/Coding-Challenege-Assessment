import { HighlightedLine } from "@/lib/code-highlight";

/**
 * Read-only, syntax-highlighted view of the candidate's code as it stood at
 * a given point in an Assessment Timeline replay. Styled to match
 * `CodeEditor`'s gutter/line layout so the replay looks like "the same
 * editor", just non-interactive.
 */
export function CodePlaybackView({
  code,
  fileName,
}: {
  code: string;
  fileName: string;
}) {
  const lines = code.split("\n");

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-zinc-100 dark:bg-zinc-950">
      <div className="flex shrink-0 items-center gap-2 border-b border-zinc-300 bg-white px-3 py-1.5 font-mono text-xs text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
        {fileName}
      </div>
      <div
        className="flex min-h-0 flex-1 overflow-auto font-mono text-[13px] leading-6"
        role="group"
        aria-label={`Candidate code, ${fileName}`}
      >
        <div
          aria-hidden
          className="select-none overflow-hidden px-3 py-3 text-right text-zinc-400 dark:text-zinc-600"
        >
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <pre className="min-w-0 flex-1 overflow-visible whitespace-pre py-3 pr-4">
          {lines.map((line, i) => (
            <div key={i}>
              <HighlightedLine line={line} />
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}

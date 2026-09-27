"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

export function CodeEditor({
  value,
  onChange,
  readOnly = false,
  ariaLabel,
}: {
  value: string;
  /** Required unless `readOnly` is set — a read-only editor never calls this. */
  onChange?: (value: string) => void;
  /** Renders a plain, non-editable textarea for reviewing already-submitted code. */
  readOnly?: boolean;
  /** Overrides the default aria-label, e.g. to state this view is read-only. */
  ariaLabel?: string;
}) {
  const gutterRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lineCount = value.split("\n").length;

  function handleScroll() {
    if (gutterRef.current && textareaRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (readOnly) return;
    if (e.key === "Escape") {
      // Accessible escape hatch: Tab is intercepted below for indentation,
      // so keyboard-only users need another way out of the editor.
      e.currentTarget.blur();
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const el = e.currentTarget;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const next = value.slice(0, start) + "  " + value.slice(end);
      onChange?.(next);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + 2;
      });
    }
  }

  return (
    <div className="flex h-full min-h-0 w-full overflow-hidden bg-zinc-100 font-mono text-[13px] leading-6 dark:bg-zinc-950">
      <div
        ref={gutterRef}
        className="select-none overflow-hidden px-3 py-3 text-right text-zinc-400 dark:text-zinc-600"
        aria-hidden
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={readOnly ? undefined : (e) => onChange?.(e.target.value)}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        readOnly={readOnly}
        aria-readonly={readOnly || undefined}
        aria-label={
          ariaLabel ??
          (readOnly
            ? "Submitted code. Read-only."
            : "Code editor. Press Escape to leave the editor.")
        }
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        className={cn(
          "h-full min-h-0 w-full flex-1 resize-none overflow-auto whitespace-pre bg-transparent py-3 pr-4 text-zinc-900 outline-none dark:text-zinc-100",
          readOnly && "cursor-default"
        )}
      />
    </div>
  );
}

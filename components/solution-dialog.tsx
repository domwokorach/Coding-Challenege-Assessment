"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon, XIcon } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function SolutionDialog({
  open,
  onOpenChange,
  challengeTitle,
  code,
  explanation,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  challengeTitle: string;
  code: string;
  explanation: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setCopied(false);
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="gap-0 rounded-2xl border border-zinc-200 bg-white p-0 text-zinc-900 shadow-2xl sm:max-w-lg dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <div>
            <DialogTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Reference Solution
            </DialogTitle>
            <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
              {challengeTitle}
            </p>
          </div>
          <DialogClose
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              />
            }
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>

        <pre className="max-h-80 overflow-auto whitespace-pre-wrap wrap-break-word bg-zinc-950 p-5 font-mono text-sm leading-6 text-zinc-200 dark:bg-black">
          {code}
        </pre>

        <div className="border-t border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Explanation
          </p>
          <p className="mt-1.5 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
            {explanation}
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <Button
            size="sm"
            onClick={() => void handleCopy()}
            className="gap-1.5 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            {copied ? (
              <CheckIcon className="size-3.5" />
            ) : (
              <CopyIcon className="size-3.5" />
            )}
            {copied ? "Copied" : "Copy Code"}
          </Button>
          <DialogClose
            render={
              <Button
                variant="outline"
                size="sm"
                className="border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              />
            }
          >
            Close
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}

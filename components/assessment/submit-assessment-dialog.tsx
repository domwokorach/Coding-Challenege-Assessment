"use client";

import { useReducedMotion } from "motion/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/assessment/motion/alert";
import { Spinner } from "@/components/ui/spinner";

export interface SubmitAssessmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submitting: boolean;
  error: string | null;
  onConfirm: () => void;
  /** False while the candidate still has incomplete tasks — disables Submit. */
  canSubmit: boolean;
  /** Shown instead of the confirmation copy when `canSubmit` is false. */
  blockedMessage?: string;
}

export function SubmitAssessmentDialog({
  open,
  onOpenChange,
  submitting,
  error,
  onConfirm,
  canSubmit,
  blockedMessage,
}: SubmitAssessmentDialogProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        // A submission request is in flight — block Escape, outside-press,
        // and any other dismissal so the UI can't desync from its result.
        if (submitting) return;
        onOpenChange(next);
      }}
    >
      <AlertDialogContent size="sm">
        <Alert
          variant={error ? "destructive" : "default"}
          role={undefined}
          transition={prefersReducedMotion ? { duration: 0 } : undefined}
          className="border-none bg-transparent p-0"
        >
          <AlertDialogHeader className="p-0">
            <AlertDialogTitle render={<AlertTitle />}>
              Submit your assessment?
            </AlertDialogTitle>
            <AlertDialogDescription render={<AlertDescription />}>
              Are you sure you want to submit your assessment? After
              submission, you will not be able to change your answers.
            </AlertDialogDescription>
          </AlertDialogHeader>
        </Alert>

        {!canSubmit && blockedMessage && (
          <p className="text-sm text-amber-700 dark:text-amber-400">
            {blockedMessage}
          </p>
        )}

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={submitting || !canSubmit}
            aria-busy={submitting}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
          >
            {submitting ? (
              <span className="flex items-center gap-1.5">
                <Spinner className="size-3.5" />
                Submitting…
              </span>
            ) : (
              "Submit"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

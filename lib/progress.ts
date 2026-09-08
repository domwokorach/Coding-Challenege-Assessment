import { addYears, format, isAfter } from "date-fns";
import type { TestOutcome } from "@/lib/challenges";

export type ChallengeStatus = "ready" | "running" | "passed" | "failed";

export type ChallengeResult = {
  status: ChallengeStatus;
  outcomes: TestOutcome[] | null;
  runtimeError: string | null;
};

export const CERTIFICATE_VALIDITY_YEARS = 4;

export type ProgressState = {
  code: Record<number, string>;
  results: Record<number, ChallengeResult>;
  completed: Record<number, boolean>;
  assessmentStarted: boolean;
  assessmentStartedAt: string | null;
  learnerName: string;
  nameConfirmed: boolean;
  nameConfirmedAt: string | null;
  courseCompleted: boolean;
  completionDate: string | null;
  certificateId: string | null;
  certificateUrl: string | null;
  issueDate: string | null;
  expiryDate: string | null;
};

const COURSE_NAME = "Software Engineer Programme";

export function createDefaultProgress(
  starterCodeById: Record<number, string>
): ProgressState {
  return {
    code: { ...starterCodeById },
    results: {},
    completed: {},
    assessmentStarted: false,
    assessmentStartedAt: null,
    learnerName: "",
    nameConfirmed: false,
    nameConfirmedAt: null,
    courseCompleted: false,
    completionDate: null,
    certificateId: null,
    certificateUrl: null,
    issueDate: null,
    expiryDate: null,
  };
}

export function generateCertificateId(): string {
  const bytes = new Uint8Array(6);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "";
  for (const byte of bytes) {
    id += chars[byte % chars.length];
  }
  return `SEP-${id}`;
}

export function buildCertificateUrl(certificateId: string): string {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/certificate/${certificateId}`;
}

export function formatCompletionDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Certificates show DD/MM/YYYY per the issue/expiry date spec. */
export function formatCertificateDate(iso: string): string {
  return format(new Date(iso), "dd/MM/yyyy");
}

export function computeExpiryDate(issueDateIso: string): string {
  return addYears(new Date(issueDateIso), CERTIFICATE_VALIDITY_YEARS).toISOString();
}

export function isCertificateExpired(expiryDateIso: string | null): boolean {
  if (!expiryDateIso) return false;
  return isAfter(new Date(), new Date(expiryDateIso));
}

export { COURSE_NAME };

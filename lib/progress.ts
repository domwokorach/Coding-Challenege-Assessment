import type { TestOutcome } from "@/lib/challenges";

export type ChallengeStatus = "ready" | "running" | "passed" | "failed";

export type ChallengeResult = {
  status: ChallengeStatus;
  outcomes: TestOutcome[] | null;
  runtimeError: string | null;
};

export type ProgressState = {
  code: Record<number, string>;
  results: Record<number, ChallengeResult>;
  completed: Record<number, boolean>;
  learnerName: string;
  courseCompleted: boolean;
  completionDate: string | null;
  certificateId: string | null;
  certificateUrl: string | null;
};

const STORAGE_KEY = "sep-assessment-progress-v1";
const COURSE_NAME = "Software Engineer Programme";

export function createDefaultProgress(
  starterCodeById: Record<number, string>
): ProgressState {
  return {
    code: { ...starterCodeById },
    results: {},
    completed: {},
    learnerName: "",
    courseCompleted: false,
    completionDate: null,
    certificateId: null,
    certificateUrl: null,
  };
}

export function loadProgress(): ProgressState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ProgressState;
  } catch {
    return null;
  }
}

export function saveProgress(state: ProgressState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage unavailable (private browsing, quota, etc.) — progress simply
    // won't persist across reloads; nothing else to do about it here.
  }
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

export { COURSE_NAME };

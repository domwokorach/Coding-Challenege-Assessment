import type { ProgressState } from "@/lib/progress";

/**
 * In-memory, single-process store — no database, no environment variables.
 * The app has no authentication, so there is exactly one progress record
 * (the shared "guest" record) for every visitor.
 *
 * Trade-off: state lives only in this server process's memory. It resets on
 * every server restart/redeploy and is not shared across multiple
 * serverless function instances. That's an accepted limitation of running
 * with no database configured, not a bug to work around.
 */
type StoredProgress = {
  data: ProgressState;
  certificateId: string | null;
};

let store: StoredProgress | null = null;

export function readProgress(): ProgressState | null {
  return store?.data ?? null;
}

export function writeProgress(data: ProgressState): void {
  store = { data, certificateId: data.certificateId ?? null };
}

export function readProgressByCertificateId(
  certificateId: string
): ProgressState | null {
  if (store?.certificateId === certificateId) return store.data;
  return null;
}

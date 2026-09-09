import { readProgressByCertificateId } from "@/lib/progress-store";
import type { ProgressState } from "@/lib/progress";

/**
 * Certificates are public by design — anyone with the link can verify one,
 * without being signed in or owning the record. Looked up by the
 * denormalized certificateId, not the owning user.
 */
export function getProgressByCertificateId(
  certificateId: string
): ProgressState | null {
  return readProgressByCertificateId(certificateId);
}

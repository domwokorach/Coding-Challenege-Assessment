import Link from "next/link";
import { CertificateActions } from "@/components/certificate-actions";
import { CertificateDocument } from "@/components/certificate-document";
import { getProgressByCertificateId } from "@/lib/certificates";
import {
  COURSE_NAME,
  formatCertificateDate,
  isCertificateExpired,
} from "@/lib/progress";

// Public by design — certificates verify a learner's completion to anyone
// with the link, so this page does not require authentication.
export default async function CertificatePage(
  props: PageProps<"/certificate/[id]">
) {
  const { id } = await props.params;
  const progress = getProgressByCertificateId(id);

  if (
    !progress ||
    !progress.courseCompleted ||
    !progress.nameConfirmed ||
    progress.certificateId !== id ||
    !progress.issueDate ||
    !progress.expiryDate
  ) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 px-6 text-center text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <p className="text-lg font-semibold">Certificate not found</p>
        <p className="max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
          This certificate link doesn&apos;t match anything, or the
          certificate name hasn&apos;t been confirmed yet.
        </p>
        <Link
          href="/"
          className="mt-2 rounded-md border border-zinc-300 bg-zinc-100 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
        >
          Back to Assessment
        </Link>
      </div>
    );
  }

  const expired = isCertificateExpired(progress.expiryDate);
  const learnerName = progress.learnerName;
  const issueDateLabel = formatCertificateDate(progress.issueDate);
  const expiryDateLabel = formatCertificateDate(progress.expiryDate);

  // Expired certificates are no longer a valid public certificate: no
  // document, no download, no print — only a status notice.
  if (expired) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 px-6 text-center text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <p className="text-lg font-semibold text-red-600 dark:text-red-400">
          Certificate Expired
        </p>
        <p className="max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
          This certificate was issued to {learnerName} on {issueDateLabel} and
          expired on {expiryDateLabel}. It is no longer available as a valid
          public certificate, and download and printing are disabled.
        </p>
        <Link
          href="/"
          className="mt-2 rounded-md border border-zinc-300 bg-zinc-100 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
        >
          Back to Assessment
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-12 dark:bg-zinc-950 print:bg-white print:py-0">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 print:hidden">
          <Link
            href="/"
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← Back to Assessment
          </Link>
        </div>

        <CertificateDocument
          learnerName={learnerName}
          courseName={COURSE_NAME}
          issueDateLabel={issueDateLabel}
          expiryDateLabel={expiryDateLabel}
          certificateId={id}
        />

        <CertificateActions
          learnerName={learnerName}
          issueDateLabel={issueDateLabel}
          expiryDateLabel={expiryDateLabel}
          certificateId={id}
        />
      </div>
    </div>
  );
}

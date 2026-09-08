export function CertificateDocument({
  learnerName,
  courseName,
  issueDateLabel,
  expiryDateLabel,
  certificateId,
}: {
  learnerName: string;
  courseName: string;
  issueDateLabel: string;
  expiryDateLabel: string;
  certificateId: string;
}) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 px-8 py-14 text-center shadow-2xl print:border-zinc-300 print:bg-white print:text-zinc-900 print:shadow-none">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
        Certificate of Completion
      </p>
      <h1 className="mt-2 text-2xl font-bold text-zinc-100 print:text-zinc-900 sm:text-3xl">
        {courseName}
      </h1>
      <p className="mt-8 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">
        Awarded to
      </p>
      <p className="mt-2 text-3xl font-bold text-zinc-50 print:text-zinc-900 sm:text-4xl">
        {learnerName}
      </p>
      <p className="mx-auto mt-6 max-w-sm text-sm leading-6 text-zinc-400 print:text-zinc-600">
        For successfully completing 3 Chapters and all Coding Challenges
      </p>
      <div className="mt-10 flex flex-col items-center justify-center gap-2 border-t border-zinc-800 pt-6 text-sm text-zinc-400 print:border-zinc-300 print:text-zinc-600 sm:flex-row sm:gap-8">
        <span>Issued: {issueDateLabel}</span>
        <span>Expires: {expiryDateLabel}</span>
        <span className="font-mono text-zinc-300 print:text-zinc-800">
          Certificate ID: {certificateId}
        </span>
      </div>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { renderCertificateHtml } from "@/lib/certificates/certificate-html";
import { COURSE_NAME } from "@/lib/assessment/progress";

export function CertificateActions({
  learnerName,
  issueDateLabel,
  expiryDateLabel,
  certificateId,
}: {
  learnerName: string;
  issueDateLabel: string;
  expiryDateLabel: string;
  certificateId: string;
}) {
  function handleDownload() {
    const html = renderCertificateHtml({
      learnerName,
      courseName: COURSE_NAME,
      issueDateLabel,
      expiryDateLabel,
      certificateId,
    });
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${certificateId}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="mt-6 flex flex-wrap justify-center gap-3 print:hidden">
      <Button
        onClick={handleDownload}
        className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
      >
        Download Certificate
      </Button>
      <Button
        variant="outline"
        onClick={handlePrint}
        className="border-zinc-300 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
      >
        Print
      </Button>
    </div>
  );
}

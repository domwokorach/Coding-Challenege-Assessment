function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function renderCertificateHtml(props: {
  learnerName: string;
  courseName: string;
  issueDateLabel: string;
  expiryDateLabel: string;
  certificateId: string;
}): string {
  const { learnerName, courseName, issueDateLabel, expiryDateLabel, certificateId } =
    props;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Certificate of Completion — ${escapeHtml(learnerName)}</title>
<style>
  body { margin:0; padding:48px; background:#09090b; color:#f4f4f5; font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; display:flex; align-items:center; justify-content:center; min-height:100vh; box-sizing:border-box; }
  .cert { max-width:640px; width:100%; background:#18181b; border:1px solid #27272a; border-radius:24px; padding:56px 48px; text-align:center; }
  .eyebrow { font-size:12px; letter-spacing:0.2em; text-transform:uppercase; color:#71717a; }
  .title { font-size:28px; font-weight:700; margin:8px 0 32px; }
  .label { font-size:12px; letter-spacing:0.15em; text-transform:uppercase; color:#71717a; margin-top:24px; }
  .name { font-size:32px; font-weight:700; margin-top:8px; }
  .desc { font-size:14px; color:#a1a1aa; margin:16px auto 0; max-width:360px; line-height:1.6; }
  .meta { display:flex; justify-content:center; gap:32px; flex-wrap:wrap; margin-top:32px; padding-top:24px; border-top:1px solid #27272a; font-size:13px; color:#a1a1aa; }
  .id { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; color:#e4e4e7; }
</style>
</head>
<body>
  <div class="cert">
    <div class="eyebrow">Certificate of Completion</div>
    <div class="title">${escapeHtml(courseName)}</div>
    <div class="label">Awarded to</div>
    <div class="name">${escapeHtml(learnerName)}</div>
    <div class="desc">For successfully completing 3 Chapters and all Coding Challenges</div>
    <div class="meta">
      <div>Issued: ${escapeHtml(issueDateLabel)}</div>
      <div>Expires: ${escapeHtml(expiryDateLabel)}</div>
      <div class="id">Certificate ID: ${escapeHtml(certificateId)}</div>
    </div>
  </div>
</body>
</html>
`;
}

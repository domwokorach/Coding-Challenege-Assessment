import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/layout/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy — Software Engineer Programme",
  description: "Privacy Policy for the Software Engineer Programme coding assessment platform.",
};

const LAST_UPDATED = "September 9, 2026";

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated={LAST_UPDATED}>
      <p className="rounded-md border border-amber-300/60 bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
        This document is a template and does not constitute finalized legal
        advice. Sections marked with{" "}
        <span className="font-semibold">[placeholder]</span> must be completed
        and reviewed by qualified legal counsel before this document is relied
        upon or published as a binding privacy policy.
      </p>

      <LegalSection heading="1. Information We Collect">
        <p>
          This Privacy Policy describes the information collected by the
          Software Engineer Programme coding assessment platform (the
          &quot;Service&quot;), operated by{" "}
          <span className="italic">[Company Name — placeholder]</span>. We
          only describe data the Service actually collects — we do not
          collect information beyond what is set out below.
        </p>
      </LegalSection>

      <LegalSection heading="2. Account Information">
        <p>
          The Service does not currently require account registration, a
          username, a password, or an email address to use. Where you
          voluntarily enter your name to generate a completion certificate,
          that name is stored as part of your assessment record as described
          in the section below.
        </p>
      </LegalSection>

      <LegalSection heading="3. Assessment and Candidate Data">
        <p>As you use the Service, we store:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>The code you write for each challenge and your test results;</li>
          <li>Which challenges you have completed and when;</li>
          <li>Whether you have started or completed the overall assessment;</li>
          <li>The name you provide for certificate generation, along with the certificate identifier, issue date, and expiry date.</li>
        </ul>
        <p>
          As the Service does not require login, this data is currently
          associated with a single shared session rather than a
          individually-authenticated identity.
        </p>
      </LegalSection>

      <LegalSection heading="4. Security and Anti-Cheating Data">
        <p>
          During an active assessment, the Service applies client-side checks
          in your browser — detecting tab or window focus changes, blocking
          copy/cut actions, blocking the right-click menu, and attempting to
          detect the Print Screen key — and shows you a warning and running
          count when these occur, as described in our{" "}
          <a href="/terms" className="underline hover:text-zinc-900 dark:hover:text-zinc-100">
            Terms and Conditions
          </a>
          . These checks run only in your browser during the session; the
          Service does not use webcam or microphone access, screen recording,
          or third-party proctoring tools. Whether warning counts are
          persisted beyond the active session is currently{" "}
          <span className="italic">[placeholder — to be confirmed]</span>.
        </p>
      </LegalSection>

      <LegalSection heading="5. How We Use Information">
        <p>
          We use the information described above to operate the Service:
          saving and restoring your in-progress work, tracking completion of
          challenges, generating certificates, and displaying assessment
          integrity warnings to you. We do not use this information for
          advertising and do not sell it.
        </p>
      </LegalSection>

      <LegalSection heading="6. Cookies and Browser Storage">
        <p>
          The Service uses browser local storage to remember your display
          theme preference (light or dark mode) and a cookie to remember
          whether the navigation sidebar is expanded or collapsed. These are
          functional preferences only. The Service does not currently use
          analytics, advertising, or tracking cookies.
        </p>
      </LegalSection>

      <LegalSection heading="7. Data Sharing">
        <p>
          We do not sell your information. We do not currently share
          assessment or candidate data with third parties, except where
          required to operate core infrastructure (such as our database
          hosting provider) or where required by law. If additional
          third-party services (for example, analytics or proctoring
          providers) are introduced, this section will be updated to name
          them before they are used.
        </p>
      </LegalSection>

      <LegalSection heading="8. Data Security">
        <p>
          We take reasonable technical measures to protect the information
          stored by the Service. However, no method of electronic storage or
          transmission is completely secure, and we cannot guarantee absolute
          security. Additional detail on our security practices and any
          certifications will be added here:{" "}
          <span className="italic">[placeholder]</span>.
        </p>
      </LegalSection>

      <LegalSection heading="9. Data Retention">
        <p>
          We retain assessment and candidate data for as long as needed to
          provide the Service, including so that issued certificates remain
          verifiable. Specific retention periods have not yet been finalized:{" "}
          <span className="italic">[retention period — placeholder]</span>.
        </p>
      </LegalSection>

      <LegalSection heading="10. User Rights">
        <p>
          Depending on your jurisdiction, you may have rights to access,
          correct, or request deletion of your personal information. As the
          Service does not require an account, requests can currently be made
          by contacting us using the details below. Jurisdiction-specific
          rights (for example, under GDPR or CCPA) will be detailed here once
          confirmed: <span className="italic">[placeholder]</span>.
        </p>
      </LegalSection>

      <LegalSection heading="11. Children's Privacy">
        <p>
          The Service is not directed at children under the age of{" "}
          <span className="italic">[minimum age — placeholder]</span>, and we
          do not knowingly collect personal information from children under
          that age. If you believe a child has provided information to the
          Service, please contact us so it can be removed.
        </p>
      </LegalSection>

      <LegalSection heading="12. Changes to the Privacy Policy">
        <p>
          We may update this Privacy Policy from time to time. Material
          changes will be reflected by updating the &quot;Last updated&quot;
          date at the top of this page. We encourage you to review this page
          periodically.
        </p>
      </LegalSection>

      <LegalSection heading="13. Contact Information">
        <p>
          Questions about this Privacy Policy, or requests relating to your
          information, can be directed to:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Company: <span className="italic">[Company Name — placeholder]</span></li>
          <li>Address: <span className="italic">[Legal Address — placeholder]</span></li>
          <li>Email: <span className="italic">[Contact Email — placeholder]</span></li>
        </ul>
      </LegalSection>
    </LegalPage>
  );
}

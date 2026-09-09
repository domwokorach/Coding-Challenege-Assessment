import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Terms and Conditions — Software Engineer Programme",
  description: "Terms and Conditions for the Software Engineer Programme coding assessment platform.",
};

const LAST_UPDATED = "September 9, 2026";

export default function TermsPage() {
  return (
    <LegalPage title="Terms and Conditions" lastUpdated={LAST_UPDATED}>
      <p className="rounded-md border border-amber-300/60 bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
        This document is a template and does not constitute finalized legal
        advice. Sections marked with{" "}
        <span className="font-semibold">[placeholder]</span> must be completed
        and reviewed by qualified legal counsel before this document is relied
        upon or published as binding terms.
      </p>

      <LegalSection heading="1. Acceptance of Terms">
        <p>
          By accessing or using the Software Engineer Programme coding
          assessment platform (the &quot;Service&quot;), operated by{" "}
          <span className="italic">[Company Name — placeholder]</span>, you
          agree to be bound by these Terms and Conditions (&quot;Terms&quot;).
          If you do not agree to these Terms, do not access or use the
          Service.
        </p>
      </LegalSection>

      <LegalSection heading="2. User Eligibility">
        <p>
          The Service is intended for individuals participating in coding
          challenges and assessments for learning or evaluation purposes. By
          using the Service you represent that you have the legal capacity to
          agree to these Terms in your jurisdiction. Any minimum age
          requirement will be set out here:{" "}
          <span className="italic">[minimum age — placeholder]</span>.
        </p>
      </LegalSection>

      <LegalSection heading="3. Candidate Accounts">
        <p>
          The Service does not currently require you to register an account,
          sign in, or provide a password. Progress and assessment data are
          associated with a single shared session rather than an
          individually authenticated account. Where you are asked to enter
          your name (for example, to generate a certificate), you are
          responsible for the accuracy of the information you provide.
        </p>
        <p>
          If account registration or authentication is introduced in the
          future, this section will be updated to describe account creation,
          credentials, and your related responsibilities.
        </p>
      </LegalSection>

      <LegalSection heading="4. Assessment Rules">
        <p>
          Coding challenges and assessments must be completed honestly and
          using your own work. You agree not to submit solutions that you did
          not personally write, and to complete assessments within the
          Service&apos;s intended workflow (for example, using the provided
          code editor and test runner).
        </p>
      </LegalSection>

      <LegalSection heading="5. Prohibited Conduct">
        <p>You agree not to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Attempt to circumvent, disable, or interfere with any part of the Service, including assessment integrity features;</li>
          <li>Misrepresent your identity or the authorship of submitted work;</li>
          <li>Use the Service to distribute unlawful, harmful, or infringing content;</li>
          <li>Attempt to gain unauthorized access to the Service, its infrastructure, or other users&apos; data.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="6. Anti-Cheating and Assessment Monitoring">
        <p>
          While an assessment is in progress, the Service applies client-side
          deterrents intended to discourage academic dishonesty. Specifically,
          the assessment page:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Detects when the browser tab or window loses and regains focus (for example, switching tabs or applications) and displays a warning;</li>
          <li>Disables copying or cutting content from the assessment page and displays a warning;</li>
          <li>Disables the right-click context menu on the assessment page and displays a warning;</li>
          <li>Attempts to detect use of the Print Screen key, where the browser exposes this to the page, and displays a warning.</li>
        </ul>
        <p>
          These measures operate only within your browser during an active
          assessment session. They cannot detect or prevent activity outside
          the browser, such as a second device, an external screen recording
          tool, or an operating-system-level screenshot. Warning counts are
          shown to you during the session so you are aware of flagged
          activity; whether and how such counts are stored, reviewed, or
          acted upon beyond the current session will be described here as
          that functionality is finalized:{" "}
          <span className="italic">[placeholder]</span>.
        </p>
      </LegalSection>

      <LegalSection heading="7. Intellectual Property">
        <p>
          The Service, including its challenges, content, branding, and
          underlying software, is the property of{" "}
          <span className="italic">[Company Name — placeholder]</span> or its
          licensors and is protected by applicable intellectual property
          laws. Code you write to complete a challenge remains yours; you
          grant no ownership rights in it to us by submitting it for
          evaluation within the Service.
        </p>
      </LegalSection>

      <LegalSection heading="8. Assessment Results and Certificates">
        <p>
          Upon completing all challenges in the programme, the Service may
          generate a certificate reflecting the name you provided and the
          completion date. Certificates are issued for informational purposes
          and are subject to an expiry period noted on the certificate
          itself. We do not guarantee that a certificate will be recognized
          by any third party, employer, or institution.
        </p>
      </LegalSection>

      <LegalSection heading="9. Account Suspension or Termination">
        <p>
          As the Service does not currently use individual accounts, access
          may instead be restricted at the network or session level where
          conduct violates these Terms. If account-based access is introduced
          in the future, this section will describe the grounds and process
          for suspension or termination of individual accounts.
        </p>
      </LegalSection>

      <LegalSection heading="10. Service Availability">
        <p>
          We aim to keep the Service available but do not guarantee
          uninterrupted or error-free operation. The Service may be
          unavailable at times due to maintenance, updates, or factors
          outside our control. We are not liable for loss of progress data
          resulting from such interruptions, though we take reasonable steps
          to persist your progress as you work.
        </p>
      </LegalSection>

      <LegalSection heading="11. Limitation of Liability">
        <p>
          To the fullest extent permitted by applicable law, {" "}
          <span className="italic">[Company Name — placeholder]</span> shall
          not be liable for any indirect, incidental, special, or
          consequential damages arising out of or related to your use of the
          Service. The Service is provided &quot;as is&quot; without
          warranties of any kind, express or implied.
        </p>
      </LegalSection>

      <LegalSection heading="12. Changes to the Terms">
        <p>
          We may update these Terms from time to time. Material changes will
          be reflected by updating the &quot;Last updated&quot; date at the
          top of this page. Continued use of the Service after changes take
          effect constitutes acceptance of the revised Terms.
        </p>
      </LegalSection>

      <LegalSection heading="13. Contact Information">
        <p>
          Questions about these Terms can be directed to:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Company: <span className="italic">[Company Name — placeholder]</span></li>
          <li>Address: <span className="italic">[Legal Address — placeholder]</span></li>
          <li>Email: <span className="italic">[Contact Email — placeholder]</span></li>
          <li>Governing Jurisdiction: <span className="italic">[Jurisdiction — placeholder]</span></li>
        </ul>
      </LegalSection>
    </LegalPage>
  );
}

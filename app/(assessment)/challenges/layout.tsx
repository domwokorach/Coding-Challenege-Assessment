import { ChallengeProgressProvider } from "@/components/assessment/challenge-progress-provider";

// Wraps `/challenges` and every `/challenges/[slug]`. Layouts persist across
// navigations between sibling dynamic-segment pages (unlike the page itself,
// which remounts on every slug change) — see ChallengeProgressProvider for
// why that matters here.
export default function ChallengesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ChallengeProgressProvider>{children}</ChallengeProgressProvider>;
}

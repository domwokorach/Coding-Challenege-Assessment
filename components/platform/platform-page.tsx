import Link from "next/link";
import {
  Braces,
  Gauge,
  ShieldCheck,
  Sparkles,
  BarChart3,
  Award,
  FileCheck2,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { PageContainer } from "@/components/layout/page-container";
import { FeatureCard } from "@/components/platform/feature-card";
import { CtaSection } from "@/components/platform/cta-section";
import { PlatformShowcase } from "@/components/platform/platform-showcase";
import { SkillsIntelligenceSection } from "@/components/platform/skills-intelligence";

/**
 * The Platform marketing page's body — shared between `/` (the app's
 * default landing page) and `/platform`, so both routes render identical
 * content without one redirecting to the other.
 */
export function PlatformPageContent() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border/60 py-20 sm:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,var(--color-primary)_0%,transparent_45%)] opacity-[0.06]"
          />
          <PageContainer className="relative flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="size-3.5" aria-hidden />
              Engineering assessments, reimagined
            </span>
            <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
              Software engineering assessments, built differently.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Candidates complete structured programming challenges in a real
              coding environment, and every submission is measured against
              clear, repeatable assessment results — correctness,
              performance, and code quality, all in one place.
            </p>

            <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:max-w-xl sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
                nativeButton={false}
                render={<Link href="/login" />}
              >
                Sign in Account
              </Button>
              <Button
                size="lg"
                className="w-full sm:w-auto"
                nativeButton={false}
                render={<Link href="/demo" />}
              >
                Test a Demo
              </Button>
            </div>
          </PageContainer>
        </section>

        <section className="py-20 sm:py-24">
          <PageContainer>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                See how the platform works
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
                Switch between the core surfaces candidates and reviewers use
                every day.
              </p>
            </div>

            <div className="mt-12">
              <PlatformShowcase />
            </div>
          </PageContainer>
        </section>

        <SkillsIntelligenceSection />

        <section className="border-t border-border/60 bg-muted/20 py-20 sm:py-24">
          <PageContainer>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Everything you need to run a fair, structured assessment
              </h2>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <FeatureCard
                icon={Braces}
                title="Real coding environment"
                description="Candidates write and run code in a familiar editor with live test execution, not a text box."
              />
              <FeatureCard
                icon={Gauge}
                title="Automated CodeCheck"
                description="Every submission is scored on correctness, performance, and code quality the moment it's run."
              />
              <FeatureCard
                icon={BarChart3}
                title="Clear task results"
                description="A structured summary shows exactly which requirements passed, failed, or were partially met."
              />
              <FeatureCard
                icon={ShieldCheck}
                title="Consistent scoring"
                description="The same rubric is applied to every candidate, removing guesswork from technical screening."
              />
              <FeatureCard
                icon={Timer}
                title="Time-boxed sessions"
                description="Assessments run on a clear timer with autosave, so nothing is lost mid-challenge."
              />
              <FeatureCard
                icon={FileCheck2}
                title="Task library"
                description="Pick from a growing library of language-agnostic challenges, or bring your own."
              />
              <FeatureCard
                icon={Award}
                title="Verifiable certificates"
                description="Completed programmes issue a certificate with a public verification state."
              />
              <FeatureCard
                icon={Sparkles}
                title="Built for hiring & learning"
                description="Use the same platform for technical screening or structured skills development."
              />
            </div>
          </PageContainer>
        </section>

        <section className="py-20 sm:py-24">
          <PageContainer>
            <CtaSection
              title="Ready to see it in action?"
              description="Start a structured coding assessment and get measurable results in minutes."
              ctaLabel="Start an assessment"
              ctaHref="/register"
            />
          </PageContainer>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

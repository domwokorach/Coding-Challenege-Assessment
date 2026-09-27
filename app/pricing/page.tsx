import type { Metadata } from "next";
import { HelpCircle } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageContainer } from "@/components/page-container";
import { PricingPlans } from "@/components/pricing-plans";

export const metadata: Metadata = {
  title: "Pricing — Software Engineer Programme",
  description:
    "Simple plans for engineering assessment — choose the setup that matches your hiring, learning, or technical evaluation workflow.",
};

const faqs = [
  {
    question: "Can I change plans later?",
    answer:
      "Yes. You can move between Starter and Professional at any time, and your task history carries over.",
  },
  {
    question: "What counts as an assessment?",
    answer:
      "Each completed coding session that produces a CodeCheck score and a task result counts as one assessment.",
  },
  {
    question: "Do certificates expire?",
    answer:
      "No. Certificates remain verifiable indefinitely, unless an organisation on a Custom plan requests re-certification.",
  },
];

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b border-border/60 py-20 sm:py-28">
          <PageContainer className="flex flex-col items-center text-center">
            <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
              Simple plans for engineering assessment
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Choose the assessment setup that matches your hiring, learning,
              or technical evaluation workflow.
            </p>
          </PageContainer>
        </section>

        <section className="py-16 sm:py-20">
          <PageContainer>
            <PricingPlans />
          </PageContainer>
        </section>

        <section className="border-t border-border/60 bg-muted/20 py-20 sm:py-24">
          <PageContainer>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Frequently asked questions
              </h2>
            </div>

            <div className="mx-auto mt-10 flex max-w-2xl flex-col gap-4">
              {faqs.map((faq) => (
                <div
                  key={faq.question}
                  className="rounded-3xl border border-border/60 bg-card p-6 ring-1 ring-foreground/5 dark:ring-foreground/10"
                >
                  <div className="flex items-start gap-3">
                    <HelpCircle
                      className="mt-0.5 size-4 shrink-0 text-primary"
                      aria-hidden
                    />
                    <div>
                      <h3 className="text-sm font-semibold">
                        {faq.question}
                      </h3>
                      <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </PageContainer>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

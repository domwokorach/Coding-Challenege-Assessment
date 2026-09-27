import type { Metadata } from "next";
import {
  ClipboardList,
  Code2,
  LifeBuoy,
  Building2,
  Users,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { PageContainer } from "@/components/layout/page-container";
import { Card, CardContent } from "@/components/ui/card";
import { ContactForm } from "@/components/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact Us — Software Engineer Programme",
  description:
    "Talk to us about assessment setup, custom challenges, team access, and enterprise requirements.",
};

const helpItems = [
  { icon: ClipboardList, label: "Assessment setup" },
  { icon: Code2, label: "Custom coding challenges" },
  { icon: Users, label: "Team access" },
  { icon: LifeBuoy, label: "Technical support" },
  { icon: Building2, label: "Enterprise requirements" },
];

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1 py-16 sm:py-24">
        <PageContainer>
          <div className="mx-auto max-w-2xl text-center md:mx-0 md:max-w-none md:text-left">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Talk to us about your assessment needs
            </h1>
          </div>

          <div className="mt-14 grid gap-10 md:grid-cols-2 md:items-start lg:gap-16">
            <div className="flex flex-col gap-8">
              <div>
                <h2 className="text-lg font-semibold">
                  Software Engineer Programme
                </h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  We help engineering teams and learners run structured,
                  measurable coding assessments — from a single screening
                  task to a full enterprise assessment programme. Tell us
                  what you&apos;re trying to achieve and we&apos;ll point you
                  in the right direction.
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  What we can help with
                </p>
                <ul className="mt-4 flex flex-col gap-3">
                  {helpItems.map(({ icon: Icon, label }) => (
                    <li key={label} className="flex items-center gap-3 text-sm">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="size-4" aria-hidden />
                      </span>
                      {label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Card className="w-full">
              <CardContent>
                <ContactForm />
              </CardContent>
            </Card>
          </div>
        </PageContainer>
      </main>

      <SiteFooter />
    </div>
  );
}

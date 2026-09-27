import type { Metadata } from "next";
import { PlatformPageContent } from "@/components/platform/platform-page";

export const metadata: Metadata = {
  title: "Platform — Software Engineer Programme",
  description:
    "Structured programming challenges with measurable, automated assessment results.",
};

export default function PlatformPage() {
  return <PlatformPageContent />;
}

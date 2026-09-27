"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PlatformPageContent } from "@/components/platform-page";
import { toast } from "@/components/ui/toast";

function AccountDeletedNotice() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("accountDeleted") === "1") {
      toast.add({
        title: "Account deleted",
        description: "Your account has been deleted.",
        type: "success",
      });
    }
    // Only ever check once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

// The site's default landing page. Renders the same content as /platform
// (rather than redirecting there) so the URL bar stays on "/", and does not
// gate on authentication — Platform, Pricing, Login, and Contact Us are all
// public pages. Only actual protected functionality (starting an
// assessment, the dashboard, account settings, etc.) requires auth, enforced
// by proxy.ts and each protected page's own server-side check.
export default function RootPage() {
  return (
    <>
      <Suspense>
        <AccountDeletedNotice />
      </Suspense>
      <PlatformPageContent />
    </>
  );
}

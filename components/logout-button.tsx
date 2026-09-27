"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Logout control shared by the coding-assessment pages. Uses the project's
 * existing session-cookie auth (POST /api/auth/logout clears it server-side)
 * — the same mechanism as components/account-settings.tsx's LogoutCard —
 * then redirects. router.refresh() re-runs proxy.ts's auth check so
 * server-rendered/protected data can't linger after the cookie is cleared.
 */
export function LogoutButton({
  redirectTo = "/",
  className,
}: {
  redirectTo?: string;
  className?: string;
}) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push(redirectTo);
      router.refresh();
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={loggingOut}
      onClick={() => void handleLogout()}
      aria-label={loggingOut ? "Logging out" : "Logout"}
      className={cn(
        "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800",
        className
      )}
    >
      <LogOut className="size-3.5" aria-hidden />
      {loggingOut ? "Logging out…" : "Logout"}
    </Button>
  );
}

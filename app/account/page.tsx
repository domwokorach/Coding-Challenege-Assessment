import { redirect } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { users } from "@/lib/schema";
import { getAuthenticatedUserId } from "@/lib/auth";
import { AccountSettings } from "@/components/account-settings";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const userId = await getAuthenticatedUserId();
  if (!userId) redirect("/login?next=/account");

  const db = getDb();
  const rows = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const user = rows[0];
  if (!user) redirect("/login?next=/account");

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-zinc-200 bg-white px-4 py-3 sm:px-6 dark:border-zinc-800 dark:bg-zinc-950">
        <Link
          href="/"
          aria-label="Software Engineer Programme home"
          className="min-w-0 truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100"
        >
          Software Engineer Programme
        </Link>
        <Link
          href="/programme"
          className="shrink-0 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <span className="sm:hidden">Programme</span>
          <span className="hidden sm:inline">Return to Software Engineer Programme</span>
        </Link>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-10 sm:px-6 sm:py-12">
        <h1 className="mb-6 text-xl font-bold">Account Settings</h1>
        <AccountSettings email={user.email} />
      </main>
    </div>
  );
}

import Link from "next/link";

export function LegalPage({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-zinc-200 bg-white px-4 py-3 sm:px-6 dark:border-zinc-800 dark:bg-zinc-950">
        <Link
          href="/"
          aria-label="Software Engineer Programme home"
          className="min-w-0 truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100"
        >
          Software Engineer Programme
        </Link>
        <Link
          href="/"
          className="shrink-0 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Back to App
        </Link>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">
          Last updated: {lastUpdated}
        </p>

        <div className="mt-8 flex flex-col gap-8 text-sm leading-7 text-zinc-700 dark:text-zinc-300">
          {children}
        </div>

        <div className="mt-12 border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <Link
            href="/"
            className="inline-block rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
          >
            Return to App
          </Link>
        </div>
      </main>
    </div>
  );
}

export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        {heading}
      </h2>
      <div className="mt-3 flex flex-col gap-3">{children}</div>
    </section>
  );
}

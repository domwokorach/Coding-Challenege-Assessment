import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="shrink-0 border-t border-zinc-200 bg-white px-6 py-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-2 text-center text-xs text-zinc-500 dark:text-zinc-500">
        <nav className="flex items-center gap-4">
          <Link href="/terms" className="hover:text-zinc-700 hover:underline dark:hover:text-zinc-300">
            Terms and Conditions
          </Link>
          <Link href="/privacy" className="hover:text-zinc-700 hover:underline dark:hover:text-zinc-300">
            Privacy Policy
          </Link>
        </nav>
        <p>© {new Date().getFullYear()} Software Engineer Programme. All rights reserved.</p>
      </div>
    </footer>
  );
}

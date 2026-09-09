import Link from "next/link";
import { Logo } from "@/components/logo";
import { SiteFooter } from "@/components/site-footer";

export default function WelcomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
        <div>
          <Logo size={88} className="mx-auto mb-5" />
          <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl dark:text-zinc-100">
            Welcome{" "}
            <span className="font-mono text-zinc-500 dark:text-zinc-500">
              {"Software Engineer Programme"}
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Start learning quickly with guided coding challenges designed to
            help you reach your goals step by step.
          </p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Progress from <span className="text-zinc-900 dark:text-zinc-200">Beginner Friendly</span> to{" "}
            <span className="text-zinc-900 dark:text-zinc-200">Intermediate</span> through practical
            exercises, coding challenges, and structured learning levels.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <Link
            href="/programme"
            className="rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
          >
            Start Programme
          </Link>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}

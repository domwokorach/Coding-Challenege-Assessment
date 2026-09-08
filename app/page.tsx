import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { SignInButton, SignUpButton } from "@clerk/nextjs";

export default async function WelcomePage() {
  const { userId } = await auth();
  if (userId) redirect("/programme");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-zinc-50 px-6 text-center dark:bg-zinc-950">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl dark:text-zinc-100">
          Welcome{" "}
          <span className="font-mono text-zinc-500 dark:text-zinc-500">
            {"< Coding vs Challenges />"}
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
        <SignUpButton>
          <button
            type="button"
            className="rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
          >
            Create New Account
          </button>
        </SignUpButton>

        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Already have an account?
        </p>
        <SignInButton>
          <button
            type="button"
            className="rounded-md border border-zinc-300 bg-zinc-100 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            Log In
          </button>
        </SignInButton>
      </div>

      <div className="flex w-full max-w-xs items-center gap-3 text-xs text-zinc-400 dark:text-zinc-600">
        <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
        or continue with
        <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/sign-in"
          className="rounded-md border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Continue with GitHub
        </Link>
        <Link
          href="/sign-in"
          className="rounded-md border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Continue with Google
        </Link>
      </div>
    </div>
  );
}

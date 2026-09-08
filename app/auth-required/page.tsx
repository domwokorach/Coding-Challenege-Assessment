import Link from "next/link";
import { Logo } from "@/components/logo";

export default async function AuthRequiredPage(
  props: PageProps<"/auth-required">
) {
  const { next } = await props.searchParams;
  const redirectTarget = typeof next === "string" ? next : "/programme";
  const signUpHref = `/sign-up?redirect_url=${encodeURIComponent(redirectTarget)}`;
  const signInHref = `/sign-in?redirect_url=${encodeURIComponent(redirectTarget)}`;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-50 px-6 text-center dark:bg-zinc-950">
      <div>
        <Logo size={72} className="mx-auto mb-5" />
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Sign in to start your coding assessment
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Create an account or log in to save your progress, complete coding
          challenges, and earn your certificate.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href={signUpHref}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
        >
          Create New Account
        </Link>
        <Link
          href={signInHref}
          className="rounded-md border border-zinc-300 bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
        >
          Log In
        </Link>
      </div>
    </div>
  );
}

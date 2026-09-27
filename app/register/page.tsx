import Link from "next/link";
import { CreateAccountForm } from "@/components/create-account-form";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-8">
      <Link
        href="/"
        className="text-sm font-semibold text-zinc-900 dark:text-zinc-100"
      >
        Software Engineer Programme
      </Link>

      <CreateAccountForm />
    </div>
  );
}

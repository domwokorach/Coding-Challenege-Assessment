import Link from "next/link";
import { Logo } from "@/components/logo";
import { CreateAccountForm } from "@/components/create-account-form";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-8">
      <Link href="/" aria-label="Software Engineer Programme home">
        <Logo size={48} />
      </Link>

      <CreateAccountForm />
    </div>
  );
}

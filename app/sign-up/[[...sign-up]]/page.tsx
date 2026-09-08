import { SignUp } from "@clerk/nextjs";
import { Logo } from "@/components/logo";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-zinc-50 dark:bg-zinc-950">
      <Logo size={72} />
      <SignUp />
    </div>
  );
}

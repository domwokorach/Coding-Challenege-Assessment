import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({
  size = 36,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/logo.png"
      alt="Code vs Challenges logo"
      width={size}
      height={size}
      className={cn("shrink-0 rounded-full object-contain", className)}
      style={{ width: size, height: size }}
      priority
    />
  );
}

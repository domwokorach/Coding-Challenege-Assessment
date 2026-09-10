import { cn } from "@/lib/utils";

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  delay?: number;
  colorFrom?: string;
  colorTo?: string;
  reverse?: boolean;
  initialOffset?: number;
}

export function BorderBeam({
  className,
  size = 50,
  delay = 0,
  duration = 6,
  colorFrom = "var(--color-primary)",
  colorTo = "transparent",
  reverse = false,
  initialOffset = 0,
}: BorderBeamProps) {
  return (
    <div
      className="pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]"
      aria-hidden
    >
      <div
        className={cn(
          "absolute aspect-square bg-gradient-to-l from-(--color-from) via-(--color-to) to-transparent",
          reverse ? "animate-border-beam-reverse" : "animate-border-beam",
          className
        )}
        style={
          {
            width: size,
            offsetPath: `rect(0 auto auto 0 round ${size}px)`,
            animationDuration: `${duration}s`,
            animationDelay: `${-delay}s`,
            "--color-from": colorFrom,
            "--color-to": colorTo,
            "--border-beam-offset": `${initialOffset}%`,
          } as React.CSSProperties
        }
      />
    </div>
  );
}

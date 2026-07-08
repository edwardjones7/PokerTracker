import { Spade } from "lucide-react";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-[0_0_24px_-6px_var(--primary)]",
        className ?? "size-9",
      )}
    >
      <Spade className="size-[55%]" fill="currentColor" strokeWidth={0} />
    </span>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="text-base font-semibold tracking-tight">
        PokerTracker
      </span>
    </span>
  );
}

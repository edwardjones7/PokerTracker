import { useId } from "react";
import { cn } from "@/lib/utils";

/* Same artwork as app/icon.svg, inlined so it scales with the container
   and needs no extra request. Keep the two in sync. Gradient ids are per
   instance: a shared id could resolve to a copy inside a display:none nav,
   which paints nothing. */
export function LogoMark({ className }: { className?: string }) {
  const id = useId();
  const tile = `${id}-tile`;
  const gold = `${id}-gold`;
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={cn(
        "drop-shadow-[0_0_10px_oklch(0.8_0.13_85_/_0.35)]",
        className ?? "size-9",
      )}
    >
      <defs>
        <linearGradient id={tile} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#241e15" />
          <stop offset="1" stopColor="#14110c" />
        </linearGradient>
        <linearGradient id={gold} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f0cf74" />
          <stop offset="1" stopColor="#bd8b2e" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill={`url(#${tile})`} />
      <rect
        x="1"
        y="1"
        width="62"
        height="62"
        rx="13"
        fill="none"
        stroke="#e8c05f"
        strokeOpacity="0.35"
        strokeWidth="2"
      />
      <path
        fill={`url(#${gold})`}
        d="M32 11
           C 26 21.5, 14 26.5, 14 36.5
           C 14 44, 21 47.6, 26.5 44.6
           C 28.5 43.5, 30 41.8, 30.8 39.9
           C 29.9 46, 27.6 49.9, 24 52.6
           L 40 52.6
           C 36.4 49.9, 34.1 46, 33.2 39.9
           C 34 41.8, 35.5 43.5, 37.5 44.6
           C 43 47.6, 50 44, 50 36.5
           C 50 26.5, 38 21.5, 32 11
           Z"
      />
    </svg>
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

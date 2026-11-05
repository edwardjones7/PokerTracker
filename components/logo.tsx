import { useId } from "react";
import { SPADE_PATH } from "@/components/chips";
import { cn } from "@/lib/utils";

/* The chip logo. Small sizes use flat colors so the edge notches stay crisp;
   `detailed` adds the brass gradients for large placements. Gradient ids are
   per instance: a shared id could resolve to a copy inside a display:none nav,
   which paints nothing. Keep app/icon.svg visually in sync. */
export function LogoMark({
  className,
  detailed = false,
}: {
  className?: string;
  detailed?: boolean;
}) {
  const id = useId();
  const brassId = `${id}-brass`;
  const brass = detailed ? `url(#${brassId})` : "#D9B45F";
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={cn("shrink-0", className ?? "size-9")}
    >
      {detailed && (
        <defs>
          <linearGradient id={brassId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F2D88F" />
            <stop offset="0.55" stopColor="#D4AE5A" />
            <stop offset="1" stopColor="#9E7A32" />
          </linearGradient>
        </defs>
      )}
      <circle cx="32" cy="32" r="31" fill="#14110C" />
      <circle
        cx="32"
        cy="32"
        r="27"
        fill="none"
        stroke={brass}
        strokeWidth="8"
        strokeDasharray="10.6 10.6"
      />
      {detailed && (
        <circle cx="32" cy="32" r="31" fill="none" stroke={brass} />
      )}
      <circle
        cx="32"
        cy="32"
        r={detailed ? 20 : 21}
        fill="#0F3A2C"
        stroke={detailed ? brass : "none"}
        strokeWidth="0.9"
      />
      <path
        fill={detailed ? brass : "#E9CB7E"}
        transform={`translate(32 32) scale(${detailed ? 0.62 : 0.68}) translate(-32 -32)`}
        d={SPADE_PATH}
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="font-display text-xl font-medium">PokerTracker</span>
    </span>
  );
}

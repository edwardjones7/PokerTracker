import { cn } from "@/lib/utils";

/* Chip artwork shared by the logo, the Play tab, stakes badges and stacks.
   Colors are artwork, not theme tokens: the chip looks the same everywhere. */
export const SPADE_PATH =
  "M32 11 C26 21.5,14 26.5,14 36.5 C14 44,21 47.6,26.5 44.6 C28.5 43.5,30 41.8,30.8 39.9 C29.9 46,27.6 49.9,24 52.6 L40 52.6 C36.4 49.9,34.1 46,33.2 39.9 C34 41.8,35.5 43.5,37.5 44.6 C43 47.6,50 44,50 36.5 C50 26.5,38 21.5,32 11 Z";

const INK = "#14110C";
const BRASS = "#D9B45F";
const BRASS_LIGHT = "#E9CB7E";
const FELT = "#0F3A2C";
const IVORY = "#F3EDDD";

/** Gold version of the logo, used as the raised Play tab. */
export function PlayChip({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <circle cx="32" cy="32" r="32" fill="var(--background)" />
      <circle cx="32" cy="32" r="29" fill={BRASS} />
      <circle
        cx="32"
        cy="32"
        r="25"
        fill="none"
        stroke={INK}
        strokeWidth="7.5"
        strokeDasharray="9.8 9.8"
      />
      <circle
        cx="32"
        cy="32"
        r="18.5"
        fill={BRASS_LIGHT}
        stroke={INK}
        strokeWidth="1.2"
      />
      <path
        fill={INK}
        transform="translate(32 32) scale(.58) translate(-32 -32)"
        d={SPADE_PATH}
      />
    </svg>
  );
}

/** Blinds on a small chip. Long labels (5¢/10¢) split over two lines. */
export function StakesChip({
  stakes,
  className,
}: {
  stakes: string; // formatStakes() output, e.g. "$1/$2"
  className?: string;
}) {
  const label = stakes.replaceAll("$", "");
  const long = label.length > 4;
  return (
    <span
      className={cn(
        "relative flex size-12 shrink-0 items-center justify-center",
        className,
      )}
    >
      <svg
        viewBox="0 0 64 64"
        aria-hidden="true"
        className="absolute inset-0 size-full"
      >
        <circle cx="32" cy="32" r="31" fill={INK} />
        <circle
          cx="32"
          cy="32"
          r="27"
          fill="none"
          stroke={BRASS}
          strokeWidth="8"
          strokeDasharray="10.6 10.6"
        />
        <circle cx="32" cy="32" r="21" fill={FELT} />
      </svg>
      <span
        className={cn(
          "relative text-center font-semibold text-[#F2D88F]",
          long ? "text-[9px] leading-[1.05]" : "text-xs",
        )}
      >
        {long
          ? label.split("/").map((blind) => (
              <span key={blind} className="block">
                {blind}
              </span>
            ))
          : label}
      </span>
    </span>
  );
}

const LAYER_GAP = 14;
// Bottom to top; every third chip is green so the stack reads as real chips.
const layerColors = (i: number) =>
  i % 3 === 1
    ? { side: FELT, top: "#12463A", edge: IVORY }
    : { side: INK, top: "#1B1711", edge: BRASS };

/** Side-on stack of chips. Decorative: the real numbers sit beside it. */
export function ChipStack({
  layers = 5,
  className,
}: {
  layers?: number;
  className?: string;
}) {
  const height = 20 + (layers - 1) * LAYER_GAP + 26;
  const topY = 20;
  return (
    <svg
      viewBox={`0 0 96 ${height}`}
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      {Array.from({ length: layers }, (_, i) => {
        const y = topY + (layers - 1 - i) * LAYER_GAP;
        const { side, top, edge } = layerColors(i);
        return (
          <g key={i}>
            <path d={`M8 ${y} v12 a40 12 0 0 0 80 0 v-12 z`} fill={side} />
            <path
              d={`M8 ${y + 12} a40 12 0 0 0 80 0`}
              fill="none"
              stroke={edge}
              strokeWidth="9"
              strokeDasharray="9 9"
            />
            <ellipse
              cx="48"
              cy={y}
              rx="40"
              ry="12"
              fill={top}
              stroke={edge}
              strokeOpacity="0.7"
            />
          </g>
        );
      })}
      <ellipse
        cx="48"
        cy={topY}
        rx="26"
        ry="7.5"
        fill="none"
        stroke={BRASS_LIGHT}
      />
    </svg>
  );
}

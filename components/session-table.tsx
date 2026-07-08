import Link from "next/link";
import { formatCentsSigned, formatStakes } from "@/lib/money";
import {
  sessionProfit,
  sessionHours,
  formatHours,
  type SessionWithRebuys,
} from "@/lib/stats";
import { venueLabel } from "@/lib/venues";
import { VenueBadge } from "@/components/venue-icon";
import { LocalTime } from "@/components/local-time";
import { cn } from "@/lib/utils";

const GRID =
  "grid grid-cols-[minmax(0,1fr)_120px_90px_90px_120px] items-center gap-3";

/** Desktop sessions list — row-per-session table (cards on mobile instead). */
export function SessionTable({ sessions }: { sessions: SessionWithRebuys[] }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div
        className={cn(
          GRID,
          "border-b px-4 py-2.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase",
        )}
      >
        <span>Where</span>
        <span>When</span>
        <span>Stakes</span>
        <span>Time</span>
        <span className="text-right">Result</span>
      </div>
      <div className="divide-y divide-border/60">
        {sessions.map((s) => {
          const meta = venueLabel(s.venue);
          const profit = sessionProfit(s);
          const hours = sessionHours(s);
          return (
            <Link
              key={s.id}
              href={`/sessions/${s.id}`}
              className={cn(GRID, "px-4 py-3 transition-colors hover:bg-accent/60")}
            >
              <span className="flex min-w-0 items-center gap-3">
                <VenueBadge venue={s.venue} className="size-8 rounded-md" />
                <span className="truncate font-medium">
                  {s.location || meta.label}
                </span>
              </span>
              <span className="text-sm text-muted-foreground">
                <LocalTime date={s.startedAt} format="date" />
              </span>
              <span className="text-sm text-muted-foreground tabular-nums">
                {formatStakes(s.stakesSmall, s.stakesBig)}
              </span>
              <span className="text-sm text-muted-foreground tabular-nums">
                {formatHours(hours)}
              </span>
              <span
                className={cn(
                  "text-right font-semibold tabular-nums",
                  profit >= 0 ? "text-profit" : "text-loss",
                )}
              >
                {formatCentsSigned(profit)}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

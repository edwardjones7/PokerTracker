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

export function SessionCard({ session }: { session: SessionWithRebuys }) {
  const meta = venueLabel(session.venue);
  const profit = sessionProfit(session);
  const hours = sessionHours(session);
  return (
    <Link
      href={`/sessions/${session.id}`}
      className="flex items-center gap-3.5 rounded-xl border bg-card p-4 transition-colors hover:border-primary/25 hover:bg-accent/60"
    >
      <VenueBadge venue={session.venue} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">
          {session.location || meta.label}
        </p>
        <p className="text-sm text-muted-foreground">
          <LocalTime date={session.startedAt} format="date" /> ·{" "}
          {formatStakes(session.stakesSmall, session.stakesBig)} ·{" "}
          {formatHours(hours)}
        </p>
      </div>
      <span
        className={cn(
          "font-semibold tabular-nums",
          profit >= 0 ? "text-profit" : "text-loss",
        )}
      >
        {formatCentsSigned(profit)}
      </span>
    </Link>
  );
}

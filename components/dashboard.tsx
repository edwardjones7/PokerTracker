"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Spade } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  aggregateStats,
  cumulativeProfitSeries,
  formatHours,
  type SessionWithRebuys,
} from "@/lib/stats";
import { formatCents, formatCentsSigned } from "@/lib/money";
import { ProfitChart } from "@/components/profit-chart";
import { SessionCard } from "@/components/session-card";
import { VenueIcon } from "@/components/venue-icon";
import type { Venue } from "@/db/schema";

type VenueFilter = "all" | Venue;
type RangeFilter = "all" | "30d" | "90d" | "1y";

type Balances = { live: number; online: number; total: number };

const VENUE_FILTERS: { value: VenueFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "casino", label: "Casino" },
  { value: "home", label: "Home" },
  { value: "online", label: "Online" },
];

const RANGE_FILTERS: { value: RangeFilter; label: string; days?: number }[] = [
  { value: "all", label: "All time" },
  { value: "30d", label: "30d", days: 30 },
  { value: "90d", label: "90d", days: 90 },
  { value: "1y", label: "1y", days: 365 },
];

function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
        selected
          ? "border-primary/50 bg-primary/10 font-medium text-foreground"
          : "text-muted-foreground hover:bg-accent",
      )}
    >
      {children}
    </button>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card p-3.5">
      <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}

export function Dashboard({
  sessions,
  balances,
}: {
  sessions: SessionWithRebuys[];
  balances: Balances;
}) {
  const [venue, setVenue] = useState<VenueFilter>("all");
  const [range, setRange] = useState<RangeFilter>("all");

  const filtered = useMemo(() => {
    const days = RANGE_FILTERS.find((r) => r.value === range)?.days;
    const cutoff = days ? Date.now() - days * 86_400_000 : null;
    return sessions.filter(
      (s) =>
        s.status === "completed" &&
        (venue === "all" || s.venue === venue) &&
        (cutoff === null || s.startedAt.getTime() >= cutoff),
    );
  }, [sessions, venue, range]);

  const stats = useMemo(() => aggregateStats(filtered), [filtered]);
  const series = useMemo(() => cumulativeProfitSeries(filtered), [filtered]);
  const recent = filtered.slice(0, 6);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {VENUE_FILTERS.map((f) => (
          <Chip
            key={f.value}
            selected={venue === f.value}
            onClick={() => setVenue(f.value)}
          >
            {f.value !== "all" && (
              <VenueIcon venue={f.value} className="size-3.5" />
            )}
            {f.label}
          </Chip>
        ))}
        <span className="mx-1 w-px shrink-0 bg-border" />
        {RANGE_FILTERS.map((f) => (
          <Chip
            key={f.value}
            selected={range === f.value}
            onClick={() => setRange(f.value)}
          >
            {f.label}
          </Chip>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed p-12 text-center">
          <Spade className="size-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            No completed sessions here yet. Play one and your stats show up.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border bg-card p-5 lg:col-span-2">
              <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
                Profit
              </p>
              <p
                className={cn(
                  "mt-0.5 text-3xl font-bold tracking-tight tabular-nums lg:text-4xl",
                  stats.totalProfit >= 0 ? "text-profit" : "text-loss",
                )}
              >
                {formatCentsSigned(stats.totalProfit)}
              </p>
              {series.length >= 2 && (
                <div className="mt-4 -mx-2">
                  <ProfitChart data={series} />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <Link
                href="/bankroll"
                className="group flex flex-1 flex-col rounded-2xl border bg-gradient-to-b from-primary/10 to-card p-5 transition-colors hover:border-primary/30"
              >
                <p className="flex items-center justify-between text-[11px] tracking-wide text-muted-foreground uppercase">
                  Bankroll
                  <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </p>
                <p className="mt-0.5 text-3xl font-bold tracking-tight tabular-nums">
                  {formatCents(balances.total)}
                </p>
                <div className="mt-auto flex gap-6 pt-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Live</p>
                    <p className="font-semibold tabular-nums">
                      {formatCents(balances.live)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Online</p>
                    <p className="font-semibold tabular-nums">
                      {formatCents(balances.online)}
                    </p>
                  </div>
                </div>
              </Link>
              <div className="grid grid-cols-2 gap-4">
                <StatTile
                  label="Best"
                  value={
                    stats.bestSession
                      ? formatCentsSigned(
                          (stats.bestSession.cashOut ?? 0) -
                            stats.bestSession.buyIn -
                            stats.bestSession.rebuyTotal,
                        )
                      : "—"
                  }
                />
                <StatTile
                  label="Win rate"
                  value={
                    stats.winningSessionRate !== null
                      ? `${Math.round(stats.winningSessionRate * 100)}%`
                      : "—"
                  }
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <StatTile
              label="Avg / session"
              value={
                stats.sessionCount > 0
                  ? formatCentsSigned(
                      Math.round(stats.totalProfit / stats.sessionCount),
                    )
                  : "—"
              }
            />
            <StatTile label="Hours" value={formatHours(stats.totalHours)} />
            <StatTile label="Sessions" value={String(stats.sessionCount)} />
          </div>

          <div className="mt-2 flex items-center justify-between">
            <h2 className="text-sm font-medium">Recent sessions</h2>
            <Link
              href="/sessions"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              See all
            </Link>
          </div>
          <div className="grid gap-2 lg:grid-cols-2">
            {recent.map((s) => (
              <SessionCard key={s.id} session={s} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

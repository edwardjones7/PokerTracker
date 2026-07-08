"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  aggregateStats,
  cumulativeProfitSeries,
  formatHours,
  type SessionWithRebuys,
} from "@/lib/stats";
import { formatCentsSigned } from "@/lib/money";
import { ProfitChart } from "@/components/profit-chart";
import { SessionCard } from "@/components/session-card";
import type { Venue } from "@/db/schema";

type VenueFilter = "all" | Venue;
type RangeFilter = "all" | "30d" | "90d" | "1y";

const VENUE_FILTERS: { value: VenueFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "casino", label: "🎰 Casino" },
  { value: "home", label: "🏠 Home" },
  { value: "online", label: "💻 Online" },
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
        "shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors",
        selected
          ? "border-primary bg-primary/10 font-medium"
          : "text-muted-foreground hover:bg-accent",
      )}
    >
      {children}
    </button>
  );
}

export function Dashboard({ sessions }: { sessions: SessionWithRebuys[] }) {
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
  const recent = filtered.slice(0, 5);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {VENUE_FILTERS.map((f) => (
          <Chip
            key={f.value}
            selected={venue === f.value}
            onClick={() => setVenue(f.value)}
          >
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
        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          No completed sessions here yet. Play one and your stats show up.
        </div>
      ) : (
        <>
          <div className="rounded-2xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">Profit</p>
            <p
              className={cn(
                "text-3xl font-bold tabular-nums",
                stats.totalProfit >= 0 ? "text-emerald-500" : "text-red-500",
              )}
            >
              {formatCentsSigned(stats.totalProfit)}
            </p>
            {series.length >= 2 && (
              <div className="mt-3 -mx-2">
                <ProfitChart data={series} />
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(
              [
                [
                  "$/hr",
                  stats.hourlyRate !== null
                    ? formatCentsSigned(Math.round(stats.hourlyRate))
                    : "—",
                ],
                [
                  "bb/hr",
                  stats.bbPerHour !== null ? stats.bbPerHour.toFixed(1) : "—",
                ],
                ["Hours", formatHours(stats.totalHours)],
                ["Sessions", String(stats.sessionCount)],
                [
                  "Win rate",
                  stats.winningSessionRate !== null
                    ? `${Math.round(stats.winningSessionRate * 100)}%`
                    : "—",
                ],
                [
                  "Best",
                  stats.bestSession
                    ? formatCentsSigned(
                        (stats.bestSession.cashOut ?? 0) -
                          stats.bestSession.buyIn -
                          stats.bestSession.rebuyTotal,
                      )
                    : "—",
                ],
              ] as [string, string][]
            ).map(([label, value]) => (
              <div key={label} className="rounded-xl border bg-card p-3">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-semibold tabular-nums">{value}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">Recent sessions</h2>
            <Link
              href="/sessions"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              See all
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {recent.map((s) => (
              <SessionCard key={s.id} session={s} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

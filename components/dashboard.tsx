"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Play, Plus, Spade } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  aggregateStats,
  cumulativeProfitSeries,
  formatHours,
  type SessionWithRebuys,
} from "@/lib/stats";
import { formatCents, formatCentsSigned } from "@/lib/money";
import { AnimatedNumber } from "@/components/animated-number";
import { ChipStack } from "@/components/chips";
import { ProfitChart } from "@/components/profit-chart";
import { Button } from "@/components/ui/button";
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
          ? "border-brass bg-accent font-medium text-foreground"
          : "text-muted-foreground hover:bg-accent",
      )}
    >
      {children}
    </button>
  );
}

const CHIP_ROW =
  "flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

const formatPercent = (value: number) => `${value}%`;

function StatTile({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="surface rounded-xl border bg-card p-3.5">
      <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function BankrollCard({ balances }: { balances: Balances }) {
  return (
    <Link
      href="/bankroll"
      className="surface flex flex-1 items-center justify-between gap-3 rounded-2xl border bg-card p-5 transition-colors hover:border-brass-rim"
    >
      <div className="min-w-0">
        <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
          Bankroll
        </p>
        <p className="mt-1 font-display numerals text-3xl font-semibold tabular-nums">
          {formatCents(balances.total)}
        </p>
        <div className="mt-3 flex gap-6 text-sm">
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
      </div>
      {/* The lg column is too narrow for big balances plus the stack. */}
      <ChipStack className="w-20 lg:hidden xl:block" />
    </Link>
  );
}

/** First-run dashboard: nothing to filter yet, so lead with what to do next. */
function FirstRun({
  balances,
  hasActiveSession,
}: {
  balances: Balances;
  hasActiveSession: boolean;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="surface flex flex-col items-center gap-4 rounded-2xl border bg-card p-8 text-center lg:col-span-2">
        <Spade className="size-8 text-primary" />
        <div>
          <h2 className="font-display text-2xl font-medium">
            Log your first session
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your profit graph and stats start here.
          </p>
        </div>
        <div className="flex w-full flex-col justify-center gap-2 sm:flex-row">
          {!hasActiveSession && (
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href="/session/live" />}
            >
              <Play className="size-4" /> Start session
            </Button>
          )}
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            render={<Link href="/sessions/new" />}
          >
            <Plus className="size-4" /> Add past session
          </Button>
        </div>
      </div>
      <BankrollCard balances={balances} />
    </div>
  );
}

export function Dashboard({
  sessions,
  balances,
  hasActiveSession,
}: {
  sessions: SessionWithRebuys[];
  balances: Balances;
  hasActiveSession: boolean;
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

  if (!sessions.some((s) => s.status === "completed")) {
    return <FirstRun balances={balances} hasActiveSession={hasActiveSession} />;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Two rows on phones so no filter hides off-screen; one row from sm. */}
      <div className="flex flex-col gap-1 sm:flex-row sm:gap-2">
        <div className={CHIP_ROW}>
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
        </div>
        <span className="mx-1 mb-1 hidden w-px shrink-0 bg-border sm:block" />
        <div className={CHIP_ROW}>
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
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed p-12 text-center">
          <Spade className="size-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            No sessions match these filters.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setVenue("all");
              setRange("all");
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="felt brass-rim rounded-3xl p-5 lg:col-span-2 lg:p-6">
              <p className="text-xs tracking-[0.14em] text-foreground/80 uppercase">
                Profit
              </p>
              <p
                className={cn(
                  "mt-1 font-display numerals text-5xl font-semibold tabular-nums lg:text-6xl",
                  stats.totalProfit >= 0 ? "text-profit" : "text-loss",
                )}
              >
                <AnimatedNumber
                  value={stats.totalProfit}
                  format={formatCentsSigned}
                />
              </p>
              {series.length >= 2 && (
                <div className="mt-4 -mx-2">
                  <ProfitChart data={series} />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <BankrollCard balances={balances} />
              <div className="grid grid-cols-2 gap-4">
                <StatTile
                  label="Best"
                  value={
                    stats.bestSession ? (
                      <AnimatedNumber
                        value={
                          (stats.bestSession.cashOut ?? 0) -
                          stats.bestSession.buyIn -
                          stats.bestSession.rebuyTotal
                        }
                        format={formatCentsSigned}
                      />
                    ) : (
                      "—"
                    )
                  }
                />
                <StatTile
                  label="Win rate"
                  value={
                    stats.winningSessionRate !== null ? (
                      <AnimatedNumber
                        value={Math.round(stats.winningSessionRate * 100)}
                        format={formatPercent}
                      />
                    ) : (
                      "—"
                    )
                  }
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <StatTile
              label="Avg / session"
              value={
                stats.sessionCount > 0 ? (
                  <AnimatedNumber
                    value={Math.round(stats.totalProfit / stats.sessionCount)}
                    format={formatCentsSigned}
                  />
                ) : (
                  "—"
                )
              }
            />
            <StatTile label="Hours" value={formatHours(stats.totalHours)} />
            <StatTile
              label="Sessions"
              value={
                <AnimatedNumber value={stats.sessionCount} format={String} />
              }
            />
          </div>

          <div className="mt-2 flex items-center justify-between">
            <h2 className="font-display text-2xl font-medium">
              Recent sessions
            </h2>
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

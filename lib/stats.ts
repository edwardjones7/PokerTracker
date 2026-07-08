import type { Session } from "@/db/schema";

/** A completed session joined with the sum of its rebuys (cents). */
export type SessionWithRebuys = Session & { rebuyTotal: number };

export function totalInvested(s: SessionWithRebuys): number {
  return s.buyIn + s.rebuyTotal;
}

/** Profit in cents. Only meaningful for completed sessions. */
export function sessionProfit(s: SessionWithRebuys): number {
  return (s.cashOut ?? 0) - totalInvested(s);
}

export function sessionHours(s: Session): number {
  const end = s.endedAt ?? new Date();
  return Math.max((end.getTime() - s.startedAt.getTime()) / 3_600_000, 0);
}

export type AggregateStats = {
  sessionCount: number;
  totalProfit: number; // cents
  totalHours: number;
  hourlyRate: number | null; // cents per hour
  bbPerHour: number | null; // big blinds per hour, weighted by stakes per session
  winningSessionRate: number | null; // 0..1
  bestSession: SessionWithRebuys | null;
  worstSession: SessionWithRebuys | null;
};

export function aggregateStats(sessions: SessionWithRebuys[]): AggregateStats {
  const completed = sessions.filter((s) => s.status === "completed");
  const totalProfit = completed.reduce((sum, s) => sum + sessionProfit(s), 0);
  const totalHours = completed.reduce((sum, s) => sum + sessionHours(s), 0);
  // bb won per session normalized by that session's big blind, so mixed
  // stakes aggregate sensibly.
  const totalBb = completed.reduce(
    (sum, s) => sum + sessionProfit(s) / s.stakesBig,
    0,
  );
  const winners = completed.filter((s) => sessionProfit(s) > 0).length;

  let best: SessionWithRebuys | null = null;
  let worst: SessionWithRebuys | null = null;
  for (const s of completed) {
    if (!best || sessionProfit(s) > sessionProfit(best)) best = s;
    if (!worst || sessionProfit(s) < sessionProfit(worst)) worst = s;
  }

  return {
    sessionCount: completed.length,
    totalProfit,
    totalHours,
    hourlyRate: totalHours > 0 ? totalProfit / totalHours : null,
    bbPerHour: totalHours > 0 ? totalBb / totalHours : null,
    winningSessionRate: completed.length > 0 ? winners / completed.length : null,
    bestSession: best,
    worstSession: worst,
  };
}

/** Points for the cumulative profit chart, ordered by session end time. */
export function cumulativeProfitSeries(sessions: SessionWithRebuys[]) {
  const completed = sessions
    .filter((s) => s.status === "completed" && s.endedAt)
    .sort((a, b) => a.endedAt!.getTime() - b.endedAt!.getTime());
  let running = 0;
  return completed.map((s, i) => {
    running += sessionProfit(s);
    return {
      index: i + 1,
      date: s.endedAt!.toISOString(),
      profit: running,
      sessionProfit: sessionProfit(s),
      venue: s.venue,
    };
  });
}

export function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

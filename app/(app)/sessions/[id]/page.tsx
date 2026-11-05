import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBankrollBalances, getSessionWithRebuys } from "@/lib/data";
import {
  sessionProfit,
  sessionHours,
  totalInvested,
  formatHours,
} from "@/lib/stats";
import { formatCents, formatCentsSigned, formatStakes } from "@/lib/money";
import { venueLabel } from "@/lib/venues";
import { VenueBadge } from "@/components/venue-icon";
import { CashOutReveal } from "@/components/cash-out-reveal";
import { LocalTime } from "@/components/local-time";
import { DeleteSessionButton } from "@/components/delete-session-button";
import { SessionNotes } from "@/components/session-notes";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

// Under this, an hourly rate is noise (a 5-minute win reads as thousands/hr).
const MIN_HOURS_FOR_RATE = 0.25;

export default async function SessionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [{ id }, { finished }] = await Promise.all([params, searchParams]);
  const session = await getSessionWithRebuys(Number(id));
  if (!session || session.status !== "completed") notFound();

  const justFinished = finished === "1";
  const meta = venueLabel(session.venue);
  const profit = sessionProfit(session);
  const hours = sessionHours(session);

  if (justFinished) {
    const { total } = await getBankrollBalances();
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
        <CashOutReveal
          title={session.location || meta.label}
          subtitle={`${formatStakes(session.stakesSmall, session.stakesBig)} · ${formatHours(hours)}`}
          profit={profit}
          invested={totalInvested(session)}
          cashOut={session.cashOut ?? 0}
          hourly={hours >= MIN_HOURS_FOR_RATE ? Math.round(profit / hours) : null}
          bankroll={total}
        />
        <SessionNotes sessionId={session.id} notes={session.notes} autoEdit />
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            render={<Link href={`/sessions/${session.id}`} />}
          >
            View session
          </Button>
          <Button size="lg" nativeButton={false} render={<Link href="/" />}>
            Done
          </Button>
        </div>
      </div>
    );
  }

  const stats: [string, string][] = [
    ["Buy-in (total)", formatCents(totalInvested(session))],
    ["Cashed out", formatCents(session.cashOut ?? 0)],
    ["Duration", formatHours(hours)],
    ["$/hr", hours > 0 ? formatCentsSigned(Math.round(profit / hours)) : "—"],
    [
      "bb/hr",
      hours > 0 ? (profit / session.stakesBig / hours).toFixed(1) : "—",
    ],
    ["Stakes", formatStakes(session.stakesSmall, session.stakesBig)],
  ];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <div className="flex items-center justify-between gap-4 rounded-2xl border bg-card p-5 sm:p-6">
        <div className="flex min-w-0 items-center gap-3.5">
          <VenueBadge venue={session.venue} className="size-12" />
          <div className="min-w-0">
            <h1 className="truncate font-display text-2xl font-medium sm:text-3xl">
              {session.location || meta.label}
            </h1>
            <p className="text-sm text-muted-foreground">
              <LocalTime date={session.startedAt} />
            </p>
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 font-display numerals text-3xl font-semibold tabular-nums sm:text-4xl",
            profit >= 0 ? "text-profit" : "text-loss",
          )}
        >
          {formatCentsSigned(profit)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-xl border bg-card p-3.5">
            <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
              {label}
            </p>
            <p className="mt-0.5 font-semibold tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      <SessionNotes
        sessionId={session.id}
        notes={session.notes}
      />

      {session.rebuys.length > 0 && (
        <div className="rounded-2xl border bg-card p-4 sm:p-5">
          <p className="mb-2 text-sm font-medium">Rebuys</p>
          <ul className="flex flex-col divide-y divide-border/60 text-sm text-muted-foreground">
            {session.rebuys.map((r) => (
              <li key={r.id} className="flex justify-between py-1.5">
                <LocalTime date={r.createdAt} format="time" />
                <span className="tabular-nums">{formatCents(r.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href={`/sessions/${session.id}/edit`} />}
        >
          <Pencil className="size-4" /> Edit
        </Button>
        <DeleteSessionButton id={session.id} />
      </div>
    </div>
  );
}

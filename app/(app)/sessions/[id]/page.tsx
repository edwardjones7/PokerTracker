import Link from "next/link";
import { notFound } from "next/navigation";
import { PartyPopper, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSessionWithRebuys } from "@/lib/data";
import {
  sessionProfit,
  sessionHours,
  totalInvested,
  formatHours,
} from "@/lib/stats";
import { formatCents, formatCentsSigned, formatStakes } from "@/lib/money";
import { venueLabel } from "@/lib/venues";
import { VenueBadge } from "@/components/venue-icon";
import { LocalTime } from "@/components/local-time";
import { DeleteSessionButton } from "@/components/delete-session-button";
import { SessionNotes } from "@/components/session-notes";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

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
      {justFinished && (
        <div className="flex items-center gap-3 rounded-2xl border border-primary/25 bg-primary/10 p-4">
          <PartyPopper className="size-5 shrink-0 text-primary" />
          <div className="text-sm">
            <p className="font-medium">Session saved.</p>
            <p className="text-muted-foreground">
              While it&apos;s fresh — jot down how it went below.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-4 rounded-2xl border bg-card p-5 sm:p-6">
        <div className="flex min-w-0 items-center gap-3.5">
          <VenueBadge venue={session.venue} className="size-12" />
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">
              {session.location || meta.label}
            </h1>
            <p className="text-sm text-muted-foreground">
              <LocalTime date={session.startedAt} />
            </p>
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 text-2xl font-bold tabular-nums sm:text-3xl",
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
        autoEdit={justFinished}
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

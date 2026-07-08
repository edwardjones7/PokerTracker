import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSessionWithRebuys } from "@/lib/data";
import {
  sessionProfit,
  sessionHours,
  totalInvested,
  formatHours,
} from "@/lib/stats";
import {
  formatCents,
  formatCentsSigned,
  formatStakes,
} from "@/lib/money";
import { venueLabel } from "@/lib/venues";
import { LocalTime } from "@/components/local-time";
import { DeleteSessionButton } from "@/components/delete-session-button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSessionWithRebuys(Number(id));
  if (!session || session.status !== "completed") notFound();

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
      hours > 0
        ? (profit / session.stakesBig / hours).toFixed(1)
        : "—",
    ],
    ["Stakes", formatStakes(session.stakesSmall, session.stakesBig)],
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">
            {meta.emoji} {session.location || meta.label}
          </h1>
          <p className="text-sm text-muted-foreground">
            <LocalTime date={session.startedAt} />
          </p>
        </div>
        <span
          className={cn(
            "text-2xl font-bold tabular-nums",
            profit >= 0 ? "text-emerald-500" : "text-red-500",
          )}
        >
          {formatCentsSigned(profit)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-xl border bg-card p-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-semibold tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      {session.rebuys.length > 0 && (
        <div className="rounded-xl border bg-card p-4">
          <p className="mb-2 text-sm font-medium">Rebuys</p>
          <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
            {session.rebuys.map((r) => (
              <li key={r.id} className="flex justify-between">
                <LocalTime date={r.createdAt} format="time" />
                <span className="tabular-nums">{formatCents(r.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {session.notes && (
        <div className="rounded-xl border bg-card p-4">
          <p className="mb-1 text-sm font-medium">Notes</p>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
            {session.notes}
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          render={<Link href={`/sessions/${session.id}/edit`} />}
        >
          <Pencil className="size-4" /> Edit
        </Button>
        <DeleteSessionButton id={session.id} />
      </div>
    </div>
  );
}

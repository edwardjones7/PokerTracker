"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addRebuy,
  cashOutSession,
  undoRebuy,
  type ActionState,
} from "@/app/actions/sessions";
import { formatCents, formatStakes } from "@/lib/money";
import { venueLabel } from "@/lib/venues";
import { VenueBadge } from "@/components/venue-icon";
import type { Rebuy, Session } from "@/db/schema";

function useElapsed(since: Date) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (now === null) return "0:00:00";
  const total = Math.max(0, Math.floor((now - since.getTime()) / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const initialState: ActionState = { error: null };

export function LiveSession({
  session,
  rebuys,
}: {
  session: Session;
  rebuys: Rebuy[];
}) {
  const elapsed = useElapsed(session.startedAt);
  const meta = venueLabel(session.venue);
  const invested = session.buyIn + rebuys.reduce((s, r) => s + r.amount, 0);

  const [rebuyState, rebuyAction, rebuyPending] = useActionState(
    addRebuy,
    initialState,
  );
  const [cashOutState, cashOutAction, cashOutPending] = useActionState(
    cashOutSession,
    initialState,
  );
  const [showCashOut, setShowCashOut] = useState(false);
  const [, startTransition] = useTransition();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/12 via-card to-card p-6 text-center sm:p-10">
        <div className="mb-5 flex items-center justify-center gap-2">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          <span className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
            Live
          </span>
        </div>
        <p className="font-mono text-6xl font-bold tracking-tight tabular-nums sm:text-7xl">
          {elapsed}
        </p>
        <div className="mt-5 flex items-center justify-center gap-3 text-sm text-muted-foreground">
          <VenueBadge venue={session.venue} className="size-7 rounded-md" />
          <span className="font-medium text-foreground">
            {session.location || meta.label}
          </span>
          <span>·</span>
          <span>{formatStakes(session.stakesSmall, session.stakesBig)}</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          On the table{" "}
          <span className="font-semibold text-foreground tabular-nums">
            {formatCents(invested)}
          </span>
          {rebuys.length > 0 &&
            ` — buy-in ${formatCents(session.buyIn)} + ${rebuys.length} rebuy${rebuys.length > 1 ? "s" : ""}`}
        </p>
      </div>

      <div className="rounded-2xl border bg-card p-4 sm:p-5">
        <p className="mb-3 text-sm font-medium">Rebuys</p>
        {rebuys.length > 0 && (
          <ul className="mb-3 flex flex-col divide-y divide-border/60">
            {rebuys.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between py-1.5 text-sm"
              >
                <span className="tabular-nums">{formatCents(r.amount)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-muted-foreground"
                  onClick={() => startTransition(() => undoRebuy(r.id))}
                >
                  <Undo2 className="size-3.5" /> Undo
                </Button>
              </li>
            ))}
          </ul>
        )}
        <form action={rebuyAction} className="flex gap-2">
          <input type="hidden" name="sessionId" value={session.id} />
          <Input
            name="amount"
            inputMode="decimal"
            placeholder="Rebuy amount"
            required
          />
          <Button type="submit" variant="secondary" disabled={rebuyPending}>
            {rebuyPending ? "Adding…" : "+ Rebuy"}
          </Button>
        </form>
        {rebuyState.error && (
          <p className="mt-2 text-sm text-destructive">{rebuyState.error}</p>
        )}
      </div>

      {!showCashOut ? (
        <Button
          size="lg"
          className="h-12 text-base"
          onClick={() => setShowCashOut(true)}
        >
          Cash out
        </Button>
      ) : (
        <form
          action={cashOutAction}
          className="flex flex-col gap-4 rounded-2xl border bg-card p-4 sm:p-5"
        >
          <input type="hidden" name="sessionId" value={session.id} />
          <div className="flex flex-col gap-2">
            <Label htmlFor="cashOut">How much are you leaving with?</Label>
            <Input
              id="cashOut"
              name="cashOut"
              inputMode="decimal"
              placeholder="0"
              autoFocus
              required
              className="h-12 text-lg tabular-nums"
            />
            <p className="text-xs text-muted-foreground">
              Just the number — you can write up the session right after.
            </p>
          </div>
          {cashOutState.error && (
            <p className="text-sm text-destructive">{cashOutState.error}</p>
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-11 flex-1"
              onClick={() => setShowCashOut(false)}
            >
              Keep playing
            </Button>
            <Button
              type="submit"
              className="h-11 flex-1"
              disabled={cashOutPending}
            >
              {cashOutPending ? "Saving…" : "End session"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

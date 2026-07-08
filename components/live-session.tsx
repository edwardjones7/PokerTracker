"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  addRebuy,
  cashOutSession,
  undoRebuy,
  type ActionState,
} from "@/app/actions/sessions";
import { formatCents, formatStakes } from "@/lib/money";
import { venueLabel } from "@/lib/venues";
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
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">
          {meta.emoji} {session.location || meta.label} ·{" "}
          {formatStakes(session.stakesSmall, session.stakesBig)}
        </p>
        <p className="mt-2 font-mono text-5xl font-bold tabular-nums">
          {elapsed}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          In for{" "}
          <span className="font-semibold text-foreground">
            {formatCents(invested)}
          </span>
        </p>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <p className="mb-3 text-sm font-medium">Rebuys</p>
        {rebuys.length > 0 && (
          <ul className="mb-3 flex flex-col gap-2">
            {rebuys.map((r) => (
              <li key={r.id} className="flex items-center justify-between text-sm">
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
        <Button size="lg" onClick={() => setShowCashOut(true)}>
          Cash out
        </Button>
      ) : (
        <form
          action={cashOutAction}
          className="flex flex-col gap-4 rounded-xl border bg-card p-4"
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
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Session notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Table dynamics, big hands, mistakes…"
              rows={3}
            />
          </div>
          {cashOutState.error && (
            <p className="text-sm text-destructive">{cashOutState.error}</p>
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setShowCashOut(false)}
            >
              Keep playing
            </Button>
            <Button type="submit" className="flex-1" disabled={cashOutPending}>
              {cashOutPending ? "Saving…" : "End session"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

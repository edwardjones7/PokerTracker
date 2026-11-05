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
import { ChipStack } from "@/components/chips";
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
  const [panel, setPanel] = useState<"rebuy" | "cashOut" | null>(null);
  const [, startTransition] = useTransition();
  const rebuyTotal = invested - session.buyIn;

  return (
    <>
      <div aria-hidden="true" className="felt-room fixed inset-0 -z-10" />
      <div className="mx-auto flex w-full max-w-xl flex-col gap-5">
        <div className="text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75 motion-reduce:hidden" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            <span className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
              Live
            </span>
          </div>
          <h1 className="font-display text-4xl font-medium">
            {session.location || meta.label}
          </h1>
          <p className="mt-1 text-sm text-foreground/80">
            {formatStakes(session.stakesSmall, session.stakesBig)} ·{" "}
            {meta.label}
          </p>
        </div>

        <div className="mx-auto flex aspect-[34/30] w-full max-w-[340px] flex-col items-center justify-center gap-2.5 rounded-[50%] border-2 border-brass shadow-[0_0_0_7px_#120e08,0_0_0_8px_rgb(212_174_90_/_0.55),inset_0_0_44px_rgb(0_0_0_/_0.38)]">
          {/* One more chip on the table for every rebuy. */}
          <ChipStack layers={Math.min(3 + rebuys.length, 6)} className="w-20" />
          <p className="font-display numerals text-5xl leading-none font-semibold tabular-nums">
            {elapsed}
          </p>
          <p className="text-xs tracking-[0.14em] text-foreground/80 uppercase">
            At the table
          </p>
        </div>

        <dl className="grid grid-cols-3 text-center">
          <div>
            <dt className="text-xs text-foreground/80">Buy-in</dt>
            <dd className="mt-0.5 text-lg font-semibold tabular-nums">
              {formatCents(session.buyIn)}
            </dd>
          </div>
          <div className="border-x border-brass/40">
            <dt className="text-xs text-foreground/80">Rebuys</dt>
            <dd className="mt-0.5 text-lg font-semibold tabular-nums">
              {formatCents(rebuyTotal)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-foreground/80">Total in</dt>
            <dd className="mt-0.5 text-lg font-semibold text-primary tabular-nums">
              {formatCents(invested)}
            </dd>
          </div>
        </dl>

        {panel === "rebuy" && (
          <div className="rounded-2xl border border-brass-rim bg-background/70 p-4">
            {rebuys.length > 0 && (
              <ul className="mb-3 flex flex-col divide-y divide-border">
                {rebuys.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between py-1.5 text-sm"
                  >
                    <span className="tabular-nums">
                      {formatCents(r.amount)}
                    </span>
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
                aria-label="Rebuy amount"
                autoFocus
                required
              />
              <Button type="submit" disabled={rebuyPending}>
                {rebuyPending ? "Adding…" : "Add"}
              </Button>
            </form>
            {rebuyState.error && (
              <p className="mt-2 text-sm text-destructive">
                {rebuyState.error}
              </p>
            )}
          </div>
        )}

        {panel === "cashOut" ? (
          <form
            action={cashOutAction}
            className="flex flex-col gap-4 rounded-2xl border border-brass-rim bg-background/70 p-4 sm:p-5"
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
                onClick={() => setPanel(null)}
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
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            <Button
              size="lg"
              variant="outline"
              aria-expanded={panel === "rebuy"}
              className="h-13.5 border-brass! bg-background/60! text-base"
              onClick={() => setPanel(panel === "rebuy" ? null : "rebuy")}
            >
              {panel === "rebuy" ? "Close" : "Rebuy"}
            </Button>
            <Button
              size="lg"
              className="h-13.5 text-base"
              onClick={() => setPanel("cashOut")}
            >
              Cash out
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

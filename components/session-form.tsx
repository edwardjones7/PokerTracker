"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { VenueIcon } from "@/components/venue-icon";
import { VENUE_OPTIONS, STAKES_PRESETS } from "@/lib/venues";
import type { Venue } from "@/db/schema";
import type { ActionState } from "@/app/actions/sessions";

type InitialValues = {
  id?: number;
  venue?: Venue;
  location?: string;
  stakesSmall?: number; // cents
  stakesBig?: number;
  buyIn?: number;
  cashOut?: number | null;
  startedAt?: Date;
  endedAt?: Date | null;
  notes?: string;
  rebuyTotal?: number;
};

function centsToInput(cents: number | null | undefined): string {
  if (cents == null) return "";
  return cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2);
}

function toLocalInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function SessionForm({
  mode,
  action,
  initial = {},
  submitLabel,
}: {
  mode: "past" | "start" | "edit";
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  initial?: InitialValues;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {
    error: null,
  } as ActionState);

  const [venue, setVenue] = useState<Venue>(initial.venue ?? "casino");
  const [small, setSmall] = useState(centsToInput(initial.stakesSmall ?? 100));
  const [big, setBig] = useState(centsToInput(initial.stakesBig ?? 200));
  const [startedAt, setStartedAt] = useState("");
  const [tzOffset, setTzOffset] = useState("0");

  const hasResultFields = mode !== "start";
  const initialDurationMin =
    initial.startedAt && initial.endedAt
      ? Math.round(
          (initial.endedAt.getTime() - initial.startedAt.getTime()) / 60_000,
        )
      : null;

  // datetime-local values and tz offset are client-only concepts; set them
  // after mount so SSR output stays stable.
  useEffect(() => {
    setTzOffset(String(new Date().getTimezoneOffset()));
    if (hasResultFields) {
      setStartedAt(toLocalInputValue(initial.startedAt ?? new Date()));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const venueMeta = VENUE_OPTIONS.find((v) => v.value === venue)!;

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {initial.id != null && <input type="hidden" name="id" value={initial.id} />}
      <input type="hidden" name="venue" value={venue} />
      <input type="hidden" name="tzOffset" value={tzOffset} />

      <div className="grid grid-cols-3 gap-2">
        {VENUE_OPTIONS.map((v) => (
          <button
            key={v.value}
            type="button"
            onClick={() => setVenue(v.value)}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-sm transition-colors",
              venue === v.value
                ? "border-primary/50 bg-primary/10 font-medium"
                : "text-muted-foreground hover:bg-accent",
            )}
          >
            <VenueIcon
              venue={v.value}
              className={cn("size-5", venue === v.value && "text-primary")}
            />
            {v.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="location">Where</Label>
        <Input
          id="location"
          name="location"
          placeholder={venueMeta.locationPlaceholder}
          defaultValue={initial.location ?? ""}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Stakes</Label>
        <div className="flex gap-2">
          {STAKES_PRESETS.map((p) => {
            const selected =
              small === centsToInput(p.small) && big === centsToInput(p.big);
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setSmall(centsToInput(p.small));
                  setBig(centsToInput(p.big));
                }}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm transition-colors",
                  selected
                    ? "border-primary/50 bg-primary/10 font-medium"
                    : "text-muted-foreground hover:bg-accent",
                )}
              >
                {p.label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <Input
            name="stakesSmall"
            value={small}
            onChange={(e) => setSmall(e.target.value)}
            inputMode="decimal"
            placeholder="1"
            aria-label="Small blind"
          />
          <span className="text-muted-foreground">/</span>
          <Input
            name="stakesBig"
            value={big}
            onChange={(e) => setBig(e.target.value)}
            inputMode="decimal"
            placeholder="2"
            aria-label="Big blind"
          />
        </div>
      </div>

      {hasResultFields && (
        <>
          <div className="flex flex-col gap-2">
            <Label htmlFor="startedAt">Started</Label>
            <Input
              id="startedAt"
              type="datetime-local"
              name="startedAt"
              value={startedAt}
              onChange={(e) => setStartedAt(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>How long</Label>
            <div className="flex items-center gap-2">
              <Input
                name="durationHours"
                type="number"
                min={0}
                max={48}
                defaultValue={
                  initialDurationMin != null
                    ? Math.floor(initialDurationMin / 60)
                    : 3
                }
                aria-label="Hours"
              />
              <span className="text-sm text-muted-foreground">h</span>
              <Input
                name="durationMinutes"
                type="number"
                min={0}
                max={59}
                step={5}
                defaultValue={
                  initialDurationMin != null ? initialDurationMin % 60 : 0
                }
                aria-label="Minutes"
              />
              <span className="text-sm text-muted-foreground">m</span>
            </div>
          </div>
        </>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="buyIn">
            {mode === "edit" && (initial.rebuyTotal ?? 0) > 0
              ? "Initial buy-in"
              : mode === "start"
                ? "Buy-in"
                : "Total buy-in"}
          </Label>
          <Input
            id="buyIn"
            name="buyIn"
            inputMode="decimal"
            placeholder="300"
            defaultValue={centsToInput(initial.buyIn)}
            required
          />
        </div>
        {hasResultFields && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="cashOut">Cashed out</Label>
            <Input
              id="cashOut"
              name="cashOut"
              inputMode="decimal"
              placeholder="0"
              defaultValue={centsToInput(initial.cashOut)}
              required
            />
          </div>
        )}
      </div>
      {mode === "edit" && (initial.rebuyTotal ?? 0) > 0 && (
        <p className="-mt-3 text-xs text-muted-foreground">
          Rebuys of {"$" + ((initial.rebuyTotal ?? 0) / 100).toFixed(2)} are
          tracked separately and added to this buy-in.
        </p>
      )}

      {hasResultFields && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Table dynamics, big hands, mistakes…"
            defaultValue={initial.notes ?? ""}
            rows={3}
          />
        </div>
      )}

      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}

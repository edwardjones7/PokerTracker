"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  addBankrollTransaction,
} from "@/app/actions/bankroll";
import type { ActionState } from "@/app/actions/sessions";

const initialState: ActionState = { error: null };

export function BankrollForm() {
  const [state, formAction, pending] = useActionState(
    addBankrollTransaction,
    initialState,
  );
  const [type, setType] = useState<"deposit" | "withdrawal">("deposit");
  const [bankroll, setBankroll] = useState<"live" | "online">("live");
  const formRef = useRef<HTMLFormElement>(null);
  const submitted = useRef(false);

  useEffect(() => {
    if (!submitted.current || pending) return;
    submitted.current = false;
    if (state.error === null) {
      toast.success(type === "deposit" ? "Deposit added" : "Withdrawal added");
      formRef.current?.reset();
    }
  }, [pending, state, type]);

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={() => (submitted.current = true)}
      className="flex flex-col gap-4 rounded-2xl border bg-card p-4 sm:p-5"
    >
      <p className="text-sm font-medium">Move money</p>
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="bankroll" value={bankroll} />

      <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
        {(["deposit", "withdrawal"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={cn(
              "rounded-md py-1.5 text-sm capitalize transition-colors",
              type === t
                ? "bg-card font-medium shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
        {(
          [
            ["live", "Live (cash)"],
            ["online", "Online"],
          ] as const
        ).map(([b, label]) => (
          <button
            key={b}
            type="button"
            onClick={() => setBankroll(b)}
            className={cn(
              "rounded-md py-1.5 text-sm transition-colors",
              bankroll === b
                ? "bg-card font-medium shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            name="amount"
            inputMode="decimal"
            placeholder="100"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="note">Note</Label>
          <Input id="note" name="note" placeholder="Optional" />
        </div>
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending
          ? "Saving…"
          : type === "deposit"
            ? "Add deposit"
            : "Add withdrawal"}
      </Button>
    </form>
  );
}

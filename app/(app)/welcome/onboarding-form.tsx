"use client";

import { useActionState } from "react";
import { completeOnboarding } from "@/app/actions/onboarding";
import type { ActionState } from "@/app/actions/sessions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: ActionState = { error: null };

export function OnboardingForm() {
  const [state, formAction, pending] = useActionState(
    completeOnboarding,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Live bankroll (casino + home games)
        <Input
          name="live"
          inputMode="decimal"
          placeholder="$0"
          autoFocus
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Online bankroll
        <Input name="online" inputMode="decimal" placeholder="$0" />
      </label>
      {state.error && (
        <p className="text-center text-sm text-destructive">{state.error}</p>
      )}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Saving…" : "Start tracking"}
      </Button>
    </form>
  );
}

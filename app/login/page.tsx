"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const initialState: LoginState = { error: null };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">♠️ PokerTracker</CardTitle>
          <CardDescription>Enter your passcode to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="flex flex-col gap-4">
            <Input
              type="password"
              name="passcode"
              placeholder="Passcode"
              autoFocus
              required
              inputMode="text"
              className="text-center text-lg"
            />
            {state.error && (
              <p className="text-center text-sm text-destructive">
                {state.error}
              </p>
            )}
            <Button type="submit" size="lg" disabled={pending}>
              {pending ? "Checking…" : "Unlock"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

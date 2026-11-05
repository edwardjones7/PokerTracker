"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogoMark } from "@/components/logo";
import { PoweredBy } from "@/components/powered-by";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") ?? "");
    if (password !== String(form.get("confirmPassword") ?? "")) {
      setError("Passwords don't match.");
      return;
    }
    setPending(true);
    setError(null);
    const { error } = await authClient.signUp.email({
      name: String(form.get("name") ?? "").trim(),
      email: String(form.get("email") ?? ""),
      password,
    });
    if (error) {
      setError(error.message ?? "Sign-up failed.");
      setPending(false);
      return;
    }
    // Signed in automatically; onboarding asks for starting bankrolls.
    router.push("/welcome");
    router.refresh();
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <LogoMark className="mx-auto mb-3 size-12" />
          <CardTitle className="text-2xl tracking-tight">
            Create account
          </CardTitle>
          <CardDescription>
            Track your sessions and bankroll
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <Input
              type="text"
              name="name"
              placeholder="Name"
              autoComplete="name"
              autoFocus
              required
            />
            <Input
              type="email"
              name="email"
              placeholder="Email"
              autoComplete="email"
              required
            />
            <Input
              type="password"
              name="password"
              placeholder="Password (8+ characters)"
              autoComplete="new-password"
              minLength={8}
              required
            />
            <Input
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              autoComplete="new-password"
              minLength={8}
              required
            />
            {error && (
              <p className="text-center text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" size="lg" disabled={pending}>
              {pending ? "Creating…" : "Create account"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
      <PoweredBy />
    </main>
  );
}

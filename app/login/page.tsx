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

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setPending(true);
    setError(null);
    const { error } = await authClient.signIn.email({
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    });
    if (error) {
      setError(error.message ?? "Sign-in failed.");
      setPending(false);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <LogoMark detailed className="mx-auto mb-3 size-16" />
          <CardTitle className="text-2xl tracking-tight">
            PokerTracker
          </CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <Input
              type="email"
              name="email"
              placeholder="Email"
              autoComplete="email"
              autoFocus
              required
            />
            <Input
              type="password"
              name="password"
              placeholder="Password"
              autoComplete="current-password"
              required
            />
            {error && (
              <p className="text-center text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" size="lg" disabled={pending}>
              {pending ? "Signing in…" : "Sign in"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              No account?{" "}
              <Link href="/signup" className="text-primary hover:underline">
                Create one
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
      <PoweredBy />
    </main>
  );
}

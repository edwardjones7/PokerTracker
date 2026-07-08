import Link from "next/link";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getActiveSession,
  getBankrollBalances,
  getSessionsWithRebuys,
} from "@/lib/data";
import { formatCents } from "@/lib/money";
import { Dashboard } from "@/components/dashboard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [balances, sessions, active] = await Promise.all([
    getBankrollBalances(),
    getSessionsWithRebuys(),
    getActiveSession(),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">♠️ PokerTracker</h1>
        {!active && (
          <Button size="sm" render={<Link href="/session/live" />}>
            <Play className="size-4" /> Start session
          </Button>
        )}
      </div>

      {active && (
        <Link
          href="/session/live"
          className="flex items-center gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4"
        >
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
          </span>
          <span className="text-sm font-medium">
            Session in progress — tap to open
          </span>
        </Link>
      )}

      <Link
        href="/bankroll"
        className="rounded-2xl border bg-card p-5 transition-colors hover:bg-accent"
      >
        <p className="text-sm text-muted-foreground">Bankroll</p>
        <p className="text-3xl font-bold tabular-nums">
          {formatCents(balances.total)}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          💵 {formatCents(balances.live)} live · 💻{" "}
          {formatCents(balances.online)} online
        </p>
      </Link>

      <Dashboard sessions={sessions} />
    </div>
  );
}

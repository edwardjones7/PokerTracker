import Link from "next/link";
import { redirect } from "next/navigation";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  computeBalances,
  getActiveSession,
  getSessionsWithRebuys,
  getTransactions,
} from "@/lib/data";
import { Dashboard } from "@/components/dashboard";
import { PageHeader } from "@/components/page-header";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [sessions, transactions, active] = await Promise.all([
    getSessionsWithRebuys(),
    getTransactions(),
    getActiveSession(),
  ]);

  // Brand-new account: capture starting bankrolls first. The onboarding
  // deposits (even $0 ones) are what makes this stop firing.
  if (sessions.length === 0 && transactions.length === 0) redirect("/welcome");

  const balances = computeBalances(sessions, transactions);

  return (
    <div className="flex flex-col">
      <PageHeader title="Dashboard" description="How's the poker career going?">
        {!active && (
          <Button render={<Link href="/session/live" />}>
            <Play className="size-4" /> Start session
          </Button>
        )}
      </PageHeader>

      {active && (
        <Link
          href="/session/live"
          className="mb-4 flex items-center gap-3 rounded-xl border border-primary/40 bg-primary/10 p-4 transition-colors hover:bg-primary/15"
        >
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
          </span>
          <span className="text-sm font-medium">
            Session in progress — tap to open
          </span>
        </Link>
      )}

      <Dashboard sessions={sessions} balances={balances} />
    </div>
  );
}

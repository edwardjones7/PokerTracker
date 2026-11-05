import { Banknote, Monitor } from "lucide-react";
import { getBankrollBalances, getTransactions } from "@/lib/data";
import { formatCents, formatCentsSigned } from "@/lib/money";
import { BankrollForm } from "@/components/bankroll-form";
import { ChipStack } from "@/components/chips";
import { LocalTime } from "@/components/local-time";
import { PageHeader } from "@/components/page-header";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

// Rule of thumb: a healthy cash-game roll is 20+ buy-ins of 100bb.
const BUY_IN_CENTS_1_2 = 200 * 100; // 100bb at $1/$2

export default async function BankrollPage() {
  const [balances, transactions] = await Promise.all([
    getBankrollBalances(),
    getTransactions(),
  ]);

  const liveBuyIns = balances.live / BUY_IN_CENTS_1_2;

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Bankroll"
        description="Session results move this automatically."
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="felt brass-rim rounded-3xl p-5 sm:p-6 lg:col-start-1 lg:row-start-1">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs tracking-[0.14em] text-foreground/80 uppercase">
                Total bankroll
              </p>
              <p className="mt-1 font-display numerals text-5xl font-semibold tabular-nums">
                {formatCents(balances.total)}
              </p>
            </div>
            <ChipStack className="hidden w-20 sm:block" />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2 sm:max-w-md">
            <div className="rounded-xl border bg-background/60 p-3.5">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Banknote className="size-3.5" /> Live
              </p>
              <p className="mt-0.5 text-lg font-semibold tabular-nums">
                {formatCents(balances.live)}
              </p>
            </div>
            <div className="rounded-xl border bg-background/60 p-3.5">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Monitor className="size-3.5" /> Online
              </p>
              <p className="mt-0.5 text-lg font-semibold tabular-nums">
                {formatCents(balances.online)}
              </p>
            </div>
          </div>
          <p className="mt-4 text-xs text-foreground/80">
            Your live roll is {liveBuyIns.toFixed(1)} buy-ins at $1/$2 (100bb).
            20+ is considered comfortable.
          </p>
        </div>

        <div className="lg:sticky lg:top-8 lg:col-start-2 lg:row-start-1 lg:row-span-2">
          <BankrollForm />
        </div>

        <div className="flex flex-col gap-2 lg:col-start-1 lg:row-start-2">
          <h2 className="mt-2 text-sm font-medium lg:mt-0">
            Deposits &amp; withdrawals
          </h2>
          <p className="text-xs text-muted-foreground">
            Only money you moved in or out — session wins and losses are
            counted automatically.
          </p>
          <div className="mt-1 flex flex-col divide-y divide-border/60 overflow-hidden rounded-xl border bg-card">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium capitalize">
                    {tx.type} · {tx.bankroll === "live" ? "Live" : "Online"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <LocalTime date={tx.createdAt} format="date" />
                    {tx.note ? ` · ${tx.note}` : ""}
                  </p>
                </div>
                <span
                  className={cn(
                    "font-semibold tabular-nums",
                    tx.amount >= 0 ? "text-profit" : "text-loss",
                  )}
                >
                  {formatCentsSigned(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { getBankrollBalances, getTransactions } from "@/lib/data";
import { formatCents, formatCentsSigned } from "@/lib/money";
import { BankrollForm } from "@/components/bankroll-form";
import { LocalTime } from "@/components/local-time";
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
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-semibold">Bankroll</h1>

      <div className="rounded-2xl border bg-card p-5 text-center">
        <p className="text-sm text-muted-foreground">Total bankroll</p>
        <p className="text-4xl font-bold tabular-nums">
          {formatCents(balances.total)}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl border p-3">
            <p className="text-xs text-muted-foreground">💵 Live</p>
            <p className="text-lg font-semibold tabular-nums">
              {formatCents(balances.live)}
            </p>
          </div>
          <div className="rounded-xl border p-3">
            <p className="text-xs text-muted-foreground">💻 Online</p>
            <p className="text-lg font-semibold tabular-nums">
              {formatCents(balances.online)}
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Your live roll is {liveBuyIns.toFixed(1)} buy-ins at $1/$2 (100bb).
          20+ is considered comfortable.
        </p>
      </div>

      <BankrollForm />

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">Deposits &amp; withdrawals</h2>
        <p className="text-xs text-muted-foreground">
          Session wins and losses move your bankroll automatically — this list
          is only money you moved in or out.
        </p>
        <div className="flex flex-col gap-2">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between rounded-xl border bg-card p-3 text-sm"
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
                  tx.amount >= 0 ? "text-emerald-500" : "text-red-500",
                )}
              >
                {formatCentsSigned(tx.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

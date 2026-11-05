"use client";

import { AnimatedNumber } from "@/components/animated-number";
import { LogoMark } from "@/components/logo";
import { formatCents, formatCentsSigned } from "@/lib/money";
import { cn } from "@/lib/utils";

/** Result shown right after cashing out. Wins get the table and the chip;
    losses keep the same facts, without the celebration. */
export function CashOutReveal({
  title,
  subtitle,
  profit,
  invested,
  cashOut,
  hourly,
  bankroll,
}: {
  title: string;
  subtitle: string;
  profit: number;
  invested: number;
  cashOut: number;
  hourly: number | null;
  bankroll: number;
}) {
  const won = profit > 0;
  const rows: [string, string][] = [
    ["Total in", formatCents(invested)],
    ["Cashed out", formatCents(cashOut)],
    ["Hourly", hourly === null ? "—" : `${formatCentsSigned(hourly)}/hr`],
    ["Bankroll", formatCents(bankroll)],
  ];
  return (
    <section
      className={cn(
        "flex flex-col items-center rounded-3xl border p-6 text-center sm:p-8",
        won ? "felt brass-rim" : "surface bg-card",
      )}
    >
      <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
        Session complete
      </p>
      {won && (
        <LogoMark
          detailed
          className="mt-6 size-32 duration-700 animate-in fade-in zoom-in-75 motion-reduce:animate-none"
        />
      )}
      <h1
        className={cn(
          "mt-5 font-display numerals text-6xl leading-none font-semibold tabular-nums",
          profit >= 0 ? "text-profit" : "text-loss",
        )}
      >
        <AnimatedNumber value={profit} from={0} format={formatCentsSigned} />
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {title} · {subtitle}
      </p>
      <dl className="mt-6 w-full max-w-md divide-y divide-border rounded-2xl border bg-background/60 px-4 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between py-3">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-semibold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

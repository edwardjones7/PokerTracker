"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCentsSigned } from "@/lib/money";

export type ProfitPoint = {
  index: number;
  date: string;
  profit: number; // cumulative, cents
  sessionProfit: number; // cents
};

// Line color validated against the card surface with the dataviz palette
// checker (lightness band, chroma floor, 3:1 contrast). Grid/axis inks stay
// recessive via theme tokens.
const LINE = "var(--chart-1)";

function dollars(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  return `${sign}$${Math.round(Math.abs(cents) / 100)}`;
}

// Ticks on $100 boundaries, widening to a larger multiple of $100 only when
// the range would otherwise cram in more than ~8 gridlines.
const HUNDRED = 10_000; // cents
function hundredTicks(data: ProfitPoint[]): number[] {
  const profits = data.map((d) => d.profit);
  const min = Math.min(0, ...profits);
  const max = Math.max(0, ...profits);
  const step = Math.max(HUNDRED, Math.ceil((max - min) / 8 / HUNDRED) * HUNDRED);
  const ticks = [];
  for (let t = Math.floor(min / step) * step; t <= Math.ceil(max / step) * step; t += step) {
    ticks.push(t);
  }
  return ticks;
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: ProfitPoint }[];
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  const dateLabel = new Date(p.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="text-muted-foreground">
        {p.index === 0 ? "Start" : `Session ${p.index}`} · {dateLabel}
      </p>
      <p className="mt-0.5 font-medium">
        Total {formatCentsSigned(p.profit)}
        {p.index > 0 && (
          <span className={p.sessionProfit >= 0 ? "text-profit" : "text-loss"}>
            {" "}
            ({formatCentsSigned(p.sessionProfit)})
          </span>
        )}
      </p>
    </div>
  );
}

export function ProfitChart({ data }: { data: ProfitPoint[] }) {
  const ticks = hundredTicks(data);
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="profitFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={LINE} stopOpacity={0.28} />
            <stop offset="100%" stopColor={LINE} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--border)" strokeWidth={1} vertical={false} />
        <XAxis
          dataKey="index"
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: "var(--border)" }}
          allowDecimals={false}
        />
        <YAxis
          domain={[ticks[0], ticks[ticks.length - 1]]}
          ticks={ticks}
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={dollars}
          width={48}
        />
        <ReferenceLine y={0} stroke="var(--muted-foreground)" strokeOpacity={0.4} strokeWidth={1.5} />
        <Tooltip
          content={<ChartTooltip />}
          cursor={{ stroke: "var(--muted-foreground)", strokeDasharray: "3 3" }}
        />
        <Area
          type="monotone"
          dataKey="profit"
          stroke={LINE}
          strokeWidth={2}
          fill="url(#profitFill)"
          dot={false}
          activeDot={{ r: 4, stroke: "var(--card)", strokeWidth: 2 }}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

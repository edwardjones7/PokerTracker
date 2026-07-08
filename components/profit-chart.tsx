"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
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

const INK = {
  line: "#3987e5",
  grid: "#2c2c2a",
  baseline: "#383835",
  muted: "#898781",
  surface: "#171717",
};

function dollars(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  return `${sign}$${Math.round(Math.abs(cents) / 100)}`;
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
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="text-muted-foreground">
        Session {p.index} ·{" "}
        {new Date(p.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}
      </p>
      <p className="mt-0.5 font-medium">
        Total {formatCentsSigned(p.profit)}
        <span
          className={
            p.sessionProfit >= 0 ? "text-emerald-500" : "text-red-500"
          }
        >
          {" "}
          ({formatCentsSigned(p.sessionProfit)})
        </span>
      </p>
    </div>
  );
}

export function ProfitChart({ data }: { data: ProfitPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart
        data={data}
        margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
      >
        <CartesianGrid stroke={INK.grid} strokeWidth={1} vertical={false} />
        <XAxis
          dataKey="index"
          tick={{ fill: INK.muted, fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: INK.baseline }}
          allowDecimals={false}
        />
        <YAxis
          tick={{ fill: INK.muted, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={dollars}
          width={48}
        />
        <ReferenceLine y={0} stroke={INK.baseline} strokeWidth={1.5} />
        <Tooltip
          content={<ChartTooltip />}
          cursor={{ stroke: INK.muted, strokeDasharray: "3 3" }}
        />
        <Line
          type="monotone"
          dataKey="profit"
          stroke={INK.line}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, stroke: INK.surface, strokeWidth: 2 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

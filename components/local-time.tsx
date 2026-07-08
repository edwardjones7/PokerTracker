"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Renders a timestamp in the viewer's local timezone. Client-only (empty on
 * the server) so the server's timezone — UTC on Vercel — never leaks into
 * the UI.
 */
export function LocalTime({
  date,
  format = "datetime",
}: {
  date: Date | string;
  format?: "date" | "datetime" | "time";
}) {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  if (!mounted) return <span suppressHydrationWarning />;
  const d = typeof date === "string" ? new Date(date) : date;
  const opts: Intl.DateTimeFormatOptions =
    format === "date"
      ? { month: "short", day: "numeric", year: "numeric" }
      : format === "time"
        ? { hour: "numeric", minute: "2-digit" }
        : {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          };
  return <span suppressHydrationWarning>{d.toLocaleString("en-US", opts)}</span>;
}

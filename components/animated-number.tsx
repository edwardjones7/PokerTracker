"use client";

import { useEffect, useRef, useState } from "react";

const DURATION_MS = 450;

/**
 * Renders the formatted value and counts to the new one when it changes
 * (e.g. switching dashboard filters). The first render is the real number,
 * so nothing flashes from zero on load, unless `from` asks for a count-up.
 */
export function AnimatedNumber({
  value,
  from,
  format,
}: {
  value: number;
  from?: number;
  format: (value: number) => string;
}) {
  const [shown, setShown] = useState(from ?? value);
  const current = useRef(from ?? value);

  useEffect(() => {
    if (current.current === value) return;
    const from = current.current;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = reduced ? 1 : Math.min((now - start) / DURATION_MS, 1);
      const eased = 1 - (1 - progress) ** 3;
      current.current = Math.round(from + (value - from) * eased);
      setShown(current.current);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return format(shown);
}

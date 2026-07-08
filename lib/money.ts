const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const usdWhole = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** Format integer cents as dollars, e.g. 61200 -> "$612.00". */
export function formatCents(cents: number): string {
  return usd.format(cents / 100);
}

/** Format cents without decimals when whole, e.g. stakes "$1/$2". */
export function formatCentsCompact(cents: number): string {
  return cents % 100 === 0 ? usdWhole.format(cents / 100) : usd.format(cents / 100);
}

/** Signed variant with an explicit +, e.g. "+$45.00". */
export function formatCentsSigned(cents: number): string {
  return (cents > 0 ? "+" : "") + usd.format(cents / 100);
}

/** Parse a dollars string from an input ("612", "6.12", "$1,225.50") to cents. */
export function parseDollarsToCents(value: string): number | null {
  const cleaned = value.replace(/[$,\s]/g, "");
  if (cleaned === "" || !/^-?\d*(\.\d{0,2})?$/.test(cleaned)) return null;
  const num = Number(cleaned);
  if (!Number.isFinite(num)) return null;
  return Math.round(num * 100);
}

/** A single blind: sub-$1 amounts read as cents ("5¢"), the rest as dollars. */
function formatBlind(cents: number): string {
  return cents < 100 ? `${cents}¢` : formatCentsCompact(cents);
}

export function formatStakes(smallCents: number, bigCents: number): string {
  return `${formatBlind(smallCents)}/${formatBlind(bigCents)}`;
}

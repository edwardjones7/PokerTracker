/**
 * Parse a datetime-local input value ("YYYY-MM-DDTHH:mm") into an absolute
 * Date using the client's timezone offset (minutes, from
 * Date.prototype.getTimezoneOffset). Needed because the server may run in
 * UTC while sessions are logged in the user's local time.
 */
export function parseLocalDateTime(
  value: string,
  tzOffsetMinutes: number,
): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);
  if (!m) return null;
  const [y, mo, d, h, mi] = m.slice(1).map(Number);
  return new Date(Date.UTC(y, mo - 1, d, h, mi) + tzOffsetMinutes * 60_000);
}

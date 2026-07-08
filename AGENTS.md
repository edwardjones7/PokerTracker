<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# PokerTracker

Single-user, mobile-first poker session tracker (cash games only). Next.js 16
App Router + TypeScript + Tailwind v4 + shadcn/ui (Base UI primitives — use
`render={<Link/>}`, not `asChild`). Deployed on Vercel.

## Commands

- `npm run dev` — dev server (uses embedded PGlite at `.pglite/`, auto-migrates)
- `npm run build` / `npm start` — production build/serve
- `npx drizzle-kit generate` — new migration after editing `db/schema.ts`
- `npx drizzle-kit migrate` — apply migrations to Neon (needs `DATABASE_URL`)

## Architecture

- **DB**: Drizzle ORM, Postgres dialect. `db/index.ts` picks the driver:
  `DATABASE_URL` set → Neon serverless; otherwise embedded PGlite with
  migrations from `drizzle/` applied on first connection. Schema in
  `db/schema.ts`: `sessions` (buy_in is the *initial* buy-in), `rebuys`
  (rows so live mode can undo; total invested = buy_in + sum(rebuys)),
  `bankroll_transactions` (signed cents; seeded with starting bankrolls).
- **All money is integer cents.** Parse inputs with `parseDollarsToCents`
  (`lib/money.ts`); derive stats with `lib/stats.ts` (pure, client-safe).
- **Bankrolls**: `live` (casino + home sessions) and `online`. Balance =
  sum of transactions + completed-session profits — computed, never stored.
- **Auth**: passcode (`PASSCODE` env) → SHA-256 token cookie, enforced in
  `proxy.ts` (Next 16 middleware). Rotating `PASSCODE` logs devices out.
- **Mutations** are server actions in `app/actions/`; pages under
  `app/(app)/` are dynamic and re-read after `revalidatePath("/", "layout")`.
- **Timezones**: server may run in UTC. Forms send a hidden `tzOffset`
  (parsed by `lib/datetime.ts`); timestamps render via `<LocalTime>`
  (client-only) — never format dates during SSR.

## Verification

`npm run build && npm start -- --port 3100`, then drive with Playwright
(dev dependency) at 390×844 viewport: login (passcode in `.env.local`) →
add past session → start live session → rebuy → cash out → verify bankroll
math on `/bankroll` (session profits move the matching bankroll; deleting a
session restores it).

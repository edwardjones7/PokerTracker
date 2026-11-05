<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# PokerTracker

Multi-user, mobile-first poker session tracker (cash games only). Next.js 16
App Router + TypeScript + Tailwind v4 + shadcn/ui (Base UI primitives — use
`render={<Link/>}` plus `nativeButton={false}`, not `asChild`). Deployed on Vercel.

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
  `bankroll_transactions` (signed cents; onboarding inserts starting
  deposits). Better Auth tables (`user`, `session`, `account`,
  `verification` — singular, vs the poker `sessions`) in `db/auth-schema.ts`.
  `sessions.user_id` / `bankroll_transactions.user_id` are nullable: rows
  from the single-user era stay NULL until claimed (see Auth).
- **All money is integer cents.** Parse inputs with `parseDollarsToCents`
  (`lib/money.ts`); derive stats with `lib/stats.ts` (pure, client-safe).
- **Bankrolls**: `live` (casino + home sessions) and `online`. Balance =
  sum of transactions + completed-session profits — computed, never stored.
- **Auth**: Better Auth (email + password, open signup) with the Drizzle
  adapter (`transaction: false` — neon-http has no tx support). The auth
  instance is built lazily in `lib/auth.ts` (`getAuth()`, cached on
  `globalThis`) because `getDb()` is async. `proxy.ts` only does an
  optimistic cookie check; the real boundary is `requireUser()` (React
  `cache()`d), called by every `lib/data.ts` function and server action —
  all queries filter by `user_id` (never trust a raw row id from a form).
  Signing up with `OWNER_EMAIL` adopts all NULL-`user_id` legacy rows.
  New users get `/welcome` onboarding (starting-bankroll deposits; the
  deposits' existence, even at $0, is the "onboarded" flag).
- **Mutations** are server actions in `app/actions/`; pages under
  `app/(app)/` are dynamic and re-read after `revalidatePath("/", "layout")`.
- **Timezones**: server may run in UTC. Forms send a hidden `tzOffset`
  (parsed by `lib/datetime.ts`); timestamps render via `<LocalTime>`
  (client-only) — never format dates during SSR.

## Verification

`npm run build && npm start -- --port 3100`, then drive with Playwright
(dev dependency) at 390×844 viewport: sign up → onboarding (starting
bankrolls) → add past session → start live session → rebuy → cash out →
verify bankroll math on `/bankroll` (session profits move the matching
bankroll; deleting a session restores it). For multi-user changes, sign up
a second account and verify it sees none of the first account's data.

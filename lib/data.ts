import "server-only";
import { and, desc, eq, sql } from "drizzle-orm";
import {
  getDb,
  sessions,
  rebuys,
  bankrollTransactions,
  bankrollForVenue,
  type Session,
  type Rebuy,
  type BankrollTransaction,
} from "@/db";
import { sessionProfit, type SessionWithRebuys } from "@/lib/stats";
import { requireUser } from "@/lib/auth";

// Every read is scoped to the signed-in user; requireUser() is cached per
// request, so repeated calls cost one session lookup.

export async function getSessionsWithRebuys(): Promise<SessionWithRebuys[]> {
  const user = await requireUser();
  const db = await getDb();
  const rows = await db
    .select({
      session: sessions,
      rebuyTotal: sql<number>`coalesce(sum(${rebuys.amount}), 0)::int`,
    })
    .from(sessions)
    .leftJoin(rebuys, eq(rebuys.sessionId, sessions.id))
    .where(eq(sessions.userId, user.id))
    .groupBy(sessions.id)
    .orderBy(desc(sessions.startedAt));
  return rows.map((r) => ({ ...r.session, rebuyTotal: r.rebuyTotal }));
}

export async function getSessionWithRebuys(
  id: number,
): Promise<(SessionWithRebuys & { rebuys: Rebuy[] }) | null> {
  const user = await requireUser();
  const db = await getDb();
  const [session] = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.id, id), eq(sessions.userId, user.id)))
    .limit(1);
  if (!session) return null;
  const rebuyRows = await db
    .select()
    .from(rebuys)
    .where(eq(rebuys.sessionId, id))
    .orderBy(desc(rebuys.createdAt));
  return {
    ...session,
    rebuys: rebuyRows,
    rebuyTotal: rebuyRows.reduce((sum, r) => sum + r.amount, 0),
  };
}

export async function getActiveSession(): Promise<
  (SessionWithRebuys & { rebuys: Rebuy[] }) | null
> {
  const user = await requireUser();
  const db = await getDb();
  const [active] = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.status, "active"), eq(sessions.userId, user.id)))
    .orderBy(desc(sessions.startedAt))
    .limit(1);
  if (!active) return null;
  return getSessionWithRebuys(active.id);
}

export async function getTransactions(): Promise<BankrollTransaction[]> {
  const user = await requireUser();
  const db = await getDb();
  return db
    .select()
    .from(bankrollTransactions)
    .where(eq(bankrollTransactions.userId, user.id))
    .orderBy(desc(bankrollTransactions.createdAt), desc(bankrollTransactions.id));
}

export type BankrollBalances = {
  live: number;
  online: number;
  total: number;
};

export function computeBalances(
  allSessions: SessionWithRebuys[],
  transactions: BankrollTransaction[],
): BankrollBalances {
  const balances = { live: 0, online: 0 };
  for (const tx of transactions) {
    balances[tx.bankroll] += tx.amount;
  }
  for (const s of allSessions) {
    if (s.status !== "completed") continue;
    balances[bankrollForVenue(s.venue)] += sessionProfit(s);
  }
  return { ...balances, total: balances.live + balances.online };
}

export async function getBankrollBalances(): Promise<BankrollBalances> {
  const [allSessions, transactions] = await Promise.all([
    getSessionsWithRebuys(),
    getTransactions(),
  ]);
  return computeBalances(allSessions, transactions);
}

export type { Session, SessionWithRebuys };

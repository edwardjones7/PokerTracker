import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { isNull } from "drizzle-orm";
import {
  getDb,
  sessions,
  bankrollTransactions,
  user,
  session,
  account,
  verification,
} from "@/db";

declare global {
  // Cached across hot reloads in dev / reused across invocations in prod,
  // same pattern as __pokerDb. Lazy because getDb() is async.
  var __pokerAuth: Promise<Auth> | undefined;
}

async function createAuth() {
  const db = await getDb();
  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: { user, session, account, verification },
      // neon-http has no transaction support; keep PGlite identical.
      transaction: false,
    }),
    emailAndPassword: { enabled: true },
    databaseHooks: {
      user: {
        create: {
          after: async (newUser) => {
            // The owner's signup adopts all pre-multi-user rows (user_id
            // IS NULL, including the seeded starting bankrolls). Idempotent.
            const owner = (process.env.OWNER_EMAIL ?? "").toLowerCase();
            if (!owner || newUser.email.toLowerCase() !== owner) return;
            await db
              .update(sessions)
              .set({ userId: newUser.id })
              .where(isNull(sessions.userId));
            await db
              .update(bankrollTransactions)
              .set({ userId: newUser.id })
              .where(isNull(bankrollTransactions.userId));
          },
        },
      },
    },
    plugins: [nextCookies()],
  });
}

type Auth = Awaited<ReturnType<typeof createAuth>>;

export function getAuth(): Promise<Auth> {
  if (!globalThis.__pokerAuth) {
    globalThis.__pokerAuth = createAuth();
  }
  return globalThis.__pokerAuth;
}

/**
 * Resolve the signed-in user or redirect to /login. This is the real auth
 * boundary — the proxy only does an optimistic cookie check, and server
 * actions can bypass the proxy matcher entirely. cache() dedupes the
 * session lookup across data calls within one request.
 */
export const requireUser = cache(async () => {
  const auth = await getAuth();
  const result = await auth.api.getSession({ headers: await headers() });
  if (!result) redirect("/login");
  return result.user;
});

export function isOwner(email: string): boolean {
  const owner = (process.env.OWNER_EMAIL ?? "").toLowerCase();
  return owner !== "" && email.toLowerCase() === owner;
}

/** Owner-only boundary: 404s for everyone else so the page stays invisible. */
export const requireOwner = cache(async () => {
  const user = await requireUser();
  if (!isOwner(user.email)) notFound();
  return user;
});

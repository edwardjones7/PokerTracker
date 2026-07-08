import * as schema from "./schema";

type Db = ReturnType<typeof import("drizzle-orm/neon-http").drizzle<typeof schema>>;

declare global {
  // Cached across hot reloads in dev / reused across invocations in prod.
  var __pokerDb: unknown;
}

async function createDb() {
  if (process.env.DATABASE_URL) {
    const { neon } = await import("@neondatabase/serverless");
    const { drizzle } = await import("drizzle-orm/neon-http");
    return drizzle(neon(process.env.DATABASE_URL), { schema });
  }
  // Local dev without Postgres: embedded PGlite persisted to .pglite/,
  // with migrations applied on first connection.
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  const client = new PGlite(".pglite");
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: "./drizzle" });
  return db;
}

export async function getDb(): Promise<Db> {
  if (!globalThis.__pokerDb) {
    globalThis.__pokerDb = createDb();
  }
  return globalThis.__pokerDb as Promise<Db>;
}

export * from "./schema";

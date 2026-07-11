import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const venueEnum = pgEnum("venue", ["casino", "home", "online"]);
export const sessionStatusEnum = pgEnum("session_status", [
  "active",
  "completed",
]);
export const bankrollEnum = pgEnum("bankroll", ["live", "online"]);
export const transactionTypeEnum = pgEnum("transaction_type", [
  "deposit",
  "withdrawal",
  "adjustment",
]);

// All money columns are integer cents.
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  // Nullable: pre-multi-user rows stay NULL until claimed by OWNER_EMAIL's
  // signup (see lib/auth.ts). Every query filters by userId, so unclaimed
  // rows are invisible.
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  venue: venueEnum("venue").notNull(),
  location: text("location").notNull().default(""),
  stakesSmall: integer("stakes_small").notNull(),
  stakesBig: integer("stakes_big").notNull(),
  // Initial buy-in only; rebuys live in their own table so live mode can
  // show and undo them. Total invested = buyIn + sum(rebuys.amount).
  buyIn: integer("buy_in").notNull(),
  cashOut: integer("cash_out"),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  status: sessionStatusEnum("status").notNull().default("completed"),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const rebuys = pgTable("rebuys", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id")
    .notNull()
    .references(() => sessions.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Amounts are signed: deposits positive, withdrawals negative.
// Balance = sum(amount) + completed-session profits for that bankroll
// (live <- casino + home sessions, online <- online sessions).
export const bankrollTransactions = pgTable("bankroll_transactions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  bankroll: bankrollEnum("bankroll").notNull(),
  type: transactionTypeEnum("type").notNull(),
  amount: integer("amount").notNull(),
  note: text("note").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Rebuy = typeof rebuys.$inferSelect;
export type BankrollTransaction = typeof bankrollTransactions.$inferSelect;
export type Venue = Session["venue"];
export type Bankroll = BankrollTransaction["bankroll"];

export const bankrollForVenue = (venue: Venue): Bankroll =>
  venue === "online" ? "online" : "live";

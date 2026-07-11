"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb, bankrollTransactions } from "@/db";
import { parseDollarsToCents } from "@/lib/money";
import { requireUser } from "@/lib/auth";
import type { ActionState } from "./sessions";

function parseStartingAmount(raw: FormDataEntryValue | null): number | null {
  if (typeof raw !== "string" || raw.trim() === "") return 0;
  const cents = parseDollarsToCents(raw);
  if (cents === null || cents < 0) return null;
  return cents;
}

/**
 * One-time setup after signup: record starting bankrolls as deposits.
 * Rows are inserted even at $0 — their existence is the "onboarded" flag
 * (the dashboard redirects to /welcome only when a user has no data at all).
 */
export async function completeOnboarding(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const live = parseStartingAmount(formData.get("live"));
  const online = parseStartingAmount(formData.get("online"));
  if (live === null || online === null)
    return { error: "Enter valid amounts (or leave blank for $0)." };

  const db = await getDb();
  await db.insert(bankrollTransactions).values([
    {
      userId: user.id,
      bankroll: "live" as const,
      type: "deposit" as const,
      amount: live,
      note: "Starting bankroll",
    },
    {
      userId: user.id,
      bankroll: "online" as const,
      type: "deposit" as const,
      amount: online,
      note: "Starting bankroll",
    },
  ]);

  revalidatePath("/", "layout");
  redirect("/");
}

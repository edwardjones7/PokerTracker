"use server";

import { revalidatePath } from "next/cache";
import { getDb, bankrollTransactions } from "@/db";
import { parseDollarsToCents } from "@/lib/money";
import { requireUser } from "@/lib/auth";
import type { ActionState } from "./sessions";

export async function addBankrollTransaction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const bankroll = formData.get("bankroll");
  if (bankroll !== "live" && bankroll !== "online")
    return { error: "Pick a bankroll." };

  const type = formData.get("type");
  if (type !== "deposit" && type !== "withdrawal")
    return { error: "Pick deposit or withdrawal." };

  const raw = formData.get("amount");
  const cents = typeof raw === "string" ? parseDollarsToCents(raw) : null;
  if (!cents || cents <= 0) return { error: "Enter a valid amount." };

  const user = await requireUser();
  const db = await getDb();
  await db.insert(bankrollTransactions).values({
    userId: user.id,
    bankroll,
    type,
    // Signed storage: withdrawals are negative.
    amount: type === "withdrawal" ? -cents : cents,
    note: String(formData.get("note") ?? "").trim(),
  });

  revalidatePath("/", "layout");
  return { error: null };
}

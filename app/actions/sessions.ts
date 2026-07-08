"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb, sessions, rebuys, type NewSession } from "@/db";
import { parseDollarsToCents } from "@/lib/money";
import { parseLocalDateTime } from "@/lib/datetime";
import { getActiveSession } from "@/lib/data";

export type ActionState = { error: string | null };

const VENUES = ["casino", "home", "online"] as const;
type VenueValue = (typeof VENUES)[number];

function parseVenue(value: FormDataEntryValue | null): VenueValue | null {
  return VENUES.includes(value as VenueValue) ? (value as VenueValue) : null;
}

function parseMoney(
  formData: FormData,
  field: string,
  { min = 0 }: { min?: number } = {},
): number | null {
  const raw = formData.get(field);
  if (typeof raw !== "string") return null;
  const cents = parseDollarsToCents(raw);
  if (cents === null || cents < min) return null;
  return cents;
}

type ParsedSessionForm = {
  venue: VenueValue;
  location: string;
  stakesSmall: number;
  stakesBig: number;
  buyIn: number;
  notes: string;
};

function parseCommonFields(formData: FormData): ParsedSessionForm | string {
  const venue = parseVenue(formData.get("venue"));
  if (!venue) return "Pick a venue (casino, home, or online).";
  const stakesSmall = parseMoney(formData, "stakesSmall", { min: 1 });
  const stakesBig = parseMoney(formData, "stakesBig", { min: 1 });
  if (!stakesSmall || !stakesBig) return "Enter valid stakes (e.g. 1 / 2).";
  if (stakesSmall > stakesBig)
    return "Small blind can't be bigger than the big blind.";
  const buyIn = parseMoney(formData, "buyIn", { min: 1 });
  if (!buyIn) return "Enter a valid buy-in amount.";
  return {
    venue,
    location: String(formData.get("location") ?? "").trim(),
    stakesSmall,
    stakesBig,
    buyIn,
    notes: String(formData.get("notes") ?? "").trim(),
  };
}

function refreshAll() {
  revalidatePath("/", "layout");
}

/** Manual entry of an already-finished session. */
export async function createPastSession(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const common = parseCommonFields(formData);
  if (typeof common === "string") return { error: common };

  const cashOut = parseMoney(formData, "cashOut");
  if (cashOut === null) return { error: "Enter a valid cash-out amount (0 if you lost it all)." };

  const tzOffset = Number(formData.get("tzOffset") ?? 0);
  const startedAt = parseLocalDateTime(
    String(formData.get("startedAt") ?? ""),
    tzOffset,
  );
  if (!startedAt) return { error: "Enter the session date and start time." };

  const hours = Number(formData.get("durationHours") ?? 0);
  const minutes = Number(formData.get("durationMinutes") ?? 0);
  const durationMs = (hours * 60 + minutes) * 60_000;
  if (!Number.isFinite(durationMs) || durationMs <= 0)
    return { error: "Enter how long you played." };

  const db = await getDb();
  await db.insert(sessions).values({
    ...common,
    cashOut,
    startedAt,
    endedAt: new Date(startedAt.getTime() + durationMs),
    status: "completed",
  } satisfies NewSession);

  refreshAll();
  redirect("/sessions");
}

export async function updateSession(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return { error: "Missing session id." };

  const common = parseCommonFields(formData);
  if (typeof common === "string") return { error: common };

  const cashOut = parseMoney(formData, "cashOut");
  if (cashOut === null) return { error: "Enter a valid cash-out amount." };

  const tzOffset = Number(formData.get("tzOffset") ?? 0);
  const startedAt = parseLocalDateTime(
    String(formData.get("startedAt") ?? ""),
    tzOffset,
  );
  if (!startedAt) return { error: "Enter the session date and start time." };

  const hours = Number(formData.get("durationHours") ?? 0);
  const minutes = Number(formData.get("durationMinutes") ?? 0);
  const durationMs = (hours * 60 + minutes) * 60_000;
  if (!Number.isFinite(durationMs) || durationMs <= 0)
    return { error: "Enter how long you played." };

  const db = await getDb();
  await db
    .update(sessions)
    .set({
      ...common,
      cashOut,
      startedAt,
      endedAt: new Date(startedAt.getTime() + durationMs),
    })
    .where(eq(sessions.id, id));

  refreshAll();
  redirect(`/sessions/${id}`);
}

export async function deleteSession(id: number): Promise<void> {
  const db = await getDb();
  await db.delete(sessions).where(eq(sessions.id, id));
  refreshAll();
  redirect("/sessions");
}

/** Live mode: start a session now. */
export async function startSession(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (await getActiveSession())
    return { error: "You already have a session running." };

  const common = parseCommonFields(formData);
  if (typeof common === "string") return { error: common };

  const db = await getDb();
  await db.insert(sessions).values({
    ...common,
    startedAt: new Date(),
    status: "active",
  } satisfies NewSession);

  refreshAll();
  redirect("/session/live");
}

export async function addRebuy(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const sessionId = Number(formData.get("sessionId"));
  if (!Number.isInteger(sessionId)) return { error: "Missing session id." };
  const amount = parseMoney(formData, "amount", { min: 1 });
  if (!amount) return { error: "Enter a valid rebuy amount." };

  const db = await getDb();
  await db.insert(rebuys).values({ sessionId, amount });
  refreshAll();
  return { error: null };
}

export async function undoRebuy(id: number): Promise<void> {
  const db = await getDb();
  await db.delete(rebuys).where(eq(rebuys.id, id));
  refreshAll();
}

/** Live mode: finish the running session. Notes are added afterwards on the
 * recap page, so leaving the table is just "type the number, done". */
export async function cashOutSession(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const sessionId = Number(formData.get("sessionId"));
  if (!Number.isInteger(sessionId)) return { error: "Missing session id." };
  const cashOut = parseMoney(formData, "cashOut");
  if (cashOut === null)
    return { error: "Enter what you cashed out (0 if you lost it all)." };

  const db = await getDb();
  await db
    .update(sessions)
    .set({ cashOut, endedAt: new Date(), status: "completed" })
    .where(eq(sessions.id, sessionId));

  refreshAll();
  redirect(`/sessions/${sessionId}?finished=1`);
}

/** Add or edit notes on a session after the fact. */
export async function updateSessionNotes(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const sessionId = Number(formData.get("sessionId"));
  if (!Number.isInteger(sessionId)) return { error: "Missing session id." };
  const notes = String(formData.get("notes") ?? "").trim();

  const db = await getDb();
  await db
    .update(sessions)
    .set({ notes })
    .where(eq(sessions.id, sessionId));

  refreshAll();
  return { error: null };
}

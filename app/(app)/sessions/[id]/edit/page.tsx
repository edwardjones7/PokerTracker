import { notFound } from "next/navigation";
import { updateSession } from "@/app/actions/sessions";
import { SessionForm } from "@/components/session-form";
import { getSessionWithRebuys } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function EditSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSessionWithRebuys(Number(id));
  if (!session) notFound();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Edit session</h1>
      <SessionForm
        mode="edit"
        action={updateSession}
        submitLabel="Save changes"
        initial={{
          id: session.id,
          venue: session.venue,
          location: session.location,
          stakesSmall: session.stakesSmall,
          stakesBig: session.stakesBig,
          buyIn: session.buyIn,
          cashOut: session.cashOut,
          startedAt: session.startedAt,
          endedAt: session.endedAt,
          notes: session.notes,
          rebuyTotal: session.rebuyTotal,
        }}
      />
    </div>
  );
}

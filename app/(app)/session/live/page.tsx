import { startSession } from "@/app/actions/sessions";
import { SessionForm } from "@/components/session-form";
import { LiveSession } from "@/components/live-session";
import { getActiveSession } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function LiveSessionPage() {
  const active = await getActiveSession();

  if (active) {
    const { rebuys, rebuyTotal: _rebuyTotal, ...session } = active;
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-semibold">Live session</h1>
        <LiveSession session={session} rebuys={rebuys} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Start a session</h1>
      <p className="text-sm text-muted-foreground">
        Sit down, buy in, hit start. Add rebuys as they happen and cash out
        when you leave.
      </p>
      <SessionForm mode="start" action={startSession} submitLabel="Start session" />
    </div>
  );
}
